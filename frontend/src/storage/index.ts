/* eslint-disable max-lines */
import React from 'react';
import { SxProps } from '@mui/material';
import throttle from 'lodash/throttle';
import { makeAutoObservable } from 'mobx';
import {
  PlanManager,
  ActionType,
  RehearsalLog,
  StepTaskNode,
  AgentSelection,
} from './plan';
import { debug } from './debug';
import { getAgentActionStyle } from '@/storage/plan';
import { IAgent, getAgentsApi } from '@/apis/get-agents';
import {
  IApiStepTask,
  IApiAgentAction,
  genBasePlanApi,
} from '@/apis/generate-base-plan';
import { ExecuteNodeType, executePlanApi } from '@/apis/execute-plan';
import { newPlanBranchApi } from '@/apis/new-plan-branch';
import { fillStepTaskApi } from '@/apis/fill-step-task';
import { newActionBranchApi } from '@/apis/new-action-branch';
import {
  agentSelectModifyInitApi,
  agentSelectModifyAddApi,
} from '@/apis/agent-select-modify';
import { fillAgentSelectionApi } from '@/apis/fill-agent-selection';
import { IconName } from '@/components/AgentIcon';
import { setAgentsApi } from '@/apis/set-agents';

export interface IAgentAction {
  type: ActionType;
  inputs: string[];
  description: string;
  style: SxProps;
}

export interface IAgentCard extends IAgent {
  actions: IAgentAction[];
  inuse: boolean;
  lastOfUsed: boolean;
  ref: React.RefObject<HTMLElement>;
}

export interface IPlanTreeNode {
  id: string;
  name: string;
  agents: string[];
  agentIcons: string[];
  leaf: boolean;
  children: IPlanTreeNode[];
  requirement?: string;
  baseBranchLeafId?: string;
  focusing: boolean;
}

export interface IAgentActionTreeNode {
  id: string;
  agent: string;
  icon: string;
  leaf: boolean;
  children: IAgentActionTreeNode[];
  requirement?: string;
  baseBranchLeafId?: string;
  style: SxProps;
  action: { type: ActionType; description: string };
  focusing: boolean;
}

export interface IRenderingAgentSelections {
  heatdata: Record<string, Record<string, { score: number; reason: string }>>;
  selections: Record<string, { id: string; agents: string[] }>;
  current?: string;
}

export class ApiState {
  public planReady: boolean = false;

  public agentsReady: boolean = false;

  public fetchingAgents: boolean = false;

  public planGenerating: boolean = false;

  public stepTaskTreeGenerating: boolean = false;

  public agentActionTreeGenerating: boolean = false;

  public agentAspectScoresGenerating: boolean = false;

  public planExecuting: boolean = false;

  public get busy() {
    return (
      this.fetchingAgents ||
      this.planGenerating ||
      this.stepTaskTreeGenerating ||
      this.agentActionTreeGenerating ||
      this.planExecuting ||
      this.agentAspectScoresGenerating
    );
  }

  public get ready() {
    return this.planReady && this.agentsReady && !this.busy;
  }

  constructor() {
    makeAutoObservable(this);
  }
}

export class FormState {
  public goal: string = '';

  public inputs: Record<string, string> = {};

  constructor() {
    makeAutoObservable(this);
  }
}

const blankPlan = new PlanManager();
const blankLog = new RehearsalLog(blankPlan);

export class GlobalStorage {
  // 开发模式没有持久化
  public devMode: boolean = true;

  public planModificationWindow: boolean = false;

  public taskProcessModificationWindow: boolean = false;

  public agentAssigmentWindow: boolean = false;

  public briefGoal: string = '';

  public briefUserInputs: Record<string, string> = {};

  public planTabArrange: string[] = [];

  public plans: Record<string, [PlanManager, RehearsalLog]> = {};

  public currentPlanId?: string;

  public api: ApiState = new ApiState();

  public form: FormState = new FormState();

  public agentMap: Map<string, IAgent> = new Map();

  public focusingStepTaskIds: Record<string, string | undefined> = {};

  public get focusingStepTaskId() {
    return this.focusingStepTaskIds[this.currentPlanId ?? ''];
  }

