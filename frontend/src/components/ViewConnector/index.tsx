import React from 'react';
import Box from '@mui/material/Box';
import { observer } from 'mobx-react-lite';
import { min, max } from 'lodash';
import { globalStorage } from '@/storage';

const mergeRects = (...rects: DOMRect[]) => {
  const minX = min(rects.map(rect => rect.left)) ?? 0;
  const minY = min(rects.map(rect => rect.top)) ?? 0;
  const maxX = max(rects.map(rect => rect.left + rect.width)) ?? 0;
  const maxY = max(rects.map(rect => rect.top + rect.height)) ?? 0;
  return new DOMRect(minX, minY, maxX - minX, maxY - minY);
};

const drawConnectors = (() => {
  let lastRectString = '';
  let lastRenderCache = <></>;
  return (...rects: DOMRect[]) => {
    const rectString = rects
      .map(rect => `${rect.left},${rect.top},${rect.width},${rect.height}`)
      .join('');
    if (rectString === lastRectString) {
      return lastRenderCache;
    }
    lastRectString = rectString;
    const margin = 5;
    const connectors: React.ReactNode[] = [];
    for (const rect of rects) {
      connectors.push(
        <g>
          <line
            x1={rect.left - margin}
            y1={rect.top}
            x2={rect.left - margin}
            y2={rect.top + rect.height}
            stroke="#43A8AA"
            strokeWidth="4"
          ></line>
          <line
            x1={rect.left + rect.width + margin}
            y1={rect.top}
            x2={rect.left + rect.width + margin}
            y2={rect.top + rect.height}
            stroke="#43A8AA"
            strokeWidth="4"
          ></line>
        </g>,
      );
    }
    for (let i = 0; i <= rects.length - 2; i++) {
      const rect1 = rects[i];
      const rect2 = rects[i + 1];
      connectors.push(
        <g>
          <path
            d={`M ${rect1.left + rect1.width + margin},${rect1.top}
                L ${rect2.left - margin},${rect2.top}
                ${rect2.left - margin},${rect2.top + rect2.height}
                ${rect1.left + rect1.width + margin},${
              rect1.top + rect1.height
            }`}
            fill="#86D2CE"
            fillOpacity={0.5}
            // strokeWidth="2"
          ></path>
        </g>,
      );
    }
    lastRenderCache = <>{connectors}</>;
    return lastRenderCache;
  };
})();

export default observer(() => {
  const [drawCallId, setDrawCallId] = React.useState(0);
  React.useEffect(() => {
    globalStorage.setRenderLinesMethod(() =>
      setDrawCallId(old => (old + 1) % 100),
    );
    return () => globalStorage.setRenderLinesMethod(undefined);
  }, []);
  const [connectors, setConnectors] = React.useState(<></>);

  React.useEffect(() => {
    try {
      const { ElementToLink } = globalStorage;
      if (!globalStorage.focusingStepTask) {
        setConnectors(<></>);
      }
      const outlinePosition =
        ElementToLink[0]?.current?.getBoundingClientRect?.();
      if (!outlinePosition) {
        return;
      }
      const agentRects = ElementToLink[1]
        .map(ele => ele.current?.getBoundingClientRect?.() as DOMRect)
        .filter(rect => rect);
      if (agentRects.length === 0) {
        return;
      }
      const agentsPosition = mergeRects(...agentRects);
      const descriptionPosition =
        ElementToLink[2]?.current?.getBoundingClientRect?.();
      if (!descriptionPosition) {
        return;
      }

      const LogRects = ElementToLink[3]
        .map(ele => ele?.current?.getBoundingClientRect?.() as DOMRect)
        .filter(rect => rect);
      if (LogRects.length > 0) {
        const logPosition = mergeRects(...LogRects);
        logPosition.x -= 5;
        logPosition.width += 10;

        setConnectors(
          drawConnectors(
            outlinePosition,
            agentsPosition,
            descriptionPosition,
            logPosition,
          ),
        );
      } else {
        setConnectors(
          drawConnectors(outlinePosition, agentsPosition, descriptionPosition),
        );
      }
    } catch (e) {
      console.error(e);
    }
  }, [drawCallId, globalStorage.ElementToLink]);

  return (
    <Box
      component="svg"
      sx={{
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        right: 0,
        height: '100%',
        width: '100%',
        pointerEvents: 'none',
        zIndex: 1,
        clipPath: 'inset(136px 0px 5px 0px)',
      }}
    >
      {connectors}
    </Box>
  );
});
