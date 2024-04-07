import React from 'react';
import { observer } from 'mobx-react-lite';
import { SxProps } from '@mui/material';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import AgentCard from './AgentCard';
import { globalStorage } from '@/storage';
import { IconMap } from '@/components/AgentIcon';
import LoadingMask from '@/components/LoadingMask';
import Title from '@/components/Title';

export interface IAgentBoardProps {
  style?: SxProps;
  onAddAgent?: () => void;
}

export default observer(({ style = {} }: IAgentBoardProps) => {
  const {
    agentCards,
    api: { fetchingAgents },
  } = globalStorage;
  const onFileChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = e => {
          if (!e.target?.result) {
            return;
          }
          try {
            const json = JSON.parse(e.target.result?.toString?.() ?? '{}');
            // 检查json是否满足{Name:string,Icon:string,Profile:string}[]
            if (Array.isArray(json)) {
              const isValid = json.every(
                item =>
                  typeof item.Name === 'string' &&
                  typeof item.Icon === 'string' &&
                  typeof item.Profile === 'string',
              );
              if (isValid) {
                globalStorage.setAgents(
                  json.map(agent => ({
                    name: agent.Name,
                    icon: IconMap[agent.Icon.replace(/\.png$/, '')],
                    profile: agent.Profile,
                  })),
                );
              } else {
                console.error('Invalid JSON format');
              }
            } else {
              console.error('JSON is not an array');
            }
          } catch (e) {
            console.error(e);
          }
        };
        reader.readAsText(file);
        event.target.value = '';
        event.target.files = null;
      }
    },
    [],
  );

  return (
    <Box
      sx={{
        background: '#FFF',
        border: '3px solid #E1E1E1',
        display: 'flex',
        overflow: 'hidden',
        flexDirection: 'column',
        ...style,
      }}
    >
      <Box
        sx={{
          fontWeight: 600,
          fontSize: '18px',
          userSelect: 'none',
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          '& > input': { display: 'none' },
        }}
      >
        <Title title="Agent Board" />
        <Box
          sx={{
            flexGrow: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'end',
          }}
        >
          <IconButton
            size="small"
            component="label"
            disabled={fetchingAgents}
            sx={{
              color: 'primary.main',
              '&:hover': {
                color: 'primary.dark',
              },
            }}
          >
            <PersonAddAlt1Icon />
            <input
              type="file"
              accept=".json"
              onChange={onFileChange}
              style={{
                clip: 'rect(0 0 0 0)',
                clipPath: 'inset(50%)',
                height: 1,
                overflow: 'hidden',
                position: 'absolute',
                bottom: 0,
                left: 0,
                whiteSpace: 'nowrap',
                width: 1,
              }}
            />
          </IconButton>
        </Box>
      </Box>
      <Stack
        spacing={1}
        sx={{
          position: 'relative',
          padding: '6px 12px',
          // paddingBottom: '44px',
          borderRadius: '10px',
          height: 0,
          flexGrow: 1,
          overflowY: 'auto',
        }}
        onScroll={() => globalStorage.renderLines({ delay: 0, repeat: 2 })}
      >
        {agentCards.map(agent => {
          return <AgentCard key={agent.name} agent={agent} />;
        })}
        {fetchingAgents ? (
          <LoadingMask
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          />
        ) : (
          <></>
        )}
      </Stack>
    </Box>
  );
});