  public get planManager() {
    return this.plans[this.currentPlanId ?? '']?.[0] ?? blankPlan;
  }

  public get logManager() {
    return this.plans[this.currentPlanId ?? '']?.[1] ?? blankLog;
  }

  public get availiableAgents(): IAgent[] {
    return Array.from(this.agentMap.values());
  }

  public get focusingStepTask() {
    if (this.focusingStepTaskId) {
      return this.planManager.stepTaskMap.get(this.focusingStepTaskId);
    }
    return undefined;
  }

  public get currentFocusingAgentSelection() {
    return this.focusingStepTask?.agentSelection;
  }

  public get agentCardsInUse(): IAgentCard[] {
    const map = new Map<string, IAgentCard>();
    for (const action of this.currentFocusingAgentSelection
      ?.currentTaskProcess ?? []) {
      const agent = map.get(action.agent) ?? {
        ...(this.agentMap.get(action.agent) ?? {
          name: action.agent,
          profile: '<Unknown agent>',
          icon: IconName.Unknown,
        }),
        actions: [],
        inuse: true,
        lastOfUsed: false,
        ref: React.createRef(),
      };
      agent.actions.push({
        type: action.type,
        inputs: action.inputs,
        description: action.description,
        style: getAgentActionStyle(action.type),
      });
      map.set(action.agent, agent);
    }
    for (const agent of this.currentFocusingAgentSelection?.agents ?? []) {
      if (!map.has(agent)) {
        map.set(agent, {
          ...(this.agentMap.get(agent) ?? {
            name: agent,
            profile: '<Unknown agent>',
            icon: IconName.Unknown,
          }),
          actions: [],
          inuse: false,
          lastOfUsed: false,
          ref: React.createRef(),
        });
      }
    }
    const t = Array.from(map.values());
    for (let i = t.length - 1; i >= 0; i--) {
      if (t[i].inuse) {
        t[i].lastOfUsed = true;
        break;
      }
    }
    return t;
  }

  public get agentCards(): IAgentCard[] {
    const { agentCardsInUse } = this;
    const agentCards: IAgentCard[] = [...agentCardsInUse];
    const agentInUse = new Map<string, IAgentCard>(
      agentCardsInUse.map(card => [card.name, card]),
    );
    for (const agent of this.availiableAgents) {
      if (!agentInUse.has(agent.name)) {
        agentCards.push({
          ...agent,
          actions: [],
          inuse: false,
          lastOfUsed: false,
          ref: React.createRef(),
        });
      }
    }
    return agentCards;
  }

  get outlineCardRefMap() {
    return new Map(
      this.outlineRenderingStepTaskCards.map(card => [card.id, card.ref]),
    );
  }

  get agentCardRefMap() {
    return new Map(this.agentCards.map(card => [card.name, card.ref]));
  }

  get descriptionCardRefMap() {
    return new Map(
      this.planManager.currentPlan
        .map(node => node.descriptionCard)
        .map(card => [card.id, card.ref]),
    );
  }

  get logCardRefMap() {
    return new Map(
      this.logManager.renderingLog.map(card => [card.id, card.ref]),
    );
  }

  public get refMap(): Record<
    'OutlineCard' | 'AgentCard' | 'DiscriptionCard' | 'RehearsalLogCard',
    Map<string, React.RefObject<HTMLElement>>
  > {
    return {
      OutlineCard: this.outlineCardRefMap,
      AgentCard: this.agentCardRefMap,
      DiscriptionCard: this.descriptionCardRefMap,
      RehearsalLogCard: this.logCardRefMap,
    };
  }

  public get ElementToLink(): [
    React.RefObject<HTMLElement> | undefined,
    React.RefObject<HTMLElement>[],
    React.RefObject<HTMLElement> | undefined,
    (React.RefObject<HTMLElement> | undefined)[],
  ] {
    return [
      this.refMap.OutlineCard.get(this.focusingStepTaskId ?? ''),
      this.focusingStepTask?.agentSelection?.agents?.map(
        agent => this.refMap.AgentCard.get(agent) ?? [],
      ) ?? ([] as any),
      this.refMap.DiscriptionCard.get(this.focusingStepTaskId ?? ''),
      this.logManager.outdate
        ? []
        : [
            this.refMap.RehearsalLogCard.get(this.focusingStepTask?.name ?? ''),
            this.refMap.RehearsalLogCard.get(
              this.focusingStepTask?.output ?? '',
            ),
          ],
    ];
  }

