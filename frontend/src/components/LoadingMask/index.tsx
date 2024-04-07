import React from 'react';
import { SxProps } from '@mui/material';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

export default React.memo<{ style?: SxProps }>(({ style = {} }) => (
  <Box
    sx={{
      position: 'absolute',
      height: '100%',
      width: '100%',
      backdropFilter: 'blur(5px)',
      backgroundColor: '#FFF3',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      ...style,
    }}
  >
    <CircularProgress />
  </Box>
));
