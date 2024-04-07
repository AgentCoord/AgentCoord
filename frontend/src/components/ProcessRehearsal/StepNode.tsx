import { observer } from 'mobx-react-lite';
import { SxProps } from '@mui/material';
import Box from '@mui/material/Box';
import React from 'react';
import StepHistoryItem from './StepHistoryItem';
import type { IExecuteStepHistoryItem } from '@/apis/execute-plan';
import { globalStorage } from '@/storage';

export interface IStepNodeProps {
  name: string;
  history: IExecuteStepHistoryItem[];
  touchRef: (
    id: string,
    existingRef?: React.RefObject<HTMLElement>,
  ) => React.RefObject<HTMLElement>;
  _ref?: React.RefObject<HTMLDivElement | HTMLElement>;

  style?: SxProps;
  id: string;
  actionHoverCallback: (actionName: string | undefined) => void;
  handleExpand?: () => void;
}

export default observer(
  ({
    style = {},
    name,
    history,
    _ref,
    touchRef,
    id,
    actionHoverCallback,
    handleExpand,
  }: IStepNodeProps) => {
    return (
      <Box
        sx={{
          userSelect: 'none',
          borderRadius: '12px',
          background: '#F6F6F6',
          padding: '10px',
          border: '2px solid #E5E5E5',
          fontSize: '14px',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          cursor: 'pointer',
          transition: 'all 200ms ease-in-out',
          '&:hover': {
            border: '2px solid #0002',
            backgroundImage: 'linear-gradient(0, #0000000A, #0000000A)',
          },
          '& > .step-history-item:first-of-type': {
            marginTop: '10px',
          },
          ...style,
        }}
        ref={_ref}
        onClick={() => {
          if (id) {
            globalStorage.setFocusingStepTaskId(id);
          }
        }}
      >
        <Box component="span" sx={{ fontWeight: 800 }}>
          {name}
        </Box>
        {history.map((item, index) => (
          <StepHistoryItem
            // eslint-disable-next-line react/no-array-index-key
            key={`${item.id}.${item.agent}.${index}`}
            item={item}
            actionRef={touchRef(`Action.${name}.${item.id}`)!}
            hoverCallback={(isHovered: boolean) => {
              // console.log(isHovered, 'hover', `action.${name}.${item.id}`);
              actionHoverCallback(
                isHovered ? `Action.${name}.${item.id}` : undefined,
              );
            }}
            handleExpand={handleExpand}
          />
        ))}
      </Box>
    );
  },
);