  public get agentIconMap() {
    return new Map(
      this.availiableAgents.map(agent => [agent.name, agent.icon]),
    );
  }

  public get userInputs() {
    return Object.keys(this.form.inputs);
  }

  public get outlineRenderingStepTaskCards() {
    const { agentIconMap } = this;
    return this.planManager.currentPlan
      .map(node => node.outlineCard)
      .map(card => ({
        ...card,
        agentIcons: card.agents.map(agent => agentIconMap.get(agent)!) ?? [
          'Unknown',
        ],
      }));
  }

  public get currentStepTaskNodeSet() {
    let leaf = this.planManager.currentStepTaskLeaf;
    const set = new Set<string>();
    while (leaf) {
      set.add(leaf);
      leaf = this.planManager.stepTaskMap.get(leaf)?.last?.id;
    }
    return set;
  }

  public get previewStepTaskNodeSet() {
    let leaf = this.planManager.previewStepTaskLeaf;
    const set = new Set<string>();
    while (leaf) {
      set.add(leaf);
      leaf = this.planManager.stepTaskMap.get(leaf)?.last?.id;
    }
    return set;
  }

  public get renderingPlanForest(): IPlanTreeNode[] {
    // 递归地构建
    const buildSubtree = (stepTaskId: string): IPlanTreeNode => {
      const stepTask = this.planManager.stepTaskMap.get(stepTaskId);
      if (!stepTask) {
        throw new Error(`StepTask ${stepTaskId} not found`);
      }
      const agents = stepTask.agentSelection?.agents ?? [];
      const agentIcons = agents.map(agent => this.agentIconMap.get(agent)!) ?? [
        'Unknown',
      ];
      const branchInfo = this.planManager.branches[stepTaskId];
      return {
        id: stepTaskId,
        name: stepTask.name,
        agents,
        agentIcons,
        leaf: branchInfo !== undefined,
        children: stepTask.children.map(buildSubtree),
        focusing: this.planManager.activeStepNodeIds.has(stepTaskId),
        ...(branchInfo && {
          requirement: branchInfo.requirement,
          baseBranchLeafId: branchInfo.base,
        }),
      };
    };
    return this.planManager.stepTaskRoots.map(root => buildSubtree(root));
  }

  public get renderingActionForest(): IAgentActionTreeNode[] {
    const selection = this.focusingStepTask?.agentSelection;
    if (!selection) {
      return [];
    }
    const buildSubtree = (actionId: string): IAgentActionTreeNode => {
      const action = this.planManager.agentActionMap.get(actionId);
      if (!action) {
        throw new Error(`AgentAction ${actionId} not found`);
      }
      const branchInfo = selection.branches[actionId];
      return {
        id: actionId,
        agent: action.agent,
        icon: this.agentIconMap.get(action.agent)!,
        leaf: branchInfo !== undefined,
        children: action.children.map(buildSubtree),
        style: getAgentActionStyle(action.type),
        ...(branchInfo && {
          requirement: branchInfo.requirement,
          baseBranchLeafId: branchInfo.base,
        }),
        action: { type: action.type, description: action.description },
        focusing: selection.activeTaskIds.has(actionId),
      };
    };
    return selection.actionRoot.map(root => buildSubtree(root));
  }

  public get renderingAgentSelections(): IRenderingAgentSelections {
    const stepTask = this.focusingStepTask;
    if (!stepTask) {
      return {
        heatdata: {},
        selections: {},
      };
    }
    if (Object.keys(stepTask.heatmap).length === 0) {
      this.touchAgentSelectionAspects();
    }
    const selections = Object.fromEntries(
      stepTask.allSelections.map(selection => [
        selection.id,
        {
          id: selection.id,
          agents: selection.agents,
        },
      ]),
    );
    return {
      selections,
      heatdata: stepTask.heatmap,
      current: stepTask.currentAgentSelection,
    };
  }

