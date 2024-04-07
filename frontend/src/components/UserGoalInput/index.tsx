import React from 'react';
import { observer } from 'mobx-react-lite';
import { SxProps } from '@mui/material';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import FormControl from '@mui/material/FormControl';
import FilledInput from '@mui/material/FilledInput';
import TelegramIcon from '@mui/icons-material/Telegram';
import CircularProgress from '@mui/material/CircularProgress';
import { globalStorage } from '@/storage';

export interface UserGoalInputProps {
  style?: SxProps;
}

export default observer(({ style = {} }: UserGoalInputProps) => {
  const inputRef = React.useRef<string>('');
  const inputElementRef = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    if (inputElementRef.current) {
      if (globalStorage.planManager) {
        inputElementRef.current.value = globalStorage.planManager.goal;
      } else {
        inputElementRef.current.value = globalStorage.briefGoal;
      }
    }
  }, [globalStorage.planManager]);
  return (
    <FormControl
      sx={{
        position: 'relative',
        ...style,
      }}
    >
      <FilledInput
        disabled={
          globalStorage.api.busy ||
          !globalStorage.api.agentsReady ||
          globalStorage.api.planReady
        }
        placeholder="Yout Goal"
        fullWidth
        inputRef={inputElementRef}
        onChange={event => (inputRef.current = event.target.value)}
        size="small"
        sx={{
          borderRadius: '10px',
          background: '#E1E1E1',
          borderBottom: 'none !important',
          '&::before': {
            borderBottom: 'none !important',
          },
          '& > input': {
            padding: '10px',
          },
        }}
        startAdornment={
          <Box
            sx={{
              color: '#4A9C9E',
              fontWeight: 800,
              fontSize: '18px',
              textWrap: 'nowrap',
              userSelect: 'none',
            }}
          >
            \General Goal:
          </Box>
        }
      />
      {globalStorage.api.planGenerating ? (
        <CircularProgress
          sx={{
            position: 'absolute',
            right: '12px',
            top: '20px',
            width: '24px !important',
            height: '24px !important',
          }}
        />
      ) : (
        <IconButton
          disabled={
            globalStorage.api.busy ||
            !globalStorage.api.agentsReady ||
            globalStorage.api.planReady
          }
          color="primary"
          aria-label="提交"
          sx={{ position: 'absolute', right: '6px', top: '12px' }}
          onClick={() => {
            globalStorage.form.goal = inputRef.current;
            globalStorage.generatePlanBase();
          }}
        >
          <TelegramIcon />
        </IconButton>
      )}
    </FormControl>
  );
});
