import { observer } from 'mobx-react-lite';
import { SxProps } from '@mui/material';
import Box from '@mui/material/Box';
import OutlineView from './OutlineView';

import Title from '@/components/Title';
import LoadingMask from '@/components/LoadingMask';
import { globalStorage } from '@/storage';
import BranchIcon from '@/icons/BranchIcon';

export default observer(({ style = {} }: { style?: SxProps }) => {
  const {
    api: { planReady },
  } = globalStorage;

  return (
    <Box
      sx={{
        position: 'relative',
        background: '#FFF',
        border: '3px solid #E1E1E1',
        display: 'flex',
        overflow: 'hidden',
        flexDirection: 'column',
        ...style,
      }}
    >
      <Title title="Plan Outline" />
      <Box
        sx={{
          position: 'relative',
          height: 0,
          flexGrow: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '6px 12px',
        }}
      >
        {planReady ? <OutlineView /> : <></>}
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
      </Box>
      {planReady ? (
        <Box
          sx={{
            cursor: 'pointer',
            userSelect: 'none',
            position: 'absolute',
            right: 0,
            bottom: 0,
            width: '36px',
            height: '32px',
            bgcolor: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '10px 0 0 0',
            zIndex: 100,
            '&:hover': {
              filter: 'brightness(0.9)',
            },
          }}
          onClick={() => (globalStorage.planModificationWindow = true)}
        >
          <BranchIcon />
          <Box
            component="span"
            sx={{
              fontSize: '12px',
              position: 'absolute',
              right: '4px',
              bottom: '2px',
              color: 'white',
              fontWeight: 800,
              textAlign: 'right',
            }}
          >
            {globalStorage.planManager.leaves.length}
          </Box>
        </Box>
      ) : (
        <></>
      )}
    </Box>
  );
});