  public get currentActionNodeSet() {
    const selection = this.planManager.agentSelectionMap.get(
      this.currentFocusingAgentSelection?.id ?? '',
    );
    const set = new Set<string>();
    if (selection) {
      const currentLeafId = selection.currentActionLeaf!;
      let leaf = this.planManager.agentActionMap.get(currentLeafId);
      while (leaf) {
        set.add(leaf.id);
        leaf = leaf.last;
      }
    }

    return set;
  }

  public get rehearsalSvgObjectOrder() {
    return [
      ...Object.keys(this.form.inputs).map(name => `Object.${name}`),
      ...this.logManager.renderingLog.map(step =>
        step.type === ExecuteNodeType.Step
          ? `Step.${step.id}`
          : `Object.${step.id}`,
      ),
    ];
  }

  public get rehearsalSvgLines() {
    return this.logManager.renderingLog
      .map(step =>
        step.type === ExecuteNodeType.Step
          ? step.history.map(item =>
              item.inputs.map(input => {
                const inputStr = input.split(':', 2);
                let inputName = '';
                if (inputStr[0] === 'ActionResult') {
                  inputName = `Action.${step.id}.${inputStr[1]}`;
                } else if (inputStr[0] === 'InputObject') {
                  inputName = `Object.${inputStr[1]}`;
                } else if (
                  this.logManager.renderingLog
                    .filter(item => item.type === 'object')
                    .find(r => r.id === input)
                ) {
                  inputName = `Object.${input}`;
                } else if (step.history.find(r => r.id === input)) {
                  inputName = `Action.${step.id}.${input}`;
                }
                return {
                  from: inputName,
                  to: `Action.${step.id}.${item.id}`,
                  type: item.type,
                };
              }),
            )
          : [],
      )
      .flat(2)
      .flat()
      .filter(line => line.from && line.to);
  }

  public get renderingIOLines() {
    return this.logManager.renderingLog
      .filter(r => r.type === 'step')
      .map((step: any) => {
        return [
          {
            type: 'output',
            from: `Step.${step.id}`,
            to: `Object.${step.output}`,
          },
          ...step.inputs.map((input: string) => ({
            type: 'input',
            from: `Object.${input}`,
            to: `Step.${step.id}`,
          })),
        ];
      })
      .flat();
  }

  constructor() {
    makeAutoObservable(this);
  }

  public async setAgents(agents: IAgent[]) {
    this.api.fetchingAgents = true;
    await setAgentsApi(agents);
    this.agentMap = new Map(agents.map(agent => [agent.name, agent]));
    this.api.agentsReady = true;
    this.api.fetchingAgents = false;
  }

  public async getAgents() {
    this.api.fetchingAgents = true;
    const agents = await getAgentsApi();
    this.api.fetchingAgents = false;
    this.agentMap = new Map(agents.map(agent => [agent.name, agent]));
    this.api.agentsReady = true;
  }

  public async generatePlanBase() {
    this.api.planGenerating = true;
    try {
      const { goal, inputs } = this.form;
      const plan = await genBasePlanApi({
        goal,
        inputs: Object.keys(inputs),
      });
      const planManager = new PlanManager();
      planManager.parseApiPlan(plan);
      const logManager = new RehearsalLog(planManager);
      // 随机字符串
      let planId = Math.random().toString(36).slice(2);
      while (this.plans[planId]) {
        planId = Math.random().toString(36).slice(2);
      }
      this.plans[planId] = [planManager, logManager];
      this.planTabArrange.push(planId);
      this.focusPlan(planId);
      // 清空
      this.briefGoal = '';
      this.briefUserInputs = {};
    } catch (e) {
      console.error(e);
    }
    this.api.planGenerating = false;
  }

  public async executePlan(count = 1) {
    this.api.planExecuting = true;
    try {
      const log = [];
      // 前面添加 this.form.inputs 的记录
      for (const [key, value] of Object.entries(this.form.inputs)) {
        log.push({
          type: ExecuteNodeType.Object,
          id: key,
          content: value,
        });
      }
      // log.push(...this.logManager.logWithoutUserInput);
      const plan = this.planManager.apiPlan;
      const logs = await executePlanApi({
        plan,
        stepsToRun: count,
        rehearsalLog: log as any,
      });
      this.logManager.updateLog(logs);
    } catch (e) {
      console.error(e);
    }
    this.api.planExecuting = false;
  }

