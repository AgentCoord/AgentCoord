import React from 'react';
import { Divider, SxProps } from '@mui/material';
import Box from '@mui/material/Box';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
import { IAgentAction, globalStorage } from '@/storage';

export interface IDutyItem {
  action: IAgentAction;
  style?: SxProps;
}

export default React.memo<IDutyItem>(({ action, style = {} }) => {
  const [expand, setExpand] = React.useState(false);
  const _style = {
    ...action.style,
    ...style,
  };
  React.useEffect(() => {
    globalStorage.renderLines({
      repeat: 3,
      delay: 0,
      interval: 20,
    });
  }, [expand]);
  if (!expand) {
    return (
      <Box
        sx={{
          display: 'inline-flex',
          fontSize: '14px',
          alignItems: 'center',
          borderRadius: '10px',
          padding: '0 4px 0 8px',
          marginRight: '4px',
          fontWeight: 600,
          border: '2px solid #0003',
          ..._style,
        }}
      >
        {action.type}
        <Box
          onClick={() => setExpand(true)}
          sx={{
            cursor: 'pointer',
            userSelect: 'none',
            height: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#0002',
            borderRadius: '8px',
            marginLeft: '8px',
            padding: '0 4px',
            '&:hover': {
              background: '#0003',
            },
          }}
        >
          <MoreHorizIcon sx={{ fontSize: '16px' }} />
        </Box>
      </Box>
    );
  }
  return (
    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        fontSize: '14px',
        flexDirection: 'column',
        borderRadius: '10px',
        border: '2px solid #0003',
        padding: '4px 4px 4px 8px',
        margin: '4px 0',
        ..._style,
      }}
    >
      <Box
        sx={{
          fontWeight: 600,
          paddingBottom: '4px',
          marginLeft: '2px',
        }}
      >
        {action.type}
      </Box>
      <Divider
        sx={{
          margin: '1px 0px',
          borderBottom: '2px dashed', // 设置为虚线
          borderColor: (action.style as any).borderColor ?? '#888888',
        }}
      />
      <Box sx={{ margin: '4px 2px', color: '#0009', fontWeight: 400 }}>
        {action.description}
      </Box>
      <Box
        onClick={() => setExpand(false)}
        sx={{
          position: 'absolute',
          right: '6px',
          bottom: '6px',
          cursor: 'pointer',
          userSelect: 'none',
          height: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0002',
          borderRadius: '12px',
          marginLeft: '4px',
          padding: '0 4px',
          '&:hover': {
            background: '#0003',
          },
        }}
      >
        <UnfoldLessIcon sx={{ fontSize: '16px', transform: 'rotate(90deg)' }} />
      </Box>
    </Box>
  );
});
