import { api } from '@sttot/api-hooks';
import { SxProps } from '@mui/material';

export const vec2Hsl = (vec: HslColorVector): string =>
  `hsl(${vec[0]},${vec[1]}%,${vec[2]}%)`;

export interface IPlanGeneratingRequest {
  goal: string;
  inputs: string[];
}

export interface IRichText {
  template: string;
  data: Record<string, { text: string; style: SxProps }>;
}

export interface IApiAgentAction {
  id: string;
  type: string;
  agent: string;
  description: string;
  inputs: string[];
}

export interface IApiStepTask {
  name: string;
  content: string;
  inputs: string[];
  output: string;
  agents: string[];
  brief: IRichText;
  process: IApiAgentAction[];
}

export interface IGeneratedPlan {
  inputs: string[];
  goal: string;
  process: IApiStepTask[];
}

type HslColorVector = [number, number, number];

export interface IRawStepTask {
  StepName?: string;
  TaskContent?: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  InputObject_List?: string[];
  OutputObject?: string;
  AgentSelection?: string[];
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Collaboration_Brief_FrontEnd: {
    template: string;
    data: Record<string, { text: string; color: HslColorVector }>;
  };
  TaskProcess: {
    ActionType: string;
    AgentName: string;
    Description: string;
    ID: string;
    ImportantInput: string[];
  }[];
}

export interface IRawPlanResponse {
  'Initial Input Object'?: string[] | string;
  'General Goal'?: string;
  'Collaboration Process'?: IRawStepTask[];
}

export const genBasePlanApi = api<IPlanGeneratingRequest, IGeneratedPlan>(
  data => ({
    baseURL: '/api',
    url: '/generate_basePlan',
    method: 'POST',
    data: {
      'General Goal': data.goal,
      'Initial Input Object': data.inputs,
    },
    timeout: Infinity,
  }),
  ({ data }: { data: IRawPlanResponse }) => ({
    inputs:
      (typeof data['Initial Input Object'] === 'string'
        ? [data['Initial Input Object']]
        : data['Initial Input Object']) || [],
    goal: data['General Goal'] || '',
    process:
      data['Collaboration Process']?.map(step => ({
        name: step.StepName || '',
        content: step.TaskContent || '',
        inputs: step.InputObject_List || [],
        output: step.OutputObject || '',
        agents: step.AgentSelection || [],
        brief: {
          template: step.Collaboration_Brief_FrontEnd.template,
          data: Object.fromEntries(
            Object.entries(step.Collaboration_Brief_FrontEnd.data).map(
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
        process: step.TaskProcess.map(process => ({
          id: process.ID,
          type: process.ActionType,
          agent: process.AgentName,
          description: process.Description,
          inputs: process.ImportantInput,
        })),
      })) ?? [],
  }),
);