  public async newPlanBranch(
    start: string | undefined,
    requirement: string,
    batch = 1,
    base?: string,
  ) {
    this.api.stepTaskTreeGenerating = true;
    try {
      const existingSteps: IApiStepTask[] = [];
      const baseSteps: IApiStepTask[] = [];

      // 构建前后序列
      if (start) {
        let node = this.planManager.stepTaskMap.get(start);
        while (node) {
          existingSteps.push(node.apiStepTask);
          node = node.last;
        }
        existingSteps.reverse();
      }
      if (base) {
        let node = this.planManager.stepTaskMap.get(base);
        while (node) {
          baseSteps.push(node.apiStepTask);
          node = node.last;
        }
        baseSteps.reverse();
      }

      const branches = await newPlanBranchApi({
        goal: this.planManager.goal,
        inputs: this.planManager.inputs,
        batch,
        requirement,
        base: baseSteps,
        existing: existingSteps,
      });
      const branchLeaves = branches.map(branch =>
        this.planManager.insertProcess(branch, start, requirement, base),
      );

      // 延迟加载
      const stepTaskToFill: [StepTaskNode, AgentSelection][] = [];
      for (const branch of branchLeaves) {
        let node = this.planManager.stepTaskMap.get(branch);
        while (node && node.id !== start) {
          stepTaskToFill.push([node, node.agentSelection!]);
          node = node.last;
        }
      }
      const fillTask = async (
        node: StepTaskNode,
        selection: AgentSelection,
      ) => {
        const filled = await fillStepTaskApi({
          goal: this.planManager.goal,
          stepTask: node.apiStepTask,
        });
        const leaf = selection.insertActions(filled.process);
        selection.currentActionLeaf = leaf;
        selection.agents.push(...filled.agents);
      };
      (async () => {
        try {
          for (const [node, selection] of stepTaskToFill) {
            await fillTask(node, selection);
          }
        } catch (e) {
          console.error(e);
        }
        this.api.stepTaskTreeGenerating = false;
      })();
      return branchLeaves;
    } catch (e) {
      console.error(e);
    }
    this.api.stepTaskTreeGenerating = false;
    return [];
  }

  public setCurrentAgentActionBranch(
    actionBranchLeafId: string,
    selectionId?: string,
  ) {
    const selection = this.planManager.agentSelectionMap.get(
      selectionId ?? this.focusingStepTask?.agentSelection?.id ?? '',
    );
    if (selection?.leaves.includes(actionBranchLeafId)) {
      selection.currentActionLeaf = actionBranchLeafId;
      this.logManager.setOutdate();
    }
  }

  public updateAgentActionNodeContent(id: string, content: string) {
    const actionNode = this.planManager.agentActionMap.get(id);
    if (actionNode) {
      actionNode.description = content;
      this.logManager.setOutdate();
    }
  }

  public async newActionBranch(
    agentSelectionId: string | undefined,
    start: string | undefined,
    requirement: string,
    batch = 1,
    base?: string,
  ) {
    const agentSelection = agentSelectionId
      ? this.planManager.agentSelectionMap.get(agentSelectionId)
      : this.focusingStepTask?.agentSelection;
    if (!agentSelection) {
      throw new Error(`AgentSelection ${agentSelectionId} not found`);
    }
    const taskNode = agentSelection.belongingStepTask;
    if (!taskNode) {
      throw new Error(`Beloning StepTask node not found`);
    }
    this.api.agentActionTreeGenerating = true;
    try {
      const existingSteps: IApiAgentAction[] = [];
      const baseSteps: IApiAgentAction[] = [];

      // 构建前后序列
      if (start) {
        let node = this.planManager.agentActionMap.get(start);
        while (node) {
          existingSteps.push(node.apiAgentAction);
          node = node.last;
        }
        existingSteps.reverse();
      }
      if (base) {
        let node = this.planManager.agentActionMap.get(base);
        while (node) {
          baseSteps.push(node.apiAgentAction);
          node = node.last;
        }
        baseSteps.reverse();
      }

      const branches = await newActionBranchApi({
        goal: this.planManager.goal,
        stepTask: taskNode.apiStepTask,
        requirement,
        base: baseSteps,
        existing: existingSteps,
        batch,
      });
      const branchLeaves = branches.map(branch => {
        return agentSelection.insertActions(branch, start, requirement, base);
      });
      this.api.agentActionTreeGenerating = false;
      return branchLeaves;
    } catch (e) {
      console.error(e);
    }
    this.api.agentActionTreeGenerating = false;
    return [];
  }

