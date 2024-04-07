import { makeAutoObservable } from 'mobx';
import { NodeMap } from './base';
import { StepTaskNode } from './stepTask';
import { AgentActionNode } from './action';
import { AgentSelection } from './selection';
import { IApiStepTask, IGeneratedPlan } from '@/apis/generate-base-plan';

export class PlanManager {
  public goal: string = '';

  public nextStepTaskId: number = 0;

  public nextAgentSelectionId: number = 0;

  public nextAgentActionId: number = 0;

  public stepTaskMap: NodeMap<StepTaskNode> = new Map();

  public agentActionMap: NodeMap<AgentActionNode> = new Map();

  public agentSelectionMap: Map<string, AgentSelection> = new Map();

  public actionSelectionMap: Map<string, string> = new Map();

  public selectionStepMap: Map<string, string> = new Map();

  public stepTaskRoots: string[] = [];

  public currentStepTaskLeaf?: string;

  public previewStepTaskLeaf?: string;

  public inputs: string[] = [];

  public branches: Record<
    string,
    { start?: string; requirement?: string; base?: string }
  > = {};

  public get leaves() {
    return Object.keys(this.branches);
  }

  public get currentPlan() {
    const path: StepTaskNode[] = [];
    let node = this.stepTaskMap.get(
      this.previewStepTaskLeaf ?? this.currentStepTaskLeaf ?? '',
    );
    while (node) {
      path.push(node);
      node = node.last;
    }
    return path.reverse();
  }

  public get currentPath() {
    return this.currentPlan.map(node => node.id);
  }

  public get activeStepNodeIds() {
    return new Set<string>(this.currentPath);
  }

  public get apiPlan() {
    return {
      goal: this.goal,
      inputs: this.inputs,
      process: this.currentPlan.map(node => node.apiStepTask),
    };
  }

  constructor() {
    makeAutoObservable(this);
  }

  public parseApiPlan(plan: IGeneratedPlan) {
    this.goal = plan.goal;
    this.inputs = [...plan.inputs];
    const leaf = this.insertProcess(plan.process);
    this.currentStepTaskLeaf = leaf;
  }

  public insertProcess(
    process: IApiStepTask[],
    start?: string,
    requirement?: string,
    base?: string,
  ): string {
    if (start && !this.stepTaskMap.has(start)) {
      throw new Error(`StekTask node ${start} does not exist!`);
    }
    let lastChidrenList =
      this.stepTaskMap.get(start ?? '')?.children ?? this.stepTaskRoots;
    const path = [...(this.stepTaskMap.get(start ?? '')?.path ?? [])];
    for (const task of process) {
      // create agentSelection
      const agentSelection = new AgentSelection(this, {
        id: (this.nextAgentSelectionId++).toString(),
        agents: task.agents,
      });
      const leaf = agentSelection.insertActions(task.process);
      this.agentSelectionMap.set(agentSelection.id, agentSelection);
      agentSelection.currentActionLeaf = leaf;
      // create stepTask
      path.push((this.nextStepTaskId++).toString());
      const node = new StepTaskNode(this, {
        name: task.name,
        content: task.content,
        inputs: task.inputs,
        output: task.output,
        brief: task.brief,
        path,
        agentSelectionIds: [agentSelection.id],
        currentAgentSelection: agentSelection.id,
      });
      lastChidrenList.push(node.id);
      lastChidrenList = node.children;
      this.selectionStepMap.set(agentSelection.id, node.id);
      this.stepTaskMap.set(node.id, node);
    }
    const leaf = path[path.length - 1];
    this.branches[leaf] = { start, requirement, base };
    return leaf;
  }

  public reset() {
    this.goal = '';
    this.stepTaskMap.clear();
    this.agentActionMap.clear();
    this.agentSelectionMap.clear();
    this.stepTaskRoots = [];
    this.inputs = [];
    this.currentStepTaskLeaf = undefined;
    this.previewStepTaskLeaf = undefined;
    this.nextAgentActionId = 0;
    this.nextAgentSelectionId = 0;
    this.nextStepTaskId = 0;
  }

  public dump() {
    return {
      goal: this.goal,
      nextStepTaskId: this.nextStepTaskId,
      nextAgentSelectionId: this.nextAgentSelectionId,
      nextAgentActionId: this.nextAgentActionId,
      stepTaskMap: Array.from(this.stepTaskMap).map(([k, v]) => [k, v.dump()]),
      agentActionMap: Array.from(this.agentActionMap).map(([k, v]) => [
        k,
        v.dump(),
      ]),
      agentSelectionMap: Array.from(this.agentSelectionMap).map(([k, v]) => [
        k,
        v.dump(),
      ]),
      stepTaskRoots: [...this.stepTaskRoots],
      inputs: [...this.inputs],
      currentStepTaskLeaf: this.currentStepTaskLeaf,
      previewStepTaskLeaf: this.previewStepTaskLeaf,
      branch: JSON.parse(JSON.stringify(this.branches)),
    };
  }

  public load(json: any) {
    this.reset();
    this.goal = json.goal;
    this.nextStepTaskId = json.nextStepTaskId;
    this.nextAgentSelectionId = json.nextAgentSelectionId;
    this.nextAgentActionId = json.nextAgentActionId;
    for (const [k, v] of json.agentActionMap) {
      this.agentActionMap.set(k, new AgentActionNode(this, v));
    }
    for (const [k, v] of json.agentSelectionMap) {
      const selection = new AgentSelection(this, v);
      for (const leaf of selection.leaves) {
        let node = this.agentActionMap.get(leaf);
        while (node) {
          this.actionSelectionMap.set(node.id, selection.id);
          node = node.last;
        }
      }
      this.agentSelectionMap.set(k, selection);
    }
    for (const [k, v] of json.stepTaskMap) {
      const stepTask = new StepTaskNode(this, v);
      for (const id of stepTask.agentSelectionIds) {
        this.selectionStepMap.set(id, stepTask.id);
      }
      this.stepTaskMap.set(k, stepTask);
    }
    this.stepTaskRoots = [...json.stepTaskRoots];
    this.inputs = [...json.inputs];
    this.currentStepTaskLeaf = json.currentStepTaskLeaf;
    this.previewStepTaskLeaf = json.previewStepTaskLeaf;
    this.branches = JSON.parse(JSON.stringify(json.branch));
  }
}
