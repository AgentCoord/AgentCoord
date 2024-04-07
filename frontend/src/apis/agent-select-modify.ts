import { api } from '@sttot/api-hooks';
import { IApiStepTask } from './generate-base-plan';

export interface IAgentSelectModifyInitRequest {
  goal: string;
  stepTask: IApiStepTask;
}

export interface IAgentSelectModifyAddRequest {
  aspects: string[];
}

export interface IScoreItem {
  reason: string;
  score: number;
}

type IRawAgentSelectModifyInitResponse = Record<
  string,
  Record<string, { Reason: string; Score: number }>
>;

export const agentSelectModifyInitApi = api<
  IAgentSelectModifyInitRequest,
  Record<string, Record<string, IScoreItem>>
>(
  ({ goal, stepTask }) => ({
    baseURL: 'api',
    url: '/agentSelectModify_init',
    method: 'POST',
    data: {
      'General Goal': goal,
      stepTask: {
        StepName: stepTask.name,
        TaskContent: stepTask.content,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        InputObject_List: stepTask.inputs,
        OutputObject: stepTask.output,
      },
    },
  }),
  ({ data }: { data: IRawAgentSelectModifyInitResponse }) =>
    Object.fromEntries(
      Object.entries(data).map(([agent, reasons]) => [
        agent,
        Object.fromEntries(
          Object.entries(reasons).map(([reason, score]) => [
            reason,
            {
              reason: score.Reason,
              score: score.Score,
            },
          ]),
        ),
      ]),
    ),
);

export const agentSelectModifyAddApi = api<
  IAgentSelectModifyAddRequest,
  Record<string, Record<string, IScoreItem>>
>(
  data => ({
    baseURL: 'api',
    url: '/agentSelectModify_addAspect',
    method: 'POST',
    data: {
      aspectList: data.aspects,
    },
  }),
  ({ data }: { data: IRawAgentSelectModifyInitResponse }) =>
    Object.fromEntries(
      Object.entries(data).map(([agent, reasons]) => [
        agent,
        Object.fromEntries(
          Object.entries(reasons).map(([reason, score]) => [
            reason,
            {
              reason: score.Reason,
              score: score.Score,
            },
          ]),
        ),
      ]),
    ),
);
