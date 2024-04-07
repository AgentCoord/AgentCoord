import React from 'react';
import { SxProps } from '@mui/material';
import { makeAutoObservable } from 'mobx';
import { INodeBase } from './base';
import { PlanManager } from './manager';
import {
  IRichText,
  IApiStepTask,
  IApiAgentAction,
} from '@/apis/generate-base-plan';

export interface IRichSpan {
  text: string;
  style?: SxProps;
}

const nameJoin = (names: string[]) => {
  // join names with comma, and 'and' for the last one
  const tmp = [...names];
  const last = tmp.pop()!;
  let t = tmp.join(', ');
  if (t.length > 0) {
    t = `${t} and ${last}`;
  } else {
    t = last;
  }
  return t;
};

export class StepTaskNode implements INodeBase {
  public name: string = '';

  public content: string = '';

  public inputs: string[] = [];

  public output: string = '';

  public _brief: IRichText = {
    template: '',
    data: {},
  };

  public path: string[] = [];

  public children: string[] = [];

  public plan: PlanManager;

  public agentSelectionIds: string[] = [];

  public currentAgentSelection?: string;

  public previewAgentSelection?: string;

  public agentAspectScores: Record<
    string,
    Record<string, { score: number; reason: string }>
  > = {};

  public get brief(): IRichText {
    if (!this.agentSelection) {
      return this._brief;
    }
    const agents = [...this.agentSelection.agents];
    if (agents.length === 0) {
      return this._brief;
    }
    const data: IRichText['data'] = {};
    let indexOffset = 0;
    const inputPlaceHolders = this.inputs.map((text, index) => {
      data[(index + indexOffset).toString()] = {
        text,
        style: { background: '#ACDBA0' },
      };
      return `!<${index + indexOffset}>!`;
    });
    const inputSentence = nameJoin(inputPlaceHolders);
    indexOffset += this.inputs.length;
    const namePlaceholders = agents.map((text, index) => {
      data[(index + indexOffset).toString()] = {
        text,
        style: { background: '#E5E5E5', boxShadow: '1px 1px 4px 1px #0003' },
      };
      return `!<${index + indexOffset}>!`;
    });
    const nameSentence = nameJoin(namePlaceholders);
    indexOffset += agents.length;
    let actionSentence = this.content;
    // delete the last '.' of actionSentence
    if (actionSentence[actionSentence.length - 1] === '.') {
      actionSentence = actionSentence.slice(0, -1);
    }
    const actionIndex = indexOffset++;
    data[actionIndex.toString()] = {
      text: actionSentence,
      style: { background: '#DDD', border: '1.5px solid #ddd' },
    };
    let outputSentence = '';
    if (this.output) {
      data[indexOffset.toString()] = {
        text: this.output,
        style: { background: '#FFCA8C' },
      };
      outputSentence = `to obtain !<${indexOffset}>!`;
    }
    // Join them togeter
    let content = inputSentence;
    if (content) {
      content = `Based on ${content}, ${nameSentence} perform the task of !<${actionIndex}>!`;
    } else {
      content = `${nameSentence} perform the task of !<${actionIndex}>!`;
    }
    if (outputSentence) {
      content = `${content}, ${outputSentence}.`;
    } else {
      content = `${content}.`;
    }
    content = content.trim();
    return {
      template: content,
      data,
    };
  }

  public get id() {
    return this.path[this.path.length - 1];
  }

  public get last() {
    return this.plan.stepTaskMap.get(this.path[this.path.length - 2]);
  }

  public get next() {
    return this.children
      .map(id => this.plan.stepTaskMap.get(id)!)
      .filter(node => node);
  }

  public get agentSelection() {
    const id = this.previewAgentSelection ?? this.currentAgentSelection ?? '';
    return this.plan.agentSelectionMap.get(id);
  }

  public get allSelections() {
    return this.agentSelectionIds
      .map(id => this.plan.agentSelectionMap.get(id)!)
      .filter(node => node);
  }

