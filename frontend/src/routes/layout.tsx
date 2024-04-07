import { observer } from 'mobx-react-lite';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Outlet } from '@modern-js/runtime/router';
import React from 'react';
import FloatWindow from '@/components/FloatWindow';
import { globalStorage } from '@/storage';
import AgentAssignment from '@/components/AgentAssignment';
import TaskModification from '@/components/TaskModification';
import PlanModification from '@/components/PlanModification';

const theme = createTheme({
  palette: {
    primary: {
      main: '#43A8AA',
    },
  },
});

export default observer(() => {
  const [resizePlanOutline, setResizePlanOutline] = React.useState(0);
  const [resizeProcessModification, setResizeProcessModification] =
    React.useState(0);
  return (
    <ThemeProvider theme={theme}>
      <Outlet />
      {globalStorage.planModificationWindow ? (
        <FloatWindow
          title="Plan Outline Exploration"
          onClose={() => (globalStorage.planModificationWindow = false)}
          onResize={() => {
            setResizePlanOutline(old => (old + 1) % 100);
          }}
        >
          <PlanModification
            style={{
              height: '100%',
              width: '100%',
            }}
            resizeSignal={resizePlanOutline}
          />
        </FloatWindow>
      ) : (
        <></>
      )}
      {globalStorage.agentAssigmentWindow ? (
        <FloatWindow
          title="Assignment Exploration"
          onClose={() => (globalStorage.agentAssigmentWindow = false)}
        >
          <AgentAssignment
            style={{
              height: '100%',
              width: '100%',
            }}
          />
        </FloatWindow>
      ) : (
        <></>
      )}
      {globalStorage.taskProcessModificationWindow ? (
        <FloatWindow
          title="Task Process Exploration"
          onClose={() => (globalStorage.taskProcessModificationWindow = false)}
          onResize={() => {
            setResizeProcessModification(old => (old + 1) % 100);
          }}
        >
          <TaskModification
            style={{
              height: '100%',
              width: '100%',
            }}
            resizeSignal={resizeProcessModification}
          />
        </FloatWindow>
      ) : (
        <></>
      )}
    </ThemeProvider>
  );
});
