import React from 'react';
import { SxProps } from '@mui/material';
import Box from '@mui/material/Box';
import HireRequirement from './HireRequirement';
import AgentRepo from './AgentRepo';
import AgentCart from './AgentCart';

export default React.memo<{ style?: SxProps }>(({ style = {} }) => {
  return (
    <Box
      sx={{
        background: '#F3F3F3',
        // borderRadius: '10px',
        padding: '10px',
        display: 'flex',
        overflow: 'hidden',
        flexDirection: 'column',
        overflowY: 'auto',
        overflowX: 'hidden',
        ...style,
      }}
    >
      <HireRequirement />
      <AgentRepo />
      <AgentCart />
    </Box>
  );
});
