import React from 'react';
import { Resizable } from 're-resizable';
import { globalStorage } from '@/storage';

export default React.memo<{
  children: React.ReactNode;
  columnWidth: string;
}>(({ children, columnWidth }) => {
  return (
    <Resizable
      defaultSize={{ height: '100%', width: columnWidth }}
      enable={{
        top: false,
        right: true,
        bottom: false,
        left: false,
        topRight: false,
        bottomRight: false,
        bottomLeft: false,
        topLeft: false,
      }}
      minWidth="50px"
      maxWidth="75%"
      style={{
        flexShrink: 0,
        display: 'flex',
        flexWrap: 'nowrap',
        position: 'relative',
        flexGrow: 0,
      }}
      handleClasses={{
        right: 'side-resize-bar',
      }}
      handleStyles={{
        right: {
          width: '4px',
          right: '1px',
        },
      }}
      onResize={() => globalStorage.renderLines({ delay: 0, repeat: 3 })}
    >
      {children}
    </Resizable>
  );
});
