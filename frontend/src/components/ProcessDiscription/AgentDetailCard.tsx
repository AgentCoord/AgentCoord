import React from 'react';
import { observer } from 'mobx-react-lite';
import Box from '@mui/material/Box';
// import EditIcon from '@mui/icons-material/Edit';
import TextField from '@mui/material/TextField';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { IRichSentence } from '@/storage/plan';
import { globalStorage } from '@/storage';

interface IAgentDetailCardProps {
  id: string;
  node: IRichSentence;
  render: () => void;
}

export default observer(({ id, node, render }: IAgentDetailCardProps) => {
  const editContentRef = React.useRef('');
  const [edit, setEdit] = React.useState(false);
  React.useEffect(() => {
    render();
  }, [edit]);

  return (
    <Box
      component="span"
      sx={{
        cursor: 'pointer',
        marginRight: '4px',
        userSelect: 'none',
        transition: 'all 200ms ease-out',
        borderRadius: '0',
        display: edit ? 'flex' : 'inline',
        flexDirection: 'column',
        border: edit ? '2px solid' : undefined,
        '& .edit-button': {
          display: 'none',
        },
        '&:hover': {
          filter: edit ? undefined : 'brightness(1.1)',
          backgroundColor: edit
            ? undefined
            : ((node?.style ?? { borderColor: '#0003' }) as any)!.borderColor,
          '& .edit-button': {
            display: edit ? 'none' : 'inline-flex',
          },
        },
        '&:active': {
          filter: edit ? undefined : 'brightness(1)',
          backgroundColor: edit
            ? undefined
            : ((node?.style ?? { borderColor: '#0003' }) as any)!.borderColor,
        },
        lineHeight: '1.4rem',
        padding: edit ? '6px' : undefined,
        marginBottom: edit ? '6px' : undefined,
        marginTop: edit ? '6px' : undefined,
        borderBottom: `2px solid ${(node.style as any).borderColor}`,
        backgroundImage: edit
          ? 'linear-gradient(0deg, #FFF7, #FFF7)'
          : undefined,
        ...(edit ? node.whoStyle ?? {} : node.style),
      }}
      onDoubleClick={() => {
        editContentRef.current = node.content;
        setEdit(true);
      }}
      title="Double click to edit"
    >
      <Box
        component="span"
        sx={{
          userSelect: 'none',
          padding: edit ? '0 6px' : '0 2px',
          borderRadius: '14px',
          border: '2px solid #0005',
          transition: 'filter 100ms',
          fontWeight: edit ? 800 : undefined,
          ...node.whoStyle,
        }}
      >
        {node.who}
      </Box>
      {edit ? (
        <>
          <TextField
            variant="outlined"
            multiline
            inputRef={ref => {
              if (ref) {
                ref.value = editContentRef.current;
              }
            }}
            sx={{
              '& > .MuiInputBase-root': {
                padding: '6px',
                '& > fieldset': {
                  border: 'none',
                },
                background: '#FFF8',
                borderRadius: '12px',
              },
              borderRadius: '12px',
              border: '2px solid #0002',
              marginTop: '4px',
              '*': {
                fontSize: '14px',
              },
            }}
            onChange={event => (editContentRef.current = event.target.value)}
          />
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'end',
              paddingTop: '4px',
            }}
          >
            <Box
              onClick={() => {
                if (!editContentRef.current) {
                  return;
                }
                setEdit(false);
                const t = editContentRef.current;
                globalStorage.updateAgentActionNodeContent(
                  id,
                  t[0].toUpperCase() + t.slice(1),
                );
              }}
              title="Save change"
              sx={{
                cursor: 'pointer',
                userSelect: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#3ec807',
                borderRadius: '6px',
                marginLeft: '4px',
                padding: '0 4px',
                '&:hover': {
                  filter: 'contrast(1.3)',
                },
              }}
            >
              <CheckIcon sx={{ fontSize: '18px', color: 'white' }} />
            </Box>
            <Box
              onClick={() => setEdit(false)}
              title="Cancel change"
              sx={{
                cursor: 'pointer',
                userSelect: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#d56464',
                borderRadius: '6px',
                marginLeft: '4px',
                padding: '0 4px',
                '&:hover': {
                  filter: 'contrast(1.3)',
                },
              }}
            >
              <CloseIcon sx={{ fontSize: '18px', color: 'white' }} />
            </Box>
          </Box>
        </>
      ) : (
        // <>&nbsp;{node.content}</>
        <span>&nbsp;{node.content}</span>
      )}
    </Box>
  );
});
