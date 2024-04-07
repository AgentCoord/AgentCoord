import React from 'react';
import throttle from 'lodash/throttle';
import { observer } from 'mobx-react-lite';
import Box from '@mui/material/Box';
import AgentDetailCard from './AgentDetailCard';
import { globalStorage } from '@/storage';
import { StepTaskNode } from '@/storage/plan';
import { useResize } from '@/utils/resize-hook';
import BranchIcon from '@/icons/BranchIcon';

export default observer(({ step }: { step: StepTaskNode }) => {
  const card = step.descriptionCard;
  const [expand, setExpand] = React.useState(false);
  const expandRef = React.useRef(expand);
  React.useEffect(() => {
    globalStorage.renderLines({ delay: 1, repeat: 20 });
  }, [expand]);
  const render = React.useMemo(
    () =>
      throttle(
        () =>
          requestAnimationFrame(() => {
            if (refDetail.current) {
              refDetail.current.style.height = expandRef.current
                ? `${
                    refDetail.current.querySelector('.description-detail')!
                      .scrollHeight + 12
                  }px`
                : '0px';
            }
          }),
        5,
        {
          leading: false,
          trailing: true,
        },
      ),
    [],
  );
  React.useEffect(() => {
    expandRef.current = expand;
    render();
  }, [expand]);
  React.useEffect(() => {
    setExpand(globalStorage.focusingStepTaskId === step.id);
  }, [globalStorage.focusingStepTaskId]);
  const refDetail = useResize<HTMLDivElement>(render);
  return (
    <Box sx={{ position: 'relative' }}>
      <Box
        sx={{
          position: 'relative',
          fontSize: '14px',
          flexDirection: 'column',
          background: '#F6F6F6',
          borderRadius: '8px',
          padding: '8px 4px',
          margin: '2px 0',
          cursor: 'pointer',
          border: '2px solid #E5E5E5',
          transition: 'all 80ms ease-in-out',
          '&:hover': {
            border: '2px solid #cdcdcd',
            backgroundImage: 'linear-gradient(0, #00000008, #00000008)',
          },
          display: step.brief.template ? 'flex' : 'none',
        }}
        ref={card.ref}
        onClick={() => globalStorage.setFocusingStepTaskId(step.id)}
      >
        <Box sx={{ marginLeft: '4px' }}>
          {card.brief.map(({ text, style }, index) =>
            style ? (
              <Box
                component="span"
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                sx={{
                  userSelect: 'none',
                  padding: '0 4px',
                  fontWeight: 600,
                  transition: 'filter 100ms',
                  ...style,
                }}
              >
                {text}
              </Box>
            ) : (
              <Box
                component="span"
                key={index}
                sx={{ userSelect: 'none', lineHeight: '1.43rem' }}
              >
                {text}
              </Box>
            ),
          )}
        </Box>
        <Box
          ref={refDetail}
          sx={{
            overflow: 'hidden',
            transition: 'height 200ms ease-out', // 添加过渡效果
          }}
        >
          {expand ? (
            <Box
              sx={{
                marginTop: '5px',
                borderRadius: '12px',
                padding: '4px 8px',
                background: '#E4F0F0',
                border: '3px solid #A9C6C5',
                cursor: 'auto',
              }}
              className="description-detail"
            >
              <Box
                sx={{
                  color: '#4F8A87',
                  fontWeight: 800,
                  fontSize: '16px',
                  marginBottom: '4px',
                }}
              >
                Specification:
              </Box>
              {card.detail.map((node, index) => (
                <AgentDetailCard
                  key={index}
                  node={node[0] as any}
                  id={node[1] as any}
                  render={render}
                />
              ))}
            </Box>
          ) : (
            <></>
          )}
        </Box>
      </Box>
      {globalStorage.focusingStepTaskId === step.id ? (
        <Box
          sx={{
            cursor: 'pointer',
            userSelect: 'none',
            position: 'absolute',
            right: '-4px',
            bottom: '2px',
            width: '32px',
            height: '32px',
            bgcolor: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '10px 0 0 0',
            '&:hover': {
              filter: 'brightness(0.9)',
            },
          }}
          onClick={() => (globalStorage.taskProcessModificationWindow = true)}
        >
          <BranchIcon />
          <Box
            component="span"
            sx={{
              fontSize: '12px',
              position: 'absolute',
              right: '3px',
              bottom: 0,
              color: 'white',
              fontWeight: 800,
              textAlign: 'right',
            }}
          >
            {step.agentSelection?.leaves?.length ?? 0}
          </Box>
        </Box>
      ) : (
        <></>
      )}
    </Box>
  );
});
