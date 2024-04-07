/*       A
        / \
       B   C
      / \
     D   E   */
export interface INodeBase {
  id: string; // B
  parent?: string; // A
  path: string[]; // ['A', 'B']
  children: string[]; // ['D', 'E']
}

export type NodeMap<T extends INodeBase> = Map<string, T>;
