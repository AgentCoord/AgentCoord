import React from 'react';
import { observer } from 'mobx-react-lite';
import { SxProps } from '@mui/material';
import Box from '@mui/material/Box';
import EditIcon from '@mui/icons-material/Edit';
import TextField from '@mui/material/TextField';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
import MarkdownBlock from '@/components/MarkdownBlock';
import { globalStorage } from '@/storage';

export interface IObjectNodeProps {
  name: string;
  content: string;
  _ref?: React.RefObject<HTMLDivElement | HTMLElement>;
  style?: SxProps;
  editObjectName?: string;
  stepId: string;
  handleExpand?: () => void;
}

export default observer(
  ({
    style = {},
    name,
    content,
    _ref,
    editObjectName,
    stepId,
    handleExpand,
  }: IObjectNodeProps) => {
    const inputStringRef = React.useRef<string>('');
    const [edit, setEdit] = React.useState(false);
    const [expand, setExpand] = React.useState(false);
    const refDetail = React.useRef<HTMLDivElement>(null);
    // 使用useEffect来更新detail容器的高度
    React.useEffect(() => {
      if (refDetail.current) {
        refDetail.current.style.height = expand
          ? `${refDetail.current.scrollHeight}px`
          : '0px';
      }
      if (handleExpand) {
        let count = 0;
        const intervalId = setInterval(() => {
          handleExpand();
          count++;
          if (count >= 20) {
            clearInterval(intervalId);
          }
        }, 10);
      }
    }, [expand]);
    return (
      <Box
        sx={{
          userSelect: 'none',
          borderRadius: '8px',
          background: '#F6F6F6',
          padding: '10px',
          border: '2px solid #E5E5E5',
          fontSize: '14px',
          position: 'relative',
          ...(stepId
            ? {
                cursor: 'pointer',
                transition: 'all 200ms ease-in-out',
                '&:hover': {
                  border: '2px solid #0002',
                  backgroundImage: 'linear-gradient(0, #0000000A, #0000000A)',
                },
              }
            : {}),
          ...style,
        }}
        ref={_ref}
        onClick={() => {
          if (stepId) {
            globalStorage.setFocusingStepTaskId(stepId);
          }
        }}
      >
        <Box component="span" sx={{ fontWeight: 800 }}>
          {name}
        </Box>
        {content && !editObjectName ? (
          <Box
            ref={refDetail}
            sx={{
              overflow: 'hidden',
              transition: 'height 200ms ease-out', // 添加过渡效果
            }}
          >
            {expand ? (
              <MarkdownBlock
                text={content}
                style={{
                  marginTop: '5px',
                  borderRadius: '6px',
                  padding: '4px',
                  background: '#E6E6E6',
                  fontSize: '12px',
                  maxHeight: '240px',
                  overflowY: 'auto',
                  border: '1px solid #0003',
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word',
                  marginBottom: '0',
                }}
              />
            ) : (
              <></>
            )}
            <Box
              onClick={e => {
                setExpand(v => !v);
                e.stopPropagation();
              }}
              sx={{
                position: 'absolute',
                right: '18px',
                bottom: '14px',
                cursor: 'pointer',
                userSelect: 'none',
                height: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#0002',
                borderRadius: '8px',
                marginLeft: '4px',
                padding: '0 4px',
                '&:hover': {
                  background: '#0003',
                },
              }}
            >
              {expand ? (
                <UnfoldLessIcon
                  sx={{ fontSize: '16px', transform: 'rotate(90deg)' }}
                />
              ) : (
                <MoreHorizIcon sx={{ fontSize: '16px' }} />
              )}
            </Box>
          </Box>
        ) : (
          <></>
        )}
        {editObjectName ? (
          <Box sx={{ position: 'relative' }}>
            {edit ? (
              <>
                <TextField
                  fullWidth
                  multiline
                  rows={1}
                  inputRef={ele => {
                    if (ele) {
                      ele.value = inputStringRef.current;
                    }
                  }}
                  onChange={event =>
                    (inputStringRef.current = event.target.value)
                  }
                  size="small"
                  sx={{
                    fontSize: '12px',
                    paddingTop: '10px',
                    paddingBottom: '10px',
                    borderRadius: '10px',
                    border: 'none !important',
                    borderBottom: 'none !important',
                    '&::before': {
                      borderBottom: 'none !important',
                      border: 'none !important',
                    },
                    '& > .MuiInputBase-root': {
                      border: 'none',
                      background: '#0001',
                      '& > .MuiOutlinedInput-notchedOutline': {
                        border: 'none !important',
                      },
                    },
                  }}
                />
                <Box
                  onClick={() => {
                    setEdit(false);
                    globalStorage.form.inputs[editObjectName] =
                      inputStringRef.current;
                  }}
                  sx={{
                    position: 'absolute',
                    right: '8px',
                    bottom: '2px',
                    cursor: 'pointer',
                    userSelect: 'none',
                    height: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'contrast(0.6)',
                    borderRadius: '3px',
                    marginLeft: '4px',
                  }}
                >
                  <CheckIcon sx={{ fontSize: '18px', color: '#1d7d09' }} />
                </Box>
                <Box
                  onClick={() => setEdit(false)}
                  sx={{
                    position: 'absolute',
                    right: '34px',
                    bottom: '2px',
                    cursor: 'pointer',
                    userSelect: 'none',
                    height: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'contrast(0.6)',
                    borderRadius: '3px',
                    marginLeft: '4px',
                  }}
                >
                  <CloseIcon sx={{ fontSize: '18px', color: '#8e0707' }} />
                </Box>
              </>
            ) : (
              <>
                <MarkdownBlock
                  text={globalStorage.form.inputs[editObjectName]}
                  style={{
                    marginTop: '5px',
                    borderRadius: '6px',
                    padding: '4px',
                    background: '#E6E6E6',
                    fontSize: '12px',
                    maxHeight: '240px',
                    overflowY: 'auto',
                    border: '1px solid #0003',
                    whiteSpace: 'pre-wrap',
                    wordWrap: 'break-word',
                    marginBottom: '0',
                  }}
                />
                <Box
                  onClick={() => {
                    inputStringRef.current =
                      globalStorage.form.inputs[editObjectName];
                    setEdit(true);
                  }}
                  sx={{
                    position: 'absolute',
                    right: '6px',
                    bottom: '8px',
                    cursor: 'pointer',
                    userSelect: 'none',
                    height: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '3px',
                    marginLeft: '4px',
                    opacity: 0.5,
                    transition: 'opacity 200ms ease-out',
                    '&:hover': {
                      opacity: 1,
                    },
                  }}
                >
                  <EditIcon sx={{ fontSize: '14px' }} />
                </Box>
              </>
            )}
          </Box>
        ) : (
          <></>
        )}
      </Box>
    );
  },
);
