import React from 'react';
import Box from '@mui/material/Box';
import localForage from 'localforage';
import Drawer from '@mui/material/Drawer';
import { Helmet } from '@modern-js/runtime/head';
import ViewConnector from '@/components/ViewConnector';

import './index.scss';

import ResizeableColumn from '@/components/ResizeableColumn';
import HeadBar from '@/components/HeadBar';
import Outline from '@/components/Outline';
import AgentHiring from '@/components/AgentHiring';
import AgentBoard from '@/components/AgentBoard';
import ProcessRehearsal from '@/components/ProcessRehearsal';
import UserGoalInput from '@/components/UserGoalInput';
import ProcessDiscrption from '@/components/ProcessDiscription';

import { globalStorage } from '@/storage';

// 持久化
localForage.config({
  name: 'AgentCoord',
  storeName: 'app',
});

export default React.memo(() => {
  React.useEffect(() => {
    let id: NodeJS.Timer | undefined;
    if (!globalStorage.devMode) {
      localForage.getItem('globalStorage').then(v => {
        if (v) {
          globalStorage.load(v);
        }
      });
      id = setInterval(() => {
        localForage.setItem('globalStorage', globalStorage.dump());
      }, 1000);
    }

    // globalStorage.getAgents();

    const refreshLines = () =>
      globalStorage.renderLines({ delay: 0, repeat: 1, interval: 15 });
    window.addEventListener('resize', refreshLines);
    // window.addEventListener('pointermove', refreshLines);
    return () => {
      if (id) {
        clearInterval(id);
      }
      // window.removeEventListener('pointermove', refreshLines);
      window.removeEventListener('resize', refreshLines);
    };
  }, []);
  const [showAgentHiring, setShowAgentHiring] = React.useState(false);
  return (
    <>
      <Helmet>
        <link
          rel="stylesheet"
          href="/assets/katex.min.css"
          type="text/css"
          media="all"
        />
        <title>AgentCoord</title>
      </Helmet>
      {/* Columns */}
      <Box
        sx={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <HeadBar
          style={{ height: '40px', flexGrow: 0, flexShrink: 0, zIndex: 2 }}
        />
        <Box
          sx={{
            height: 0,
            padding: '0 10px 10px 10px',
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
          }}
        >
          <UserGoalInput
            style={{
              height: '50px',
              flexGrow: 0,
              flexShrink: 0,
              zIndex: 2,
              background: '#FFF9',
              paddingTop: '10px',
              backdropFilter: 'blur(5px)',
            }}
          />
          <Box sx={{ height: 0, flexGrow: 1, display: 'flex' }}>
            <ResizeableColumn columnWidth="25%">
              <Outline
                style={{
                  height: '100%',
                  width: '100%',
                  marginRight: '6px',
                }}
              />
            </ResizeableColumn>
            <ResizeableColumn columnWidth="25%">
              <AgentBoard
                style={{
                  height: '100%',
                  width: '100%',
                  marginRight: '6px',
                }}
                onAddAgent={() => setShowAgentHiring(true)}
              />
            </ResizeableColumn>
            <ResizeableColumn columnWidth="25%">
              <ProcessDiscrption
                style={{
                  height: '100%',
                  width: '100%',
                  marginRight: '6px',
                }}
              />
            </ResizeableColumn>
            <ProcessRehearsal
              style={{
                height: '100%',
                flexGrow: 1,
                width: '100%',
              }}
            />
            <ViewConnector />
          </Box>
        </Box>
      </Box>
      {/* Drawers */}
      <Drawer
        anchor="right"
        open={showAgentHiring}
        onClose={() => setShowAgentHiring(false)}
      >
        <AgentHiring
          style={{
            height: '100%',
            minWidth: '25vw',
          }}
        />
      </Drawer>
    </>
  );
});
