import { api } from '@sttot/api-hooks';
import { IconName, IconMap } from '@/components/AgentIcon';

interface IRawAgent {
  Name: string;
  Profile: string;
  Icon: string;
}

export interface IAgent {
  name: string;
  profile: string;
  icon: IconName;
}

export const getAgentsApi = api<void, IAgent[]>(
  () => ({
    baseURL: '/api',
    url: '/getAgent',
    method: 'POST',
    timeout: Infinity,
  }),
  ({ data }) => {
    const data_ = data as IRawAgent[];
    return data_.map(agent => ({
      name: agent.Name,
      profile: agent.Profile,
      icon: IconMap[agent.Icon.replace(/\.png$/, '')],
    }));
  },
);

export const useAgents = getAgentsApi.createMemoHook();