  public async touchAgentSelectionAspects(stepTaskId?: string) {
    const stepTask = this.planManager.stepTaskMap.get(
      stepTaskId ?? this.focusingStepTaskId ?? '',
    );
    if (stepTask && Object.keys(stepTask.agentAspectScores).length === 0) {
      this.api.agentAspectScoresGenerating = true;
      try {
        const aspects = await agentSelectModifyInitApi({
          stepTask: stepTask.apiStepTask,
          goal: this.planManager.goal,
        });

        for (const [aspect, agentScores] of Object.entries(aspects)) {
          stepTask.appendAspectScore(aspect, agentScores);
        }
      } catch (e) {
        console.error(e);
      }
      this.api.agentAspectScoresGenerating = false;
    }
  }

  public async addAgentSelectionAspects(
    aspects: string[] | string,
    stepTaskId?: string,
  ) {
    const stepTask = this.planManager.stepTaskMap.get(
      stepTaskId ?? this.focusingStepTaskId ?? '',
    );
    if (stepTask) {
      this.api.agentAspectScoresGenerating = true;
      try {
        const aspects_ = await agentSelectModifyAddApi({
          aspects: Array.isArray(aspects) ? aspects : [aspects],
        });
        for (const [aspect, agentScores] of Object.entries(aspects_)) {
          stepTask.appendAspectScore(aspect, agentScores);
        }
      } catch (e) {
        console.error(e);
      }
      this.api.agentAspectScoresGenerating = false;
    }
  }

  public async addAgentSelection(agents: string[]) {
    if (!this.focusingStepTask) {
      return;
    }
    this.api.agentActionTreeGenerating = true;
    try {
      const { apiStepTask } = this.focusingStepTask;
      const selectionId = (this.planManager.nextAgentSelectionId++).toString();
      const agentSelection = new AgentSelection(this.planManager, {
        id: selectionId,
        agents,
      });
      this.planManager.selectionStepMap.set(
        selectionId,
        this.focusingStepTaskId ?? '',
      );
      this.planManager.agentSelectionMap.set(agentSelection.id, agentSelection);
      this.focusingStepTask.agentSelectionIds.push(agentSelection.id);
      const filled = await fillAgentSelectionApi({
        stepTask: apiStepTask,
        goal: this.planManager.goal,
        agents,
      });
      const leaf = agentSelection.insertActions(filled.process);
      agentSelection.currentActionLeaf = leaf;
      this.setCurrentAgentSelection(agentSelection.id);
    } catch (e) {
      console.error(e);
    }
    this.api.agentActionTreeGenerating = false;
  }

  renderLines_?: () => void = () => undefined;

  public setRenderLinesMethod(method?: () => void) {
    if (method) {
      this.renderLines_ = throttle(() => requestAnimationFrame(method), 5, {
        leading: false,
        trailing: true,
      });
    } else {
      this.renderLines_ = undefined;
    }
  }

  public renderLines({
    delay = 0,
    repeat = 1,
    interval = 30,
  }: {
    delay?: number;
    repeat?: number;
    interval?: number;
  }) {
    setTimeout(() => {
      let count = 0;
      const id = setInterval(() => {
        if (count >= repeat) {
          clearInterval(id);
          return;
        }
        this.renderLines_?.();
        count++;
      }, interval);
    }, delay);
  }

  public setFocusingStepTaskId(id?: string) {
    this.focusingStepTaskIds[this.currentPlanId ?? ''] = id;
  }

  public addUserInput(name: string) {
    this.form.inputs[name] ??= '';
    if (this.currentPlanId && !this.planManager.inputs.includes(name)) {
      this.planManager.inputs.push(name);
      this.logManager.userInputs[name] ??= '';
      this.logManager.setOutdate();
    }
  }

