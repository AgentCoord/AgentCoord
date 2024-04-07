import React from 'react';
import { observer } from 'mobx-react-lite';
import { Divider, SxProps } from '@mui/material';
import Box from '@mui/material/Box';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import MarkdownBlock from '@/components/MarkdownBlock';
import { globalStorage } from '@/storage';
import type { IExecuteStepHistoryItem } from '@/apis/execute-plan';
import AgentIcon from '@/components/AgentIcon';
import { getAgentActionStyle } from '@/storage/plan';

export interface IStepHistoryItemProps {
  item: IExecuteStepHistoryItem;
  actionRef: React.RefObject<HTMLDivElement | HTMLElement>;
  style?: SxProps;
  hoverCallback: (isHovered: boolean) => void;
  handleExpand?: () => void;
}

export default observer(
  ({
    item,
    actionRef,
    hoverCallback,
    handleExpand,
    style = {},
  }: IStepHistoryItemProps) => {
    const [expand, setExpand] = React.useState(false);
    const refDetail = React.useRef<HTMLDivElement>(null);
    // 使用useEffect来更新detail容器的高度
    React.useEffect(() => {
      if (refDetail.current) {
        refDetail.current.style.height = expand
          ? `${refDetail.current.scrollHeight}px`
          : '0px';
      }
      if (handleExpand) {
        let count = 0;
        const intervalId = setInterval(() => {
          handleExpand();
          count++;
          if (count >= 20) {
            clearInterval(intervalId);
          }
        }, 10);
      }
    }, [expand]);
    const s = { ...getAgentActionStyle(item.type), ...style } as SxProps;
    React.useEffect(() => {
      console.log(item);
    }, [item]);
    return (
      <Box
        ref={actionRef}
        className="step-history-item"
        sx={{
          userSelect: 'none',
          borderRadius: '10px',
          padding: '4px',
          fontSize: '14px',
          position: 'relative',
          marginTop: '4px',
          backgroundColor: (s as any).backgroundColor,
          border: `2px solid ${(s as any).borderColor}`,
        }}
        onMouseOver={() => hoverCallback(true)}
        onMouseOut={() => hoverCallback(false)}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <AgentIcon
            name={globalStorage.agentIconMap.get(item.agent)}
            style={{ height: '36px', width: 'auto', margin: '0px' }}
            tooltipInfo={globalStorage.agentMap.get(item.agent)}
          />
          <Box component="span" sx={{ fontWeight: 500, marginLeft: '4px' }}>
            {item.agent}
          </Box>
          <Box component="span" sx={{ fontWeight: 400 }}>
            : {item.type}
          </Box>
        </Box>
        {item.result ? (
          <Box
            ref={refDetail}
            sx={{
              overflow: 'hidden',
              transition: 'height 200ms ease-out', // 添加过渡效果
            }}
          >
            {expand ? (
              <>
                <Divider
                  sx={{
                    margin: '4px 0px',
                    borderBottom: '2px dashed', // 设置为虚线
                    borderColor: '#0003',
                  }}
                />
                <Box
                  sx={{
                    marginLeft: '6px',
                    marginBottom: '4px',
                    color: '#0009',
                    fontWeight: 400,
                  }}
                >
                  {item.description}
                </Box>
                <MarkdownBlock
                  text={item.result}
                  style={{
                    marginTop: '5px',
                    borderRadius: '10px',
                    padding: '6px',
                    background: '#FFF9',
                    fontSize: '12px',
                    maxHeight: '240px',
                    overflowY: 'auto',
                    border: '1px solid #0003',
                    whiteSpace: 'pre-wrap',
                    wordWrap: 'break-word',
                    marginBottom: '5px',
                  }}
                />
              </>
            ) : (
              <></>
            )}
            <Box
              onClick={e => {
                setExpand(v => !v);
                e.stopPropagation();
              }}
              sx={{
                position: 'absolute',
                right: '8px',
                // bottom: '12px',
                top: '24px',
                cursor: 'pointer',
                userSelect: 'none',
                height: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#0002',
                borderRadius: '8px',
                marginLeft: '4px',
                padding: '0 4px',
                '&:hover': {
                  background: '#0003',
                },
              }}
            >
              {expand ? (
                <UnfoldLessIcon
                  sx={{ fontSize: '16px', transform: 'rotate(90deg)' }}
                />
              ) : (
                <MoreHorizIcon sx={{ fontSize: '16px' }} />
              )}
            </Box>
          </Box>
        ) : (
          <></>
        )}
      </Box>
    );
  },
);
