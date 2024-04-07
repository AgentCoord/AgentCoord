import { api } from '@sttot/api-hooks';
import { IconName } from '@/components/AgentIcon';

export interface IAgent {
  name: string;
  profile: string;
  icon: IconName;
}

export const setAgentsApi = api<IAgent[], any>(
  agents => ({
    baseURL: '/api',
    url: '/setAgents',
    method: 'POST',
    data: agents.map(agent => ({
      Name: agent.name,
      Profile: agent.profile,
    })),
    timeout: Infinity,
  }),
  ({ data }) => {
    // const data_ = data as IRawAgent[];
    // return data_.map(agent => ({
    //   name: agent.Name,
    //   profile: agent.Profile,
    //   icon: IconMap[agent.Icon.replace(/\.png$/, '')],
    // }));
    return data;
  },
);

export const setagents = setAgentsApi.createMemoHook();
