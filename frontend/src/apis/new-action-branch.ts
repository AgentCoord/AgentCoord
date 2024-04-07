import { api } from '@sttot/api-hooks';
import { IApiStepTask, IApiAgentAction } from './generate-base-plan';

export interface INewActionBranchRequest {
  goal: string;
  batch?: number;
  requirement: string;
  stepTask: IApiStepTask;
  base: IApiAgentAction[];
  existing: IApiAgentAction[];
}

export type INewActionBranchResponse = IApiAgentAction[][];

export const newActionBranchApi = api<
  INewActionBranchRequest,
  INewActionBranchResponse
>(
  data => ({
    baseURL: '/api',
    url: '/branch_TaskProcess',
    method: 'POST',
    timeout: Infinity,
    data: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      branch_Number: data.batch ?? 1,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      Modification_Requirement: data.requirement,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      Baseline_Completion: data.base.map(s => ({
        ID: s.id,
        ActionType: s.type,
        AgentName: s.agent,
        Description: s.description,
        ImportantInput: s.inputs,
      })),
      // eslint-disable-next-line @typescript-eslint/naming-convention
      Existing_Steps: data.existing.map(s => ({
        ID: s.id,
        ActionType: s.type,
        AgentName: s.agent,
        Description: s.description,
        ImportantInput: s.inputs,
      })),
      'General Goal': data.goal,
      stepTaskExisting: {
        StepName: data.stepTask.name,
        TaskContent: data.stepTask.content,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        InputObject_List: data.stepTask.inputs,
        OutputObject: data.stepTask.output,
        AgentSelection: data.stepTask.agents,
      },
    },
  }),
  ({ data }) =>
    data.map((s: any) =>
      s.map((s: any) => ({
        id: s.ID,
        type: s.ActionType,
        agent: s.AgentName,
        description: s.Description,
        inputs: s.ImportantInput,
      })),
    ),
);
