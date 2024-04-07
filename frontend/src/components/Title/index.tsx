import React from 'react';
import { SxProps } from '@mui/material';
import Box from '@mui/material/Box';

export default React.memo<{ title: string; style?: SxProps }>(
  ({ title, style = {} }) => {
    return (
      <Box
        component="span"
        sx={{
          position: 'relative',
          height: '35px', // 容器的高度
          userSelect: 'none',
          display: 'flex',
          marginTop: '-4px',
          ...style,
        }}
      >
        <Box
          component="span"
          sx={{
            display: 'inline-flex',
            height: '100%',
            backgroundColor: '#E1E1E1',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'primary.main',
            fontWeight: 800,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            paddingLeft: '10px',
            paddingRight: '10px',
            fontSize: '20px',
          }}
        >
          {title}
        </Box>
        <Box
          component="span"
          sx={{
            height: 0,
            width: 0,
            borderRight: '26px solid transparent',
            borderTop: '35px solid #E1E1E1', // 与矩形相同的颜色
          }}
        />
      </Box>
    );
  },
);
