const agentList = [
  'Alice',
  'Morgan',
  'Riley',
  'Charlie',
  'Bob',
  'Jordan',
  'Sam',
  'Quinn',
  'Parker',
  'Skyler',
  'Reagan',
  'Pat',
  'Leslie',
  'Dana',
  'Casey',
  'Terry',
  'Shawn',
  'Kim',
  'Alexis',
  'Taylor',
  'Bailey',
  'Drew',
  'Cameron',
  'Sage',
  'Peyton',
];
const aspectList = [
  'Creative Thinking',
  'Emotional Intelligence',
  'Philosophical Reasoning',
];
export const fakeAgentScoreMap = new Map(
  aspectList.map(aspect => [
    aspect,
    new Map(
      agentList.map(agent => [
        agent,
        {
          Reason: `reason for ${agent} in ${aspect}`,
          Score: Math.floor(Math.random() * 5) + 1,
        },
      ]),
    ),
  ]),
);

export const fakeAgentSelections = new Map([
  ['1', { agents: ['Alice', 'Morgan'] }],
  ['2', { agents: ['Alice', 'Morgan', 'Riley'] }],
  ['3', { agents: ['Alice', 'Bob', 'Riley'] }],
]);

export const fakeCurrentAgentSelection = '1';
