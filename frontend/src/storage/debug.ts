import { autorun } from 'mobx';
import { GlobalStorage } from '.';

export const debug = (store: GlobalStorage) => {
  autorun(() => {
    const { availiableAgents } = store;
    console.groupCollapsed('[LOG] GetAgent:', availiableAgents.length);
    for (const agent of availiableAgents) {
      // console 输出，name 粗体，profile 正常
      console.info('%c%s', 'font-weight: bold', agent.name, agent.profile);
    }
    console.groupEnd();
  });

  autorun(() => {
    const { agentCards } = store;
    console.groupCollapsed('[LOG] AgentCards:', agentCards.length);
    for (const agentCard of agentCards) {
      console.groupCollapsed(
        `agent: ${agentCard.name}`,
        'inuse:',
        agentCard.inuse,
        'action:',
        agentCard.actions.length,
      );
      for (const action of agentCard.actions) {
        console.groupCollapsed(
          '%c%s',
          `font-weight: bold`,
          action.type,
          action.description,
          'input:',
          action.inputs.length,
        );
        for (const input of action.inputs) {
          console.info(input);
        }
        console.groupEnd();
      }
      console.groupEnd();
    }
    console.groupEnd();
  });

  autorun(() => {
    const { refMap } = store;
    console.groupCollapsed('[LOG] RefMap');
    for (const [key, map] of Object.entries(refMap)) {
      console.groupCollapsed(key);
      for (const [k, v] of map) {
        console.info(k, v);
      }
      console.groupEnd();
    }
    console.groupEnd();
  });

  autorun(() => {
    const { planManager } = store;
    console.groupCollapsed('[LOG] planManager');
    console.info(planManager);
    const currentLeafId = planManager.currentStepTaskLeaf;
    if (currentLeafId) {
      const currentPath = planManager.stepTaskMap.get(currentLeafId)?.path;
      const outline = {
        initialInputs: planManager.inputs,
        processes: currentPath
          ?.map(nodeId => planManager.stepTaskMap.get(nodeId))
          .filter(node => node)
          .map(node => ({
            inputs: node?.inputs,
            output: node?.output,
            StepName: node?.name,
            AgentSelection: node?.agentSelection,
          })),
      };
      console.log(outline);
    }

    console.groupEnd();
  });
};
