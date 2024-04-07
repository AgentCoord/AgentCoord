import { observer } from 'mobx-react-lite';
import { SxProps } from '@mui/material';
import Box from '@mui/material/Box';
import DutyItem from './DutyItem';
import AgentIcon from '@/components/AgentIcon';
import { IAgentCard, globalStorage } from '@/storage';
import ChangeAgentIcon from '@/icons/ChangeAgentIcon';

export interface IAgentCardProps {
  agent: IAgentCard;
  style?: SxProps;
}

export default observer(({ agent, style = {} }: IAgentCardProps) => (
  <Box sx={{ position: 'relative' }}>
    <Box
      sx={{
        width: 'calc(100% - 16px)',
        borderRadius: '8px',
        display: 'flex',
        backgroundColor: '#F6F6F6',
        border: '2px solid #E5E5E5',
        padding: '6px',
        flexDirection: 'column',
        flexShrink: 0,
        ...style,
      }}
      ref={agent.ref}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'start',
          justifyContent: 'space-between',
          padding: '0px 10px 4px 12px',
          userSelect: 'none',
          marginBottom: agent.actions.length > 0 ? '4px' : undefined,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'start',
            width: 'calc(100% - 55px)',
            paddingTop: '8px',
          }}
        >
          <Box
            sx={{
              fontSize: '18px',
              fontWeight: 800,
              lineHeight: '20px',
            }}
          >
            {agent.name}
          </Box>
          <Box
            sx={{
              margin: '4px 0',
              fontSize: '14px',
              lineHeight: '16px',
              fontWeight: 600,
              color: '#707070',
              userSelect: 'none',
            }}
          >
            {agent.profile}
          </Box>
        </Box>
        <Box
          sx={{
            flexShrink: 0,
            width: '55px',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <AgentIcon
            name={agent.icon}
            style={{
              width: '80%',
              height: 'auto',
              margin: '0px',
            }}
          />
        </Box>
      </Box>
      {agent.actions.length > 0 ? (
        <Box
          sx={{
            padding: '4px 8px',
            background: '#E4F0F0',
            borderRadius: '12px',
            border: '3px solid #A9C6C5',
          }}
        >
          <Box
            sx={{
              fontSize: '16px',
              fontWeight: 800,
              color: '#4F8A87',
              marginLeft: '2px',
            }}
          >
            Current Duty:
          </Box>
          <Box>
            {agent.actions.map((action, index) => (
              <DutyItem
                // eslint-disable-next-line react/no-array-index-key
                key={`${agent.name}.${action.type}.${index}`}
                action={action}
              />
            ))}
          </Box>
        </Box>
      ) : (
        <></>
      )}
    </Box>
    {agent.lastOfUsed ? (
      <Box
        sx={{
          cursor: 'pointer',
          userSelect: 'none',
          position: 'absolute',
          right: '-4px',
          bottom: 0,
          width: '32px',
          height: '32px',
          bgcolor: 'primary.main',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '10px 0 0 0',
          '&:hover': {
            filter: 'brightness(0.9)',
          },
        }}
        onClick={() => (globalStorage.agentAssigmentWindow = true)}
      >
        <ChangeAgentIcon />
        <Box
          component="span"
          sx={{
            fontSize: '12px',
            position: 'absolute',
            right: '1px',
            bottom: 0,
            color: 'white',
            fontWeight: 800,
            textAlign: 'right',
          }}
        >
          {globalStorage.focusingStepTask?.agentSelectionIds?.length ?? 0}
        </Box>
      </Box>
    ) : (
      <></>
    )}
  </Box>
));
