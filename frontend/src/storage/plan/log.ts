import React from 'react';
import { makeAutoObservable } from 'mobx';
import { PlanManager } from './manager';
import {
  IExecuteNode,
  ExecuteNodeType,
  IExecuteObject,
} from '@/apis/execute-plan';

export class RehearsalLog {
  public planManager: PlanManager;

  public outdate: boolean = false;

  oldLog: IExecuteNode[] = [];

  userInputs: Record<string, string> = {};

  public get logWithoutUserInput(): IExecuteNode[] {
    if (this.oldLog.length > 0) {
      return this.oldLog;
    } else {
      const log: IExecuteNode[] = [];
      // build skeleton logs
      for (const step of this.planManager.currentPlan) {
        log.push({
          type: ExecuteNodeType.Step,
          id: step.name,
          inputs: Array.from(step.inputs),
          output: step.output,
          history: (step.agentSelection?.currentTaskProcess ?? []).map(
            action => ({
              id: action.name,
              type: action.type,
              agent: action.agent,
              description: action.description,
              inputs: action.inputs,
              result: '',
            }),
          ),
        });
        // push output of the step
        log.push({
          type: ExecuteNodeType.Object,
          id: step.output,
          content: '',
        });
      }
      return log;
    }
  }

  public get renderingLog(): (IExecuteNode & {
    ref: React.RefObject<HTMLDivElement>;
    stepId: string;
  })[] {
    const outputTaskIdMap = new Map<string, string>();
    const taskNameTaskIdMap = new Map<string, string>();
    this.planManager.currentPlan.forEach(step => {
      taskNameTaskIdMap.set(step.name, step.id);
      outputTaskIdMap.set(step.output, step.id);
    });
    return this.logWithoutUserInput.map(node => {
      let stepId = '';
      if (node.type === ExecuteNodeType.Step) {
        stepId = taskNameTaskIdMap.get(node.id) ?? '';
      } else {
        stepId = outputTaskIdMap.get(node.id) ?? '';
      }
      return {
        ...node,
        ref: React.createRef(),
        stepId,
      };
    });
  }

  constructor(plan: PlanManager, json?: any) {
    this.planManager = plan;
    if (json) {
      this.oldLog = JSON.parse(JSON.stringify(json.oldLog));
      this.userInputs = JSON.parse(JSON.stringify(json.userInputs));
    }
    makeAutoObservable(this);
  }

  public dump() {
    return {
      oldLog: JSON.parse(JSON.stringify(this.oldLog)),
      userInputs: JSON.parse(JSON.stringify(this.userInputs)),
    };
  }

  public updateLog(newLog: IExecuteNode[]) {
    const log = [...newLog];
    const userInputs: Record<string, string> = {};
    while (log.length > 0 && log[0].type === ExecuteNodeType.Object) {
      const userInputObject = log.shift()! as IExecuteObject;
      userInputs[userInputObject.id] = userInputObject.content;
    }
    this.oldLog = log;
    this.userInputs = userInputs;
  }

  public clearLog() {
    this.oldLog.length = 0;
    this.outdate = false;
  }

  public setOutdate() {
    if (this.oldLog.length > 0) {
      this.outdate = true;
    }
  }
}
