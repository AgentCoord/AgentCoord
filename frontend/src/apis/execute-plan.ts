import { api } from '@sttot/api-hooks';
import type { IGeneratedPlan } from './generate-base-plan';
import { ActionType } from '@/storage/plan';

export interface IExecutePlanRequest {
  plan: IGeneratedPlan;
  stepsToRun: number;
  rehearsalLog: IExecuteNode[];
}

export enum ExecuteNodeType {
  Step = 'step',
  Object = 'object',
}

type IExecuteRawResponse = {
  LogNodeType: string;
  NodeId: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  InputName_List?: string[] | null;
  OutputName?: string;
  content?: string;
  ActionHistory?: {
    ID: string;
    ActionType: string;
    AgentName: string;
    Description: string;
    ImportantInput: string[];
    // eslint-disable-next-line @typescript-eslint/naming-convention
    Action_Result: string;
  }[];
};

export interface IExecuteStepHistoryItem {
  id: string;
  type: ActionType;
  agent: string;
  description: string;
  inputs: string[];
  result: string;
}

export interface IExecuteStep {
  type: ExecuteNodeType.Step;
  id: string;
  inputs: string[];
  output: string;
  history: IExecuteStepHistoryItem[];
}

export interface IExecuteObject {
  type: ExecuteNodeType.Object;
  id: string;
  content: string;
}

export type IExecuteNode = IExecuteStep | IExecuteObject;

export const executePlanApi = api<IExecutePlanRequest, IExecuteNode[]>(
  ({ plan, stepsToRun, rehearsalLog }) => ({
    baseURL: '/api',
    url: '/executePlan',
    method: 'POST',
    timeout: Infinity,
    data: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      num_StepToRun: Number.isFinite(stepsToRun)
        ? Math.max(stepsToRun, 1)
        : null,
      plan: {
        'Initial Input Object': plan.inputs,
        'General Goal': plan.goal,
        'Collaboration Process': plan.process.map(step => ({
          StepName: step.name,
          TaskContent: step.content,
          // eslint-disable-next-line @typescript-eslint/naming-convention
          InputObject_List: step.inputs,
          OutputObject: step.output,
          AgentSelection: step.agents,
          // eslint-disable-next-line @typescript-eslint/naming-convention
          Collaboration_Brief_frontEnd: step.brief,
          TaskProcess: step.process.map(action => ({
            ActionType: action.type,
            AgentName: action.agent,
            Description: action.description,
            ID: action.id,
            ImportantInput: action.inputs,
          })),
        })),
      },
      RehearsalLog: rehearsalLog.map(h =>
        h.type === ExecuteNodeType.Object
          ? {
              LogNodeType: 'object',
              NodeId: h.id,
              content: h.content,
            }
          : {
              LogNodeType: 'step',
              NodeId: h.id,
              // eslint-disable-next-line @typescript-eslint/naming-convention
              InputName_List: h.inputs,
              OutputName: h.output,
              chatLog: [],
              // eslint-disable-next-line @typescript-eslint/naming-convention
              inputObject_Record: [],
              ActionHistory: h.history.map(item => ({
                ID: item.id,
                ActionType: item.type,
                AgentName: item.agent,
                Description: item.description,
                ImportantInput: item.inputs,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                Action_Result: item.result,
              })),
            },
      ),
    },
  }),
  ({ data }) =>
    data.map((raw: IExecuteRawResponse) =>
      raw.LogNodeType === 'step'
        ? {
            type: ExecuteNodeType.Step,
            id: raw.NodeId,
            inputs: raw.InputName_List || [],
            output: raw.OutputName ?? '',
            history:
              raw.ActionHistory?.map(item => ({
                id: item.ID,
                type: item.ActionType,
                agent: item.AgentName,
                description: item.Description,
                inputs: item.ImportantInput,
                result: item.Action_Result,
              })) || [],
          }
        : {
            type: ExecuteNodeType.Object,
            id: raw.NodeId,
            content: raw.content || '',
          },
    ),
);
