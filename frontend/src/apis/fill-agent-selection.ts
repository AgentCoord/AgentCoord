import { api } from '@sttot/api-hooks';
import { IApiStepTask, vec2Hsl, IRawStepTask } from './generate-base-plan';

export interface IFillAgentSelectionRequest {
  goal: string;
  stepTask: IApiStepTask;
  agents: string[];
}

export const fillAgentSelectionApi = api<
  IFillAgentSelectionRequest,
  IApiStepTask
>(
  ({ goal, stepTask, agents }) => ({
    baseURL: 'api',
    url: '/fill_stepTask_TaskProcess',
    method: 'POST',
    data: {
      'General Goal': goal,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      stepTask_lackTaskProcess: {
        StepName: stepTask.name,
        TaskContent: stepTask.content,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        InputObject_List: stepTask.inputs,
        OutputObject: stepTask.output,
        AgentSelection: agents,
      },
    },
  }),
  ({ data }: { data: IRawStepTask }) => ({
    name: data.StepName ?? '',
    content: data.TaskContent ?? '',
    inputs: data.InputObject_List ?? [],
    output: data.OutputObject ?? '',
    agents: data.AgentSelection ?? [],
    brief: {
      template: data.Collaboration_Brief_FrontEnd?.template ?? '',
      data: Object.fromEntries(
        Object.entries(data.Collaboration_Brief_FrontEnd?.data ?? {}).map(
          ([key, value]) => [
            key,
            {
              text: value.text,
              style: {
                background: vec2Hsl(value.color),
              },
            },
          ],
        ),
      ),
    },
    process: data.TaskProcess.map(process => ({
      id: process.ID,
      type: process.ActionType,
      agent: process.AgentName,
      description: process.Description,
      inputs: process.ImportantInput,
    })),
  }),
);
