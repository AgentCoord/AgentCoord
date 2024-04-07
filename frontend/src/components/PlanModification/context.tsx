// PlanModificationContext.tsx
import React, {
  ReactNode,
  RefObject,
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react';
import { IPlanTreeNode, globalStorage } from '@/storage';

interface PlanModificationContextProps {
  forest: IPlanTreeNode | undefined;
  setForest: (forest: IPlanTreeNode) => void;
  forestPaths: [string, string][];
  setForestPaths: (paths: [string, string][]) => void;

  whoIsAddingBranch: string | undefined;
  setWhoIsAddingBranch: (whoIsAddingBranch: string | undefined) => void;
  updateWhoIsAddingBranch: (whoIsAddingBranch: string | undefined) => void;

  containerRef: React.RefObject<HTMLElement> | undefined;
  setContainerRef: (containerRef: React.RefObject<HTMLElement>) => void;
  nodeRefMap: Map<string, RefObject<HTMLElement>>;
  updateNodeRefMap: (key: string, value: RefObject<HTMLElement>) => void;

  baseNodeSet: Set<string>;
  setBaseNodeSet: (baseNodeSet: Set<string>) => void;
  baseLeafNodeId: string | undefined;
  setBaseLeafNodeId: (baseLeafNodeId: string | undefined) => void;

  handleRequirementSubmit: (requirement: string, number: number) => void;
  handleNodeClick: (nodeId: string) => void;

  handleNodeHover: (nodeId: string | undefined) => void;

  svgForceRenderCounter: number;
  setSVGForceRenderCounter: (n: number) => void;
  svgForceRender: () => void;
}

const PlanModificationContext = createContext<PlanModificationContextProps>(
  {} as PlanModificationContextProps,
);

export const usePlanModificationContext = () =>
  useContext(PlanModificationContext);

export const PlanModificationProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [forest, setForest] = useState<IPlanTreeNode>();
  const [forestPaths, setForestPaths] = useState<[string, string][]>([]);

  useEffect(() => {
    if (forest) {
      setForestPaths(_getFatherChildrenIdPairs(forest));
    }
  }, [forest]);

  const [whoIsAddingBranch, setWhoIsAddingBranch] = useState<
    string | undefined
  >(undefined);
  const updateWhoIsAddingBranch = (whoId: string | undefined) => {
    if (whoId === whoIsAddingBranch) {
      setWhoIsAddingBranch(undefined);
    } else {
      setWhoIsAddingBranch(whoId);
    }
  };
  const [containerRef, setContainerRef] = React.useState<
    React.RefObject<HTMLElement> | undefined
  >(undefined);
  const [baseNodeSet, setBaseNodeSet] = React.useState<Set<string>>(
    new Set<string>(),
  );
  const [baseLeafNodeId, setBaseLeafNodeId] = React.useState<
    string | undefined
  >(undefined);
  const [nodeRefMap] = React.useState(
    new Map<string, RefObject<HTMLElement>>(),
  );
  const updateNodeRefMap = (key: string, value: RefObject<HTMLElement>) => {
    nodeRefMap.set(key, value);
  };

  const handleRequirementSubmit = (requirement: string, number: number) => {
    if (whoIsAddingBranch) {
      const start =
        whoIsAddingBranch === 'root' ? undefined : whoIsAddingBranch;
      globalStorage.newPlanBranch(start, requirement, number, baseLeafNodeId);
      setWhoIsAddingBranch(undefined);
      setBaseNodeSet(new Set());
      setBaseLeafNodeId(undefined);
    }
  };
  const handleNodeClick = (nodeId: string) => {
    const leafId = globalStorage.getFirstLeafStepTask(nodeId).id;
    if (whoIsAddingBranch) {
      if (baseLeafNodeId === leafId) {
        setBaseNodeSet(new Set());
        setBaseLeafNodeId(undefined);
      } else {
        const pathNodeSet = new Set(globalStorage.getStepTaskLeafPath(leafId));
        if (
          pathNodeSet.has(whoIsAddingBranch) ||
          whoIsAddingBranch === 'root'
        ) {
          setBaseLeafNodeId(leafId);
          setBaseNodeSet(pathNodeSet);
        }
      }
    } else {
      globalStorage.setCurrentPlanBranch(leafId);
      globalStorage.setFocusingStepTaskId(nodeId);
    }
  };

  const [svgForceRenderCounter, setSVGForceRenderCounter] = useState(0);
  const svgForceRender = () => {
    setSVGForceRenderCounter((svgForceRenderCounter + 1) % 100);
  };

  const handleNodeHover = (nodeId: string | undefined) => {
    if (!whoIsAddingBranch) {
      if (nodeId) {
        const leafNode = globalStorage.getFirstLeafStepTask(nodeId);
        const branchInfo = globalStorage.planManager.branches[leafNode.id];
        if (branchInfo.base) {
          const pathNodeSet = new Set(
            globalStorage.getStepTaskLeafPath(branchInfo.base),
          );
          setBaseNodeSet(pathNodeSet);
        }
      } else {
        setBaseNodeSet(new Set());
      }
    }
  };

  useEffect(() => {
    setBaseNodeSet(new Set());
    setBaseLeafNodeId(undefined);
  }, [whoIsAddingBranch]);

  useEffect(() => {
    svgForceRender();
  }, [forest, whoIsAddingBranch]);

  return (
    <PlanModificationContext.Provider
      value={{
        forest,
        setForest,
        forestPaths,
        setForestPaths,

        whoIsAddingBranch,
        setWhoIsAddingBranch,
        updateWhoIsAddingBranch,

        containerRef,
        setContainerRef,
        nodeRefMap,
        updateNodeRefMap,

        baseNodeSet,
        setBaseNodeSet,
        baseLeafNodeId,
        setBaseLeafNodeId,

        handleRequirementSubmit,
        handleNodeClick,
        handleNodeHover,

        svgForceRenderCounter,
        setSVGForceRenderCounter,
        svgForceRender,
      }}
    >
      {children}
    </PlanModificationContext.Provider>
  );
};

// ----------------------------------------------------------------
const _getFatherChildrenIdPairs = (node: IPlanTreeNode): [string, string][] => {
  let pairs: [string, string][] = [];
  // 对于每个子节点，添加 (父ID, 子ID) 对，并递归调用函数
  node.children.forEach(child => {
    pairs.push([node.id, child.id]);
    pairs = pairs.concat(_getFatherChildrenIdPairs(child));
  });
  return pairs;
};
