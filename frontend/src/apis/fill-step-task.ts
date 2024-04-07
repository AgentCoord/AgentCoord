import { api } from '@sttot/api-hooks';
import { IApiStepTask, IRawStepTask, vec2Hsl } from './generate-base-plan';

export interface IFillStepTaskRequest {
  goal: string;
  stepTask: IApiStepTask;
}

export const fillStepTaskApi = api<IFillStepTaskRequest, IApiStepTask>(
  ({ goal, stepTask }) => ({
    baseURL: 'api',
    url: '/fill_stepTask',
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