  public removeUserInput(name: string) {
    delete this.form.inputs[name];
    if (this.currentPlanId) {
      this.planManager.inputs = this.planManager.inputs.filter(i => i !== name);
      delete this.logManager.userInputs[name];
      this.logManager.setOutdate();
    }
  }

  public setUserInput(name: string, content: string) {
    if (this.form.inputs[name] !== undefined) {
      this.form.inputs[name] = content;
      if (this.currentPlanId) {
        this.logManager.userInputs[name] = content;
        this.logManager.setOutdate();
      }
    }
  }

  public setCurrentPlanBranch(leafId: string) {
    if (leafId in this.planManager.branches) {
      this.planManager.currentStepTaskLeaf = leafId;
      this.logManager.setOutdate();
    }
  }

  public setCurrentAgentSelection(selectionId: string, stepTaskId?: string) {
    const stepTask = this.planManager.stepTaskMap.get(
      stepTaskId ?? this.focusingStepTaskId ?? '',
    );
    if (!stepTask) {
      throw new Error(`StepTask node ${stepTaskId} does not exist!`);
    }
    if (
      !this.planManager.agentSelectionMap.has(selectionId) ||
      !stepTask.agentSelectionIds.includes(selectionId)
    ) {
      throw new Error(`AgentSelection node ${selectionId} does not exist!`);
    }
    stepTask.currentAgentSelection = selectionId;
    this.logManager.setOutdate();
  }

  public addStepTaskInput(id: string, input: string) {
    const stepTask = this.planManager.stepTaskMap.get(id);
    if (stepTask) {
      const t = Array.from(new Set([...stepTask.inputs, input]));
      stepTask.inputs.length = 0;
      stepTask.inputs.push(...t);
      this.logManager.setOutdate();
    }
  }

  public removeStepTaskInput(id: string, input: string) {
    const stepTask = this.planManager.stepTaskMap.get(id);
    if (stepTask) {
      stepTask.inputs = stepTask.inputs.filter(i => i !== input);
      this.logManager.setOutdate();
    }
  }

  public setStepTaskContent(id: string, content: string) {
    const stepTask = this.planManager.stepTaskMap.get(id);
    if (stepTask) {
      stepTask.content = content;
      this.logManager.setOutdate();
    }
  }

  public getStepTaskLeafPath(leafId: string) {
    const stepTask = this.planManager.stepTaskMap.get(leafId);
    if (stepTask) {
      return stepTask.path;
    } else {
      return [];
    }
  }

  public getFirstLeafStepTask(nodeId: string) {
    let stepTask = this.planManager.stepTaskMap.get(nodeId)!;
    while (!this.planManager.branches[stepTask.id]) {
      const firstChildId = stepTask.children[0];
      stepTask = this.planManager.stepTaskMap.get(firstChildId)!;
    }
    return stepTask;
  }

  public getFirstLeafAction(nodeId: string) {
    const selection = this.focusingStepTask?.agentSelection;
    let actionNode = this.planManager.agentActionMap.get(nodeId);
    if (actionNode && selection) {
      while (!selection.branches[actionNode.id]) {
        const firstChildId: string = actionNode.children[0];
        actionNode = this.planManager.agentActionMap.get(firstChildId)!;
      }
      return {
        node: actionNode,
        branchInfo: selection.branches[actionNode.id],
      };
    }
    return undefined;
  }

  public getActionLeafPath(leafId: string) {
    const actionNode = this.planManager.agentActionMap.get(leafId);
    return actionNode?.path ?? [];
  }

  public removePlan(id: string) {
    if (id === this.currentPlanId) {
      // 寻找 planTabArrange 中邻近的替代
      const index = this.planTabArrange.indexOf(id);
      if (index !== -1) {
        const next = this.planTabArrange[index + 1];
        const prev = this.planTabArrange[index - 1];
        this.currentPlanId = next ?? prev ?? undefined;
      } else {
        this.currentPlanId = this.planTabArrange[0] ?? undefined;
      }
      this.focusPlan(this.currentPlanId);
    }
    this.planTabArrange = this.planTabArrange.filter(tabId => tabId !== id);
    delete this.plans[id];
    delete this.focusingStepTaskIds[id];
  }

