import React from 'react';
import { observer } from 'mobx-react-lite';
import { IconButton, SxProps } from '@mui/material';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import UploadIcon from '@mui/icons-material/Upload';
import DownloadIcon from '@mui/icons-material/Download';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import LogoIcon from '@/icons/LogoIcon';
import { globalStorage } from '@/storage';

export default observer(({ style = {} }: { style?: SxProps }) => {
  const pageTags = React.useMemo(
    () => (
      <Tabs
        value={globalStorage.currentPlanId ?? ''}
        onChange={(_event, newId) =>
          globalStorage.focusPlan(newId || undefined)
        }
        aria-label="plan tabs"
        variant="scrollable"
        scrollButtons="auto"
        TabIndicatorProps={{
          children: <span className="MuiTabs-indicatorSpan" />,
        }}
        sx={{
          minHeight: '40px',
          height: '40px',
          '& .MuiTabs-indicator': {
            display: 'flex',
            justifyContent: 'center',
            backgroundColor: 'transparent',
          },
          '& .MuiTabs-indicatorSpan': {
            maxWidth: 60,
            width: '100%',
            backgroundColor: 'rgb(168, 247, 227)',
          },
        }}
      >
        <Tab
          label={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AddIcon />
            </Box>
          }
          value=""
          sx={{
            color: '#fffb',
            minHeight: '40px',
            height: '40px',
            background: '#fff1',
            width: '40px',
            minWidth: '0',
            '&.Mui-selected': {
              color: '#fff',
              fontWeight: 900,
            },
          }}
        />
        {globalStorage.planTabArrange.map(id => (
          <Tab
            value={id}
            key={id}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton
                  size="small"
                  onClick={() => globalStorage.removePlan(id)}
                  sx={{
                    opacity: 0.6,
                    '&:hover': { opacity: 1 },
                  }}
                >
                  <CloseIcon
                    sx={{
                      color: '#fff',
                      fontSize: '16px',
                    }}
                  />
                </IconButton>
                Plan
                <IconButton
                  size="small"
                  sx={{
                    opacity: 0.6,
                    '&:hover': { opacity: 1 },
                  }}
                  onClick={() => {
                    const jsonString = JSON.stringify(
                      globalStorage.dumpPlan(id),
                    );
                    // download file
                    const blob = new Blob([jsonString], {
                      type: 'application/json',
                    });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `plan-${id}.json`;
                    a.click();
                    a.remove();
                  }}
                >
                  <DownloadIcon
                    sx={{
                      color: '#fff',
                      fontSize: '16px',
                    }}
                  />
                </IconButton>
              </Box>
            }
            sx={{
              color: '#fffb',
              minHeight: '40px',
              height: '40px',
              borderLeft: '1px solid #3333',
              background: '#fff1',
              '&.Mui-selected': {
                color: '#fff',
                fontWeight: 900,
              },
              padding: '0 4px',
            }}
          />
        ))}
      </Tabs>
    ),
    [globalStorage.planTabArrange, globalStorage.currentPlanId],
  );

  return (
    <Box
      sx={{
        bgcolor: 'primary.main',
        color: '#fff',
        width: '100%',
        display: 'flex',
        userSelect: 'none',
        ...style,
      }}
    >
      <Box sx={{ flexGrow: 1, display: 'flex' }}>
        {globalStorage.devMode ? (
          <Box
            sx={{ display: 'flex', alignItems: 'center', marginLeft: '10px' }}
          >
            <LogoIcon />
            <Box sx={{ marginLeft: '6px', fontWeight: 800, fontSize: '20px' }}>
              AGENTCOORD
            </Box>
          </Box>
        ) : (
          pageTags
        )}
      </Box>
      <IconButton component="label">
        <input
          type="file"
          accept=".json"
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
          onChange={e => {
            const file = e.target.files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = event => {
                const content = event.target?.result as string;
                globalStorage.loadPlan(JSON.parse(content));
              };
              reader.readAsText(file);
            }
          }}
        />
        <UploadIcon sx={{ color: '#fff' }} />
      </IconButton>
      {globalStorage.devMode && globalStorage.currentPlanId && (
        <IconButton
          disabled={globalStorage.currentPlanId === undefined}
          onClick={() => {
            const jsonString = JSON.stringify(
              globalStorage.dumpPlan(globalStorage.currentPlanId!),
            );
            // download file
            const blob = new Blob([jsonString], {
              type: 'application/json',
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `plan-${globalStorage.currentPlanId!}.json`;
            a.click();
            a.remove();
          }}
        >
          <DownloadIcon sx={{ color: '#fff' }} />
        </IconButton>
      )}
      {!globalStorage.devMode && (
        <Box
          sx={{
            display: 'flex',
            height: '100%',
            marginRight: '10px',
            alignItems: 'center',
            fontSize: '13px',
            textShadow: '0 0 2px #000',
          }}
        >
          AgentCoord
        </Box>
      )}
      <IconButton>
        <HelpOutlineIcon sx={{ color: '#fff' }} />
      </IconButton>
    </Box>
  );
});
