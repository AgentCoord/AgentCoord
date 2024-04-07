// D3Graph.tsx
import React, { useState } from 'react';

export interface SvgLineProp {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  type: string;
  key: string;
  stepTaskId: string;
  stepName: string;
  objectName: string;
}

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
// 辅助函数来计算均值和最大值
const calculateLineMetrics = (
  cardRect: Map<
    string,
    {
      top: number;
      left: number;
      width: number;
      height: number;
    }
  >,
  prefix: string,
) => {
  const filteredRects = Array.from(cardRect.entries())
    .filter(([key]) => key.startsWith(prefix))
    .map(([, rect]) => rect);

  return {
    x:
      filteredRects.reduce(
        (acc, rect) => acc + (rect.left + 0.5 * rect.width),
        0,
      ) / filteredRects.length,
    y2: Math.max(...filteredRects.map(rect => rect.top + rect.height), 0),
  };
};
interface D3GraphProps {
  // objProCards_: ObjectProcessCardProps[];
  cardRefMap: Map<string, React.RefObject<HTMLElement>>;
  relations: {
    type: string;
    stepTaskId: string;
    stepCardName: string;
    objectCardName: string;
  }[];
  focusingStepId: string;
  forceRender: number;
}

const D3Graph: React.FC<D3GraphProps> = ({
  cardRefMap,
  relations,
  forceRender,
  focusingStepId,
}) => {
  const [svgLineProps, setSvgLineProps] = useState<SvgLineProp[]>([]);
  const [objectLine, setObjectLine] = useState({
    x: 0,
    y2: 0,
  });
  const [processLine, setProcessLine] = useState({
    x: 0,
    y2: 0,
  });
  const cardRect = new Map<
    string,
    { top: number; left: number; width: number; height: number }
  >();
  React.useEffect(() => {
    const svgLines_ = relations
      .filter(({ stepCardName, objectCardName }) => {
        return cardRefMap.has(stepCardName) && cardRefMap.has(objectCardName);
      })
      .map(({ type, stepTaskId, stepCardName, objectCardName }) => {
        const stepRect = getRefOffset(
          cardRefMap.get(stepCardName)!,
          cardRefMap.get('root')!,
        );
        cardRect.set(stepCardName, stepRect);
        const objectRect = getRefOffset(
          cardRefMap.get(objectCardName)!,
          cardRefMap.get('root')!,
        );
        cardRect.set(objectCardName, objectRect);

        return {
          key: `${type}.${stepCardName}.${objectCardName}`,
          stepTaskId,
          stepName: stepCardName,
          objectName: objectCardName,
          type,
          x1: objectRect.left + objectRect.width,
          y1: objectRect.top + 0.5 * objectRect.height,
          x2: stepRect.left,
          y2: stepRect.top + 0.5 * stepRect.height,
        };
      });
    const objectMetrics = calculateLineMetrics(cardRect, 'object');
    const processMetrics = calculateLineMetrics(cardRect, 'process');
    const maxY2 = Math.max(objectMetrics.y2, processMetrics.y2);

    setObjectLine({ ...objectMetrics, y2: maxY2 });
    setProcessLine({ ...processMetrics, y2: maxY2 });

    setSvgLineProps(svgLines_);
  }, [forceRender, focusingStepId, relations]);

  return (
    // <Box
    //   sx={{
    //     width: '100%',
    //     height: '100%',
    //     position: 'absolute',
    //     zIndex: 1,
    //   }}
    // >
    <svg
      style={{
        position: 'absolute',
        width: '100%',
        height: objectLine.y2 + 50,
        zIndex: 1,
        userSelect: 'none',
      }}
    >
      <marker
        id="arrowhead"
        markerWidth="4"
        markerHeight="4"
        refX="2"
        refY="2"
        orient="auto"
        markerUnits="strokeWidth"
      >
        <path d="M0,0 L4,2 L0,4 z" fill="#E5E5E5" />
      </marker>
      <marker
        id="starter"
        markerWidth="4"
        markerHeight="4"
        refX="0"
        refY="2"
        orient="auto"
        markerUnits="strokeWidth"
      >
        <path d="M0,0 L1,0 L1,4 L0,4 z" fill="#E5E5E5" />
      </marker>

      <g>
        <text
          x={objectLine.x}
          y="15"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#898989"
          fontWeight="800"
        >
          Key Object
        </text>
        <line
          x1={objectLine.x}
          y1={30}
          x2={objectLine.x}
          y2={objectLine.y2 + 30}
          stroke="#E5E5E5"
          strokeWidth="8"
          markerEnd="url(#arrowhead)"
          markerStart="url(#starter)"
        ></line>
        <text
          x={processLine.x}
          y="15"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#898989"
          fontWeight="800"
        >
          Process
        </text>
        <line
          x1={processLine.x}
          y1={30}
          x2={processLine.x}
          y2={processLine.y2 + 30}
          stroke="#E5E5E5"
          strokeWidth="8"
          markerEnd="url(#arrowhead)"
          markerStart="url(#starter)"
        ></line>
      </g>
      <g>
        {svgLineProps.map(edgeValue => (
          <line
            key={edgeValue.key}
            x1={edgeValue.x1}
            y1={edgeValue.y1}
            x2={edgeValue.x2}
            y2={edgeValue.y2}
            strokeWidth="5"
            stroke={edgeValue.type === 'output' ? '#FFCA8C' : '#B9DCB0'}
            strokeOpacity={
              focusingStepId === edgeValue.stepTaskId ? '100%' : '20%'
            }
          ></line>
        ))}
      </g>
    </svg>
    // </Box>
  );
};

export default D3Graph;
