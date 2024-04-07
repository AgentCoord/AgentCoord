import React from 'react';
import { Rnd } from 'react-rnd';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { debounce } from 'lodash';

export interface IFloatingWindowProps {
  title: React.ReactNode;
  children: React.ReactNode;
  onClose?: () => void;
  onResize?: () => void;
}

let windowsArrange: HTMLElement[] = [];
const focusWindow = (element: HTMLElement) => {
  windowsArrange = windowsArrange.filter(
    ele => ele.ownerDocument.contains(ele) && element !== ele,
  );
  windowsArrange.push(element);
  windowsArrange.forEach(
    (ele, index) => (ele.style.zIndex = `${index + 1000}`),
  );
};

export default React.memo<IFloatingWindowProps>(
  ({ title, children, onClose, onResize }) => {
    const [resizeable, setResizeable] = React.useState(true);
    const containerRef = React.useRef<HTMLElement>(null);
    React.useEffect(() => {
      if (containerRef.current) {
        focusWindow(containerRef.current.parentElement!);
      }
    }, []);
    const defaultSize = React.useMemo(() => {
      const width = Math.min(800, window.innerWidth - 20);
      const height = Math.min(600, window.innerHeight - 20);
      const x = (window.innerWidth - width) / 2;
      const y = (window.innerHeight - height) / 2;
      return { x, y, width, height };
    }, []);
    return (
      <Rnd
        /* optional props */
        style={{
          borderColor: '#43A8AA',
          borderWidth: '3px',
          borderStyle: 'solid',
          boxShadow: '3px 3px 20px #0005',
          display: 'flex',
          flexDirection: 'column',
        }}
        minHeight={60}
        minWidth={150}
        default={defaultSize}
        onMouseDown={() => {
          if (containerRef.current) {
            focusWindow(containerRef.current.parentElement!);
          }
        }}
        bounds={document.body}
        disableDragging={!resizeable}
        onResize={debounce(() => {
          onResize?.();
        }, 50)}
      >
        <Box
          sx={{
            bgcolor: 'primary.main',
            color: 'white',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            padding: '0 5px',
            userSelect: 'none',
            cursor: 'move',
          }}
        >
          {typeof title === 'string' ? (
            <Box
              sx={{
                fontSize: '18px',
                fontWeight: 800,
                flexGrow: 1,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {title}
            </Box>
          ) : (
            title
          )}
          <Box sx={{ display: 'flex' }}>
            <IconButton
              disabled={onClose === undefined}
              onClick={onClose}
              sx={{ color: 'white' }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
        <Box
          ref={containerRef}
          sx={{
            flexGrow: 1,
            background: '#F3F3F3',
            overflow: 'auto',
          }}
          onPointerEnter={() => setResizeable(false)}
          onPointerLeave={() => setResizeable(true)}
        >
          {children}
        </Box>
      </Rnd>
    );
  },
);
