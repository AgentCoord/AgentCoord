import { makeAutoObservable } from 'mobx';
import { PlanManager } from './manager';
import { AgentActionNode } from './action';
import { IApiAgentAction } from '@/apis/generate-base-plan';

export class AgentSelection {
  public id: string = '';

  public plan: PlanManager;

  public agents: string[] = [];

  public actionRoot: string[] = [];

  public currentActionLeaf?: string;

  public previewActionLeaf?: string;

  public branches: Record<
    string,
    { start?: string; requirement?: string; base?: string }
  > = {};

  public get leaves() {
    return Object.keys(this.branches);
  }

  public get currentTaskProcess() {
    const path: AgentActionNode[] = [];
    let node = this.plan.agentActionMap.get(
      this.previewActionLeaf ?? this.currentActionLeaf ?? '',
    );
    while (node) {
      path.push(node);
      node = node.last;
    }
    return path.reverse();
  }

  public get currentTaskProcessIds() {
    return this.currentTaskProcess.map(node => node.id);
  }

  public get activeTaskIds() {
    return new Set<string>(this.currentTaskProcessIds);
  }

  public get belongingStepTask() {
    return this.plan.stepTaskMap.get(
      this.plan.selectionStepMap.get(this.id) ?? '',
    );
  }

  constructor(plan: PlanManager, json?: any) {
    this.plan = plan;
    if (json) {
      this.id = json.id ?? '';
      this.agents = [...(json.agents ?? [])];
      this.branches = JSON.parse(JSON.stringify(json.branches ?? {}));
      this.actionRoot = [...(json.actionRoot ?? [])];
      this.currentActionLeaf = json.currentActionLeaf;
      this.previewActionLeaf = json.previewActionLeaf;
    }
    makeAutoObservable(this);
  }

  public dump() {
    return {
      id: this.id,
      agents: [...this.agents],
      branches: JSON.parse(JSON.stringify(this.branches)),
      actionRoot: [...this.actionRoot],
      currentActionLeaf: this.currentActionLeaf,
      previewActionLeaf: this.previewActionLeaf,
    };
  }

  public insertActions(
    actions: IApiAgentAction[],
    start?: string,
    requirement?: string,
    base?: string,
  ) {
    if (actions.length === 0) {
      return undefined;
    }
    if (start && !this.plan.agentActionMap.has(start)) {
      throw new Error(`AgentAction node ${start} does not exist!`);
    }
    let lastChidrenList =
      this.plan.agentActionMap.get(start ?? '')?.children ?? this.actionRoot;
    const path = [...(this.plan.agentActionMap.get(start ?? '')?.path ?? [])];
    for (const action of actions) {
      path.push((this.plan.nextAgentActionId++).toString());
      const node = new AgentActionNode(this.plan, {
        name: action.id,
        path,
        type: action.type,
        agent: action.agent,
        description: action.description,
        inputs: action.inputs,
      });
      this.plan.agentActionMap.set(node.id, node);
      this.plan.actionSelectionMap.set(node.id, this.id);
      lastChidrenList.push(node.id);
      lastChidrenList = node.children;
    }
    const leaf = path[path.length - 1];
    this.branches[leaf] = { start, requirement, base };
    return leaf;
  }
}
