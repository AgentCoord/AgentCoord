import React from 'react';
import { SxProps } from '@mui/material';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import SwapVertIcon from '@mui/icons-material/SwapVert';

export interface IAgentRepoProps {
  style?: SxProps;
}

const REPO_COLORS: string[] = [
  'rgb(172,172,172)',
  'rgb(165,184,182)',
  'rgb(159,195,192)',
  'rgb(153,206,202)',
  'rgb(107,204,198)',
];

export default React.memo<IAgentRepoProps>(() => {
  const repos = React.useMemo(
    () =>
      Array(30)
        .fill(0)
        .map((_, index) => (
          <Box
            key={index}
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Box
              sx={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background:
                  REPO_COLORS[Math.floor(Math.random() * REPO_COLORS.length)],
                cursor: 'pointer',
                transition: 'all 0.3s',
                filter: 'contrast(1.0)',
                '&:hover': {
                  filter: 'contrast(1.3)',
                },
              }}
            />
          </Box>
        )),
    [],
  );
  return (
    <>
      <Box
        sx={{
          width: '100%',
          opacity: 0.5,
          fontWeight: 600,
          fontSize: '18px',
          userSelect: 'none',
          padding: '2px 6px',
        }}
      >
        Agent Repo
      </Box>
      <Box
        sx={{
          position: 'relative',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(40px, 1fr))',
          gap: '6px',
          padding: '16px 10px',
          background: '#CCC',
          borderRadius: '10px',
        }}
      >
        {repos}
        <IconButton
          aria-label="提交"
          sx={{ position: 'absolute', right: '6px', bottom: '2px' }}
        >
          <SwapVertIcon />
        </IconButton>
      </Box>
    </>
  );
});
