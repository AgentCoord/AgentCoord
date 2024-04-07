import React from 'react';
import _ from 'lodash';
import { observer } from 'mobx-react-lite';
import { useTaskModificationContext } from './context';
import { globalStorage } from '@/storage';

const getRefOffset = (
  child: React.RefObject<HTMLElement>,
  grandParent: React.RefObject<HTMLElement>,
) => {
  const offset = { top: 0, left: 0, width: 0, height: 0 };
  if (!child.current || !grandParent.current) {
    return offset;
  }
  let node = child.current;
  // Traverse up the DOM tree until we reach the grandparent or run out of elements
  while (node && node !== grandParent.current) {
    offset.top += node.offsetTop;
    offset.left += node.offsetLeft;
    // Move to the offset parent (the nearest positioned ancestor)
    node = node.offsetParent as HTMLElement;
  }
  // If we didn't reach the grandparent, return null
  if (node !== grandParent.current) {
    return offset;
  }
  offset.width = child.current.offsetWidth;
  offset.height = child.current.offsetHeight;
  return offset;
};

const TaskModificationSvg = observer(() => {
  const {
    forestPaths,
    whoIsAddingBranch,
    nodeRefMap,
    svgForceRenderCounter,
    containerRef,
  } = useTaskModificationContext();
  const { currentActionNodeSet } = globalStorage;

  const [nodeRectMap, setNodeRectMap] = React.useState(
    new Map<
      string,
      {
        top: number;
        left: number;
        width: number;
        height: number;
      }
    >(),
  );
  React.useEffect(() => {
    if (containerRef) {
      const nodeRectMap_ = new Map(
        [...nodeRefMap].map(kv => {
          return [kv[0], getRefOffset(kv[1], containerRef)];
        }),
      );
      setNodeRectMap(nodeRectMap_);
    }
  }, [svgForceRenderCounter, whoIsAddingBranch]);

  const renderLine = (startid: string, endid: string) => {
    const startRect = nodeRectMap.get(startid);
    const endRect = nodeRectMap.get(endid);
    if (!startRect || !endRect) {
      return <></>;
    }
    let isCurrent = false;
    if (currentActionNodeSet.has(startid) && currentActionNodeSet.has(endid)) {
      isCurrent = true;
    }
    if (startid === 'root' && currentActionNodeSet.has(endid)) {
      isCurrent = true;
    }
    // console.log(`line.${startid}${startRect.left}.${endid}${endRect.left}`);
    return (
      <path
        key={`line.${startid}${startRect.left}.${endid}${endRect.left}`}
        d={`M ${startRect.left + 0.5 * startRect.width} ${
          startRect.top + 0.5 * startRect.height
        }
        C ${startRect.left + startRect.width * 0.5} ${
          endRect.top + 0.5 * endRect.height
        },
          ${endRect.left} ${endRect.top + 0.5 * endRect.height},
          ${endRect.left} ${endRect.top + 0.5 * endRect.height}`}
        fill="none"
        stroke={isCurrent ? '#4a9c9e' : '#D9D9D9'}
        strokeWidth="6"
      ></path>
    );
  };
  const renderRoot = () => {
    const rootRect = nodeRectMap.get('root');
    if (rootRect && forestPaths.length > 0) {
      return (
        <circle
          key={`root${rootRect.left}`}
          cx={rootRect.left + 0.5 * rootRect.width}
          cy={rootRect.top + 0.5 * rootRect.height}
          r="10"
          fill="#4a9c9e"
        />
      );
    }
    return <></>;
  };
  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        // backgroundColor: 'red',
        width: _.max(
          [...nodeRectMap.values()].map(rect => rect.left + rect.width),
        ),
        height: _.max(
          [...nodeRectMap.values()].map(rect => rect.top + rect.height),
        ),
      }}
    >
      {forestPaths.map(pair => renderLine(pair[0], pair[1]))}
      {whoIsAddingBranch && renderLine(whoIsAddingBranch, 'requirement')}
      {renderRoot()}
    </svg>
  );
});

export default TaskModificationSvg;
