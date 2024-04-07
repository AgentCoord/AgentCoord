/* eslint-disable @typescript-eslint/naming-convention */
import { api } from '@sttot/api-hooks';
import { IApiStepTask } from './generate-base-plan';

export interface INewPlanBranchRequest {
  goal: string;
  inputs: string[];
  batch?: number;
  requirement: string;
  base: IApiStepTask[];
  existing: IApiStepTask[];
}

export type INewPlanBranchResponse = IApiStepTask[][];

export const newPlanBranchApi = api<
  INewPlanBranchRequest,
  INewPlanBranchResponse
>(
  data => ({
    baseURL: '/api',
    url: '/branch_PlanOutline',
    method: 'POST',
    timeout: Infinity,
    data: {
      branch_Number: data.batch ?? 1,
      Modification_Requirement: data.requirement,
      Baseline_Completion: data.base.map(s => ({
        StepName: s.name,
        TaskContent: s.content,
        InputObject_List: s.inputs,
        OutputObject: s.output,
      })),
      Existing_Steps: data.existing.map(s => ({
        StepName: s.name,
        TaskContent: s.content,
        InputObject_List: s.inputs,
        OutputObject: s.output,
      })),
      'General Goal': data.goal,
      'Initial Input Object': data.inputs,
    },
  }),
  ({ data }) =>
    data.map((s: any) =>
      s.map((s: any) => ({
        name: s.StepName,
        content: s.TaskContent,
        inputs: s.InputObject_List,
        output: s.OutputObject,
        agents: [],
        brief: { template: '', data: {} },
        process: [],
      })),
    ),
);
/* eslint-enable @typescript-eslint/naming-convention */
