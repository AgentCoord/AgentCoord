import { observer } from 'mobx-react-lite';
import { SxProps } from '@mui/material';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import DescriptionCard from './DescriptionCard';
import { globalStorage } from '@/storage';
import LoadingMask from '@/components/LoadingMask';
import Title from '@/components/Title';

export default observer(({ style = {} }: { style?: SxProps }) => {
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
      <Title title="Task Process" />
      <Stack
        spacing={1}
        sx={{
          position: 'relative',
          padding: '6px 12px',
          paddingBottom: '44px',
          borderRadius: '10px',
          height: 0,
          flexGrow: 1,
          overflowY: 'auto',
        }}
        onScroll={() => {
          globalStorage.renderLines({ delay: 0, repeat: 2 });
        }}
      >
        {globalStorage.planManager.currentPlan.map(step => (
          <DescriptionCard key={step.name} step={step} />
        ))}
        {globalStorage.api.planGenerating ? (
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
