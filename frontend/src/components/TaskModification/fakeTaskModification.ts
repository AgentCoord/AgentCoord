export const fakeTaskTree = {
  id: 'root', // 根节点
  children: [
    {
      id: 'child1', // 子节点
      children: [
        // 子节点的子节点数组
        {
          id: 'child1_1', // 子节点的子节点
          children: [], // 叶节点，没有子节点
        },
        {
          id: 'child1_2', // 另一个子节点的子节点
          children: [], // 叶节点，没有子节点
        },
      ],
    },
    {
      id: 'child2', // 另一个子节点
      children: [
        {
          id: 'child2_1',
          children: [],
        },
      ],
    },
  ],
};

export const fakeNodeData = new Map([
  [
    'child1',
    {
      agentIcon: 'John_Lin',
      style: { backgroundColor: '#b4d0d9', borderColor: '#b4d099' },
      isLeaf: true,
      requirement: 'hhhh',
    },
  ],
  [
    'child2',
    {
      agentIcon: 'Mei_Lin',
      style: { backgroundColor: '#b4d0d9', borderColor: '#b4d099' },
      isLeaf: false,
    },
  ],
  [
    'child1_1',
    {
      agentIcon: 'Tamara_Taylor',
      style: { backgroundColor: '#b4d0d9', borderColor: '#b4d099' },
      isLeaf: true,
      requirement: 'requirement',
    },
  ],
  [
    'child1_2',
    {
      agentIcon: 'Sam_Moore',
      style: { backgroundColor: '#b4d0d9', borderColor: '#b4d099' },
      isLeaf: true,
      requirement: 'requirement',
    },
  ],
  [
    'child2_1',
    {
      agentIcon: 'Sam_Moore',
      style: { backgroundColor: '#b4d0d9', borderColor: '#b4d099' },
      isLeaf: true,
      requirement: 'requirement',
    },
  ],
]);