  public get apiStepTask(): IApiStepTask {
    const actionsProcess: IApiAgentAction[] = [];
    const actions = this.agentSelection?.currentTaskProcess ?? [];
    for (const action of actions) {
      actionsProcess.push({
        id: action.name,
        type: action.type,
        agent: action.agent,
        description: action.description,
        inputs: [...action.inputs],
      });
    }
    return {
      name: this.name,
      content: this.content,
      inputs: [...this.inputs],
      output: this.output,
      agents: this.agentSelection?.agents ?? [],
      brief: JSON.parse(JSON.stringify(this.brief)) as IRichText,
      process: actionsProcess,
    };
  }

  public get descriptionCard() {
    const briefSpan: IRichSpan[] = [];
    for (const substring of this.brief.template.split(/(!<[^>]+>!)/)) {
      if (substring[0] === '!') {
        const key = substring.slice(2, -2);
        const { text, style } = this.brief.data[key];
        briefSpan.push({ text, style });
      } else {
        briefSpan.push({ text: substring });
      }
    }

    const actions = this.agentSelection?.currentTaskProcess ?? [];
    const detailParagraph = actions.map(action => [
      action.renderCard,
      action.id,
    ]);

    return {
      id: this.id,
      name: this.name,
      content: this.content,
      ref: React.createRef<HTMLElement>(),
      brief: briefSpan,
      detail: detailParagraph,
    };
  }

  public get outlineCard() {
    return {
      id: this.id,
      name: this.name,
      inputs: this.inputs,
      output: this.output,
      agents: this.agentSelection?.agents ?? [],
      content: this.content,
      ref: React.createRef<HTMLElement>(),
    };
  }

  public get heatmap() {
    return Object.fromEntries(
      Object.entries(this.agentAspectScores).map(([aspect, scores]) => [
        aspect,
        Object.fromEntries(
          Object.entries(scores).map(([agent, score]) => [agent, score]),
        ),
      ]),
    );
  }

  constructor(plan: PlanManager, json?: any) {
    this.plan = plan;
    if (json) {
      this.name = json.name ?? '';
      this.content = json.content ?? '';
      this.inputs = [...(json.inputs ?? [])];
      this.output = json.output;
      this._brief = JSON.parse(
        JSON.stringify(json.brief ?? '{ template: "", data: {} }'),
      ) as IRichText;
      this.path = [...(json.path ?? [])];
      this.children = [...(json.children ?? [])];
      this.agentAspectScores = JSON.parse(
        JSON.stringify(json.agentAspectScores ?? {}),
      );
      this.agentSelectionIds = [...(json.agentSelectionIds ?? [])];
      this.currentAgentSelection = json.currentAgentSelection;
      this.previewAgentSelection = json.previewAgentSelection;
    }
    makeAutoObservable(this);
  }

  public dump() {
    return {
      name: this.name,
      content: this.content,
      inputs: [...this.inputs],
      output: this.output,
      brief: JSON.parse(JSON.stringify(this.brief)),
      path: [...this.path],
      children: [...this.children],
      agentSelectionIds: [...this.agentSelectionIds],
      agentAspectScores: JSON.parse(JSON.stringify(this.agentAspectScores)),
      currentAgentSelection: this.currentAgentSelection,
      previewAgentSelection: this.previewAgentSelection,
    };
  }

  public appendAspectScore(
    aspect: string,
    agentScores: Record<string, { score: number; reason: string }>,
  ) {
    if (this.agentAspectScores[aspect]) {
      for (const [agent, score] of Object.entries(agentScores)) {
        if (this.agentAspectScores[aspect][agent]) {
          this.agentAspectScores[aspect][agent].score = score.score;
          this.agentAspectScores[aspect][agent].reason = score.reason;
        } else {
          this.agentAspectScores[aspect][agent] = score;
        }
      }
    } else {
      this.agentAspectScores[aspect] = agentScores;
    }
  }
}
