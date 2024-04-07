import React from 'react';
import { SxProps } from '@mui/material';
import Box from '@mui/material/Box';
import AgentIcon, { IAgentIconProps } from '@/components/AgentIcon';

export interface IHiringCardProps {
  icon: IAgentIconProps['name'];
  name: string;
  profile: string;
  style?: SxProps;
}

export default React.memo<IHiringCardProps>(
  ({ icon, name, profile, style = {} }) => (
    <Box
      sx={{
        borderRadius: '6px',
        display: 'flex',
        backgroundColor: '#BBB',
        padding: '8px 4px',
        ...style,
      }}
    >
      <AgentIcon
        name={icon}
        style={{
          flexGrow: 0,
          width: '40px',
          height: 'auto',
          marginRight: '6px',
        }}
      />
      <Box sx={{ flexGrow: 1, width: 0, height: '100%', fontSize: '14px' }}>
        <strong>{name}</strong>: {profile}
      </Box>
    </Box>
  ),
);