  public dumpPlan(id: string) {
    const [plan, log] = this.plans[id];
    return {
      id,
      plan: plan.dump(),
      log: log.dump(),
    };
  }

  public loadPlan(json: any, focus = false) {
    const { id, plan, log } = json;
    const planManager = new PlanManager();
    planManager.load(plan);
    const logManager = new RehearsalLog(planManager, log);
    this.plans[id] = [planManager, logManager];
    this.planTabArrange.push(id);
    if (focus) {
      this.focusPlan(id);
    }
  }

  public dump() {
    const plans: any[] = [];
    for (const planId in this.plans) {
      plans.push(this.dumpPlan(planId));
    }
    return {
      plans,
      planTabArrange: [...this.planTabArrange],
      currentPlanId: this.currentPlanId,
      briefGoal: this.briefGoal,
      briefUserInputs: JSON.parse(JSON.stringify(this.briefUserInputs)),
    };
  }

  public load(json: any) {
    for (const plan of json.plans ?? []) {
      this.loadPlan(plan);
    }
    this.briefGoal = json.briefGoal ?? '';
    this.briefUserInputs = JSON.parse(
      JSON.stringify(json.briefUserInputs ?? {}),
    );
    this.planTabArrange = json.planTabArrange ?? Object.keys(this.plans);
    this.focusPlan(json.currentPlanId);
  }

  public newPlanTab() {
    this.focusPlan(undefined);
  }

  public focusPlan(id?: string) {
    if (this.currentPlanId === undefined) {
      this.briefGoal = this.form.goal;
      // clear all ele of briefUserInputs
      for (const key in this.briefUserInputs) {
        delete this.briefUserInputs[key];
      }
      const newInputs = JSON.parse(JSON.stringify(this.form.inputs));
      for (const key in newInputs) {
        this.briefUserInputs[key] = newInputs[key];
      }
    }
    if (id && this.plans[id]) {
      this.currentPlanId = id;
      this.api.planReady = true;
      this.form.goal = this.planManager.goal;
      for (const key in this.form.inputs) {
        delete this.form.inputs[key];
      }
      for (const key in this.logManager.userInputs) {
        this.form.inputs[key] = this.logManager.userInputs[key];
      }
    } else {
      this.currentPlanId = undefined;
      this.api.planReady = false;
      this.form.goal = this.briefGoal;
      for (const key in this.form.inputs) {
        delete this.form.inputs[key];
      }
      const newInputs = JSON.parse(JSON.stringify(this.briefUserInputs));
      for (const key in newInputs) {
        this.form.inputs[key] = newInputs[key];
      }
    }
  }
}

export const globalStorage = new GlobalStorage();
(globalThis as any).globalStorage = globalStorage;

// const sleep = (time: number) =>
//   new Promise(resolve => setTimeout(resolve, time));
// let renderLock = false;
// autorun(async () => {
//   if (renderLock) {
//     return;
//   }
//   renderLock = true;
//   let partialReadyCountdown = -1;
//   try {
//     while (true) {
//       if (!globalStorage.renderLines_ || !globalStorage.focusingStepTaskId) {
//         return;
//       }
//       const { ElementToLink } = globalStorage;
//       if (
//         ElementToLink[0]?.current === undefined ||
//         ElementToLink[2]?.current === undefined ||
//         ElementToLink[1].filter(ref => ref.current !== undefined).length === 0
//       ) {
//         await sleep(5);
//         continue;
//       } else if (
//         ElementToLink[3].filter(ref => ref?.current !== undefined).length === 0
//       ) {
//         if (partialReadyCountdown < 0) {
//           partialReadyCountdown = 10;
//           globalStorage.renderLines({ delay: 0, repeat: 10, interval: 15 });
//           await sleep(5);
//           continue;
//         } else if (--partialReadyCountdown === 0) {
//           break;
//         }
//       }
//       break;
//     }
//     globalStorage.renderLines({ delay: 0, repeat: 40, interval: 15 });
//   } catch (e) {
//     console.error(e);
//   }
//   renderLock = false;
// });

debug(globalStorage);
/* eslint-enable max-lines */
