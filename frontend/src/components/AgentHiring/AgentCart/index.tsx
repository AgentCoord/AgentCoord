import React from 'react';
import { SxProps } from '@mui/material';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HiringCard from './HiringCard';
import { globalStorage } from '@/storage';
import LoadingMask from '@/components/LoadingMask';

export interface IAgentCartProps {
  style?: SxProps;
}

export default React.memo<IAgentCartProps>(() => {
  //   const { agents, refreshAgents, refresingAgents } =
  //     React.useContext(GlobalContext);
  //   return (
  //     <>
  //       <Box
  //         sx={{
  //           width: '100%',
  //           opacity: 0.5,
  //           fontWeight: 600,
  //           fontSize: '18px',
  //           userSelect: 'none',
  //           padding: '2px 6px',
  //         }}
  //       >
  //         Agent Cart
  //       </Box>
  //       {refresingAgents ? (
  //         <LoadingMask
  //           style={{
  //             position: 'absolute',
  //             top: 0,
  //             left: 0,
  //             right: 0,
  //             bottom: 0,
  //           }}
  //         />
  //       ) : (
  //         <Stack
  //           spacing={1}
  //           sx={{
  //             position: 'relative',
  //             padding: '6px',
  //             paddingBottom: '44px',
  //             background: '#CCC',
  //             borderRadius: '10px',
  //           }}
  //         >
  //           {agents.map(agent => (
  //             <HiringCard
  //               key={agent.name}
  //               icon={agent.icon}
  //               name={agent.name}
  //               profile={agent.profile}
  //             />
  //           ))}
  //           <IconButton
  //             aria-label="刷新"
  //             onClick={refreshAgents}
  //             disabled={refresingAgents}
  //             sx={{ position: 'absolute', right: '36px', bottom: '2px' }}
  //           >
  //             <RefreshIcon />
  //           </IconButton>
  //           <IconButton
  //             aria-label="提交"
  //             disabled={refresingAgents}
  //             sx={{ position: 'absolute', right: '6px', bottom: '2px' }}
  //           >
  //             <CheckCircleOutlineIcon />
  //           </IconButton>
  //         </Stack>
  //       )}
  //     </>
  //   );
  return <></>;
});
