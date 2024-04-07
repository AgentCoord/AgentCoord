import React from 'react';
import Box from '@mui/material/Box';
import { observer } from 'mobx-react-lite';
import { globalStorage } from '@/storage';
import { ActionType, getAgentActionStyle } from '@/storage/plan';

interface ILine<T = string> {
  type: T;
  from: string;
  to: string;
}

interface RehearsalSvgProps {
  cardRefMap: Map<string, React.RefObject<HTMLElement | HTMLDivElement>>;
  renderCount: number;
  objectStepOrder: string[];
  importantLines: ILine<ActionType>[];
  actionIsHovered: string | undefined;
}

const getIOLineHeight = (nodeOrder: string[], lines: ILine[]) => {
  const edgeHeightIndexMap_ = new Map<number, number[][]>();
  const compareFunction = (a: ILine, b: ILine): number => {
    const [afrom, ato] = [a.from, a.to];
    const [bfrom, bto] = [b.from, b.to];

    const afromPos = nodeOrder.indexOf(afrom);
    const bfromPos = nodeOrder.indexOf(bfrom);
    const atoPos = nodeOrder.indexOf(ato);
    const btoPos = nodeOrder.indexOf(bto);

    // 如果最小位置相同，则比较位置之间的距离
    const aDistance = atoPos - afromPos;
    const bDistance = btoPos - bfromPos;

    if (aDistance !== bDistance) {
      return aDistance - bDistance;
    } else {
      return afromPos - bfromPos;
    }
  };
  lines.sort(compareFunction);
  const isCrossOver = (ptPair: number[], ptList: number[][]) => {
    for (const pt of ptList) {
      if (pt[1] <= ptPair[0] || pt[0] >= ptPair[1]) {
        continue;
      }
      return true;
    }
    return false;
  };
  lines.forEach(line => {
    const fromIndex = nodeOrder.indexOf(line.from);
    const toIndex = nodeOrder.indexOf(line.to);
    let h = 1;
    while (
      isCrossOver([fromIndex, toIndex], edgeHeightIndexMap_.get(h) || [])
    ) {
      h += 1;
    }
    edgeHeightIndexMap_.set(h, [
      ...(edgeHeightIndexMap_.get(h) || []),
      [fromIndex, toIndex],
    ]);
  });
  const edgeHeightMap_ = new Map<string, number>();
  edgeHeightIndexMap_.forEach((pairList, height) => {
    // 遍历当前条目的数组，将数字替换为数组b中对应的名称
    pairList.forEach(pair => {
      edgeHeightMap_.set(pair.map(index => nodeOrder[index]).join('.'), height);
    });
  });
  return edgeHeightMap_;
};

const getOffset = (child: HTMLElement, parent: HTMLElement) => {
  const parentRect = parent.getBoundingClientRect();
  const childRect = child.getBoundingClientRect();
  // 计算相对位置
  return new DOMRect(
    childRect.left - parentRect.left,
    childRect.top - parentRect.top,
    childRect.width,
    childRect.height,
  );
};

const calcCurve = (fromCard: DOMRect, toCard: DOMRect, height: number) => {
  // calc bezier curve
  // from [fromCard.left, fromCard.top+0.5*fromCard.height]
  // to [toCard.left, toCard.top+0.5*toCard.height
  const h = fromCard.left * height;
  return `M ${fromCard.left + fromCard.width},${
    fromCard.top + 0.5 * fromCard.height
  }
  C ${fromCard.left + fromCard.width + 1.5 * h},${
    fromCard.top + 0.5 * fromCard.height
  },
   ${toCard.left + toCard.width + 1.5 * h},${toCard.top + 0.5 * toCard.height},
   ${toCard.left + toCard.width},${toCard.top + 0.5 * toCard.height}`;
};
const calcPath = (objectCard: DOMRect, stepCard: DOMRect, height: number) => {
  //   console.log('calcPath', fromCard, toCard, height);
  const fromCard = objectCard.top < stepCard.top ? objectCard : stepCard;
  const toCard = objectCard.top < stepCard.top ? stepCard : objectCard;
  const h = fromCard.left * height;

  const ptList = [
    { x: fromCard.left, y: fromCard.top + fromCard.height - 10 },
    { x: fromCard.left - h, y: fromCard.top + fromCard.height + 10 - 10 },
    { x: toCard.left - h, y: toCard.top + 0 * toCard.height - 10 + 10 },
    { x: toCard.left, y: toCard.top + 0 * toCard.height + 10 },
  ];
  const path = [
    `M ${ptList[0].x},${ptList[0].y}`,
    `L ${ptList[1].x},${ptList[1].y}`,
    `L ${ptList[2].x},${ptList[2].y}`,
    `L ${ptList[3].x},${ptList[3].y}`,
  ].join(' ');
  return path;
};

