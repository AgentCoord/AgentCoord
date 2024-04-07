import { makeAutoObservable } from 'mobx';
import { SxProps } from '@mui/material';
import { INodeBase } from './base';
import { PlanManager } from './manager';
import { IApiAgentAction } from '@/apis/generate-base-plan';

export enum ActionType {
  Propose = 'Propose',
  Critique = 'Critique',
  Improve = 'Improve',
  Finalize = 'Finalize',
}

const AgentActionStyles = new Map<ActionType | '', SxProps>([
  [ActionType.Propose, { backgroundColor: '#B9EBF9', borderColor: '#94c2dc' }],
  [ActionType.Critique, { backgroundColor: '#EFF9B9', borderColor: '#c0dc94' }],
  [ActionType.Improve, { backgroundColor: '#E0DEFC', borderColor: '#bbb8e5' }],
  [ActionType.Finalize, { backgroundColor: '#F9C7B9', borderColor: '#dc9e94' }],
  ['', { backgroundColor: '#000000', borderColor: '#000000' }],
]);

export const getAgentActionStyle = (action: ActionType): SxProps => {
  return AgentActionStyles.get(action) ?? AgentActionStyles.get('')!;
};

export interface IRichSentence {
  who: string;
  whoStyle: SxProps;
  content: string;
  style: SxProps;
}

export class AgentActionNode implements INodeBase {
  public name: string = '';

  public plan: PlanManager;

  public type: ActionType = ActionType.Propose;

  public agent: string = '';

  public description: string = '';

  public inputs: string[] = [];

  public path: string[] = []; // ['A', 'B']

  public children: string[] = []; // ['D', 'E']

  public get id() {
    return this.path[this.path.length - 1];
  }

  public get parent() {
    return this.path[this.path.length - 2];
  }

  public get last() {
    return this.plan.agentActionMap.get(this.parent);
  }

  public get renderCard(): IRichSentence {
    const style = getAgentActionStyle(this.type);
    return {
      who: this.agent,
      whoStyle: style,
      // this.description 首字母小写
      content: this.description[0].toLowerCase() + this.description.slice(1),
      style: { ...style, backgroundColor: 'transparent' },
    };
  }

  public get apiAgentAction(): IApiAgentAction {
    return {
      id: this.name,
      type: this.type,
      agent: this.agent,
      description: this.description,
      inputs: this.inputs,
    };
  }

  public get belongingSelection() {
    return this.plan.agentSelectionMap.get(
      this.plan.actionSelectionMap.get(this.id) ?? '',
    );
  }

  constructor(plan: PlanManager, json?: any) {
    this.plan = plan;
    if (json) {
      this.name = json.name ?? '';
      this.agent = json.agent ?? '';
      this.description = json.description ?? '';
      this.inputs = [...(json.inputs ?? [])];
      this.type = json.type ?? ActionType.Propose;
      this.path = [...(json.path ?? [])];
      this.children = [...(json.children ?? [])];
    }
    makeAutoObservable(this);
  }

  public dump() {
    return {
      name: this.name,
      agent: this.agent,
      description: this.description,
      inputs: [...this.inputs],
      type: this.type,
      path: [...this.path],
      children: [...this.children],
    };
  }
}
