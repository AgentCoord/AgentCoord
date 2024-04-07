import React from 'react';
import throttle from 'lodash/throttle';
import { SxProps } from '@mui/material';
import { observer } from 'mobx-react-lite';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import RefreshIcon from '@mui/icons-material/Refresh';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CircularProgress from '@mui/material/CircularProgress';
import ObjectNode from './ObjectNode';
import StepNode from './StepNode';
import RehearsalSvg from './RehearsalSvg';
import { globalStorage } from '@/storage';
import Title from '@/components/Title';
import { ExecuteNodeType } from '@/apis/execute-plan';
import { useResize } from '@/utils/resize-hook';

export default observer(({ style = {} }: { style?: SxProps }) => {
  const [renderCount, setRenderCount] = React.useState(0);
  const cardRefMap = React.useMemo(
    () => new Map<string, React.RefObject<HTMLElement>>(),
    [],
  );
  const touchRef = React.useCallback(
    (id: string, existingRef?: React.RefObject<HTMLElement>) => {
      if (existingRef) {
        cardRefMap.set(id, existingRef);
        return existingRef;
      }
      if (cardRefMap.has(id)) {
        return cardRefMap.get(id)!;
      } else {
        cardRefMap.set(id, React.createRef<HTMLElement>());
        return cardRefMap.get(id)!;
      }
    },
    [cardRefMap],
  );
  const render = React.useMemo(
    () =>
      throttle(
        () =>
          // eslint-disable-next-line max-nested-callbacks
          requestAnimationFrame(() => setRenderCount(old => (old + 1) % 100)),
        5,
        {
          leading: false,
          trailing: true,
        },
      ),
    [],
  );
  const stackRef = useResize(render);
  const [actionIsHovered, setActionIsHovered] = React.useState<
    string | undefined
  >();

  return (
    <Box
      sx={{
        background: '#FFF',
        border: '3px solid #E1E1E1',
        display: 'flex',
        overflow: 'hidden',
        flexDirection: 'column',
        width: '100%',
        ...style,
      }}
    >
      <Box
        sx={{
          fontWeight: 600,
          fontSize: '18px',
          userSelect: 'none',
          padding: '0 6px 0 0',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Title title="Execution Result" />
        <Box
          sx={{
            flexGrow: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'end',
          }}
        >
          {globalStorage.api.planExecuting ? (
            <CircularProgress
              sx={{
                width: '12px !important',
                height: '12px !important',
                marginLeft: '6px',
              }}
            />
          ) : (
            <></>
          )}
          {globalStorage.api.planExecuting ? (
            <></>
          ) : (
            <>
              <IconButton
                disabled={!globalStorage.logManager.outdate}
                size="small"
                onClick={() => globalStorage.logManager.clearLog()}
                sx={{
                  color: 'error.main',
                  '&:hover': {
                    color: 'error.dark',
                  },
                }}
              >
                <RefreshIcon />
              </IconButton>
              <IconButton
                disabled={!globalStorage.api.ready}
                size="small"
                onClick={() => globalStorage.executePlan(Infinity)}
                sx={{
                  color: 'primary.main',
                  '&:hover': {
                    color: 'primary.dark',
                  },
                }}
              >
                <PlayArrowIcon />
              </IconButton>
            </>
          )}
        </Box>
      </Box>
      <Box
        sx={{
          position: 'relative',
          height: 0,
          flexGrow: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '6px 6px',
        }}
        onScroll={() => {
          globalStorage.renderLines({ delay: 0, repeat: 2 });
        }}
      >
        <Box sx={{ height: '100%', width: '100%' }}>
          <Box sx={{ position: 'relative' }} ref={touchRef('root', stackRef)}>
            <Stack
              spacing="12px"
              sx={{
                position: 'absolute',
                zIndex: 1,
                marginLeft: '12px',
                marginRight: '12px',
                width: 'calc(100% - 24px)',
                paddingBottom: '24px',
              }}
              className="contents-stack"
            >
              {Object.keys(globalStorage.form.inputs).map(name => (
                <ObjectNode
                  key={`rehearsal.object.${name}`}
                  name={name}
                  content=""
                  stepId=""
                  editObjectName={name}
                  _ref={touchRef(`Object.${name}`)}
                  handleExpand={() => {
                    // render();
                    setRenderCount(old => (old + 1) % 100);
                  }}
                />
              ))}
              {globalStorage.logManager.renderingLog.map(node =>
                node.type === ExecuteNodeType.Step ? (
                  <StepNode
                    key={`rehearsal.step.${node.id}`}
                    id={node.stepId}
                    _ref={touchRef(`Step.${node.id}`, node.ref)}
                    name={node.id}
                    history={node.history}
                    touchRef={touchRef}
                    actionHoverCallback={setActionIsHovered}
                    handleExpand={() => {
                      // render();
                      setRenderCount(old => (old + 1) % 100);
                    }}
                  />
                ) : (
                  <ObjectNode
                    key={`rehearsal.object.${node.id}`}
                    _ref={touchRef(`Object.${node.id}`, node.ref)}
                    name={node.id}
                    content={node.content}
                    stepId={node.stepId}
                    handleExpand={() => {
                      // render();
                      setRenderCount(old => (old + 1) % 100);
                    }}
                  />
                ),
              )}
            </Stack>
            <RehearsalSvg
              renderCount={renderCount}
              cardRefMap={cardRefMap}
              actionIsHovered={actionIsHovered}
              objectStepOrder={globalStorage.rehearsalSvgObjectOrder}
              importantLines={globalStorage.rehearsalSvgLines}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
});