export default observer(
  ({
    cardRefMap,
    renderCount,
    objectStepOrder,
    importantLines,
    actionIsHovered,
  }: RehearsalSvgProps) => {
    const IOLines = globalStorage.renderingIOLines;
    const edgeHeightMap = React.useMemo(
      () => getIOLineHeight(objectStepOrder, IOLines),
      [objectStepOrder, IOLines],
    );
    const [ioLineRects, setIOLineRects] = React.useState<
      [ILine, DOMRect, DOMRect][]
    >([]);
    const [importantLineRects, setImportantLineRects] = React.useState<
      [ILine, DOMRect, DOMRect][]
    >([]);
    const refreshCurrentIdRef = React.useRef(-1);

    React.useEffect(() => {
      refreshCurrentIdRef.current = (refreshCurrentIdRef.current + 1) % 100000;
      const currentId = refreshCurrentIdRef.current;
      const sleep = (time: number) =>
        new Promise(resolve => setTimeout(resolve, time));
      (async () => {
        let ioAllReady = false;
        let importantAllReady = false;
        const ioLineRects: [ILine, DOMRect, DOMRect][] = [];
        const importantLineRects: [ILine, DOMRect, DOMRect][] = [];
        while (true) {
          if (refreshCurrentIdRef.current !== currentId) {
            return;
          }
          const rootElement = cardRefMap.get('root')?.current;
          if (!rootElement) {
            await sleep(5);
            continue;
          }
          if (!ioAllReady) {
            ioAllReady = true;
            for (const line of IOLines) {
              const fromElement = cardRefMap.get(line.from)?.current;
              const toElement = cardRefMap.get(line.to)?.current;
              if (fromElement && toElement) {
                ioLineRects.push([
                  line,
                  getOffset(fromElement, rootElement),
                  getOffset(toElement, rootElement),
                ]);
              } else {
                ioAllReady = false;
                continue;
              }
            }
            if (!ioAllReady) {
              ioLineRects.length = 0;
              await sleep(5);
              continue;
            }
          }
          if (!importantAllReady) {
            importantAllReady = true;
            for (const line of importantLines) {
              const fromElement = cardRefMap.get(line.from)?.current;
              const toElement = cardRefMap.get(line.to)?.current;
              if (fromElement && toElement) {
                importantLineRects.push([
                  line,
                  getOffset(fromElement, rootElement),
                  getOffset(toElement, rootElement),
                ]);
              } else {
                importantAllReady = false;
                break;
              }
            }
            if (!importantAllReady) {
              importantLineRects.length = 0;
              await sleep(5);
              continue;
            }
          }
          break;
        }
        setIOLineRects(ioLineRects);
        setImportantLineRects(importantLineRects);
      })();
    }, [edgeHeightMap, renderCount, cardRefMap]);
    const ioLinesEle = React.useMemo(
      () =>
        ioLineRects.map(([line, from, to]) => {
          const key = `${line.from}.${line.to}`;
          const height = edgeHeightMap.get(key) || 0;
          return (
            <path
              key={`Rehearsal.IOLine.${key}`}
              fill="none"
              strokeWidth="3"
              stroke={line.type === 'output' ? '#FFCA8C' : '#B9DCB0'}
              d={calcPath(
                from,
                to,
                height / (Math.max(...edgeHeightMap.values()) + 1),
              )}
            />
          );
        }),
      [ioLineRects],
    );
    const importantLinesEle = React.useMemo(
      () =>
        importantLineRects
          .sort((a, b) => {
            // eslint-disable-next-line no-nested-ternary
            return a[0].to === b[0].to
              ? 0
              : a[0].to === actionIsHovered
              ? 1
              : -1;
          })
          .map(([line, from, to]) => {
            const key = `${line.from}.${line.to}`;
            return (
              <path
                key={`Rehearsal.ImportantLine.${key}`}
                fill="none"
                strokeWidth="3"
                stroke={
                  (getAgentActionStyle(line.type as any) as any).borderColor
                }
                d={calcCurve(from, to, 0.5)}
                strokeOpacity={actionIsHovered === line.to ? 1 : 0.2}
                // style={{
                //   ...(actionIsHovered === line.to
                //     ? { filter: 'brightness(110%) saturate(100%)' }
                //     : { filter: 'brightness(100%) saturate(20%)' }),
                // }}
              />
            );
          }),
      [importantLineRects, actionIsHovered],
    );
    const height = cardRefMap
      .get('root')
      ?.current?.querySelector?.('.contents-stack')?.scrollHeight;

    return (
      <Box
        component="svg"
        sx={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '100%',
          height: height ? `${height}px` : '100%',
          zIndex: 999,
          pointerEvents: 'none',
        }}
      >
        <g>{ioLinesEle}</g>
        <g>{importantLinesEle}</g>
      </Box>
    );
  },
);
