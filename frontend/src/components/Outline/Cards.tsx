import React, { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { IconButton, SxProps } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import Divider from '@mui/material/Divider';
import RemoveIcon from '@mui/icons-material/Remove';
import AdjustIcon from '@mui/icons-material/Adjust';
import { ObjectProps, ProcessProps } from './interface';
import AgentIcon from '@/components/AgentIcon';
import { globalStorage } from '@/storage';

export interface IEditObjectProps {
  finishEdit: (objectName: string) => void;
}

export const EditObjectCard: React.FC<IEditObjectProps> = React.memo(
  ({ finishEdit }) => {
    const handleKeyPress = (event: any) => {
      if (event.key === 'Enter') {
        finishEdit(event.target.value);
      }
    };
    return (
      <TextField
        onKeyPress={handleKeyPress}
        sx={{
          backgroundColor: '#D9D9D9',
          borderRadius: '6px',
          padding: '8px',
          userSelect: 'none',
          margin: '6px 0px',
        }}
      />
    );
  },
);

interface IHoverIconButtonProps {
  onAddClick: () => void;
  isActive: boolean;
  style: SxProps;
  responseToHover?: boolean;
  addOrRemove: boolean | undefined; // true for add, false for remove,undefined for adjust
}

const HoverIconButton: React.FC<IHoverIconButtonProps> = ({
  onAddClick,
  isActive,
  style,
  addOrRemove,
  responseToHover = true,
}) => {
  const [addIconHover, setAddIconHover] = useState(false);

  return (
    <Box
      onMouseOver={() => {
        setAddIconHover(true);
      }}
      onMouseOut={() => {
        setAddIconHover(false);
      }}
      onClick={() => {
        onAddClick();
      }}
      sx={{ ...style, justifySelf: 'start' }}
    >
      <IconButton
        sx={{
          color: 'primary',
          '&:hover': {
            color: 'primary.dark',
          },
          padding: '0px',
          borderRadius: 10,
          border: '1px dotted #333',
          visibility:
            (responseToHover && addIconHover) || isActive
              ? 'visible'
              : 'hidden',
          '& .MuiSvgIcon-root': {
            fontSize: '1.25rem',
          },
        }}
      >
        {addOrRemove === undefined ? <AdjustIcon /> : <></>}
        {addOrRemove === true ? <AddIcon /> : <></>}
        {addOrRemove === false ? <RemoveIcon /> : <></>}
      </IconButton>
    </Box>
  );
};

interface IEditableBoxProps {
  text: string;
  inputCallback: (text: string) => void;
}

const EditableBox: React.FC<IEditableBoxProps> = ({ text, inputCallback }) => {
  const [isEditable, setIsEditable] = useState(false);
  const handleDoubleClick = () => {
    setIsEditable(true);
  };

  const handleKeyPress = (event: any) => {
    if (event.key === 'Enter') {
      inputCallback(event.target.value);
      setIsEditable(false);
    }
  };

  return (
    <Box>
      {isEditable ? (
        <TextField
          defaultValue={text}
          multiline
          onKeyPress={handleKeyPress}
          onBlur={() => setIsEditable(false)} // 失去焦点时也关闭编辑状态
          autoFocus
          sx={{
            '& .MuiInputBase-root': {
              // 目标 MUI 的输入基础根元素
              padding: '0px 0px', // 你可以设置为你希望的内边距值
            },
            width: '100%',
          }}
        />
      ) : (
        <span
          onDoubleClick={handleDoubleClick}
          style={{
            color: '#707070',
            // textDecoration: 'underline',
            // textDecorationColor: '#C1C1C1',
            borderBottom: '1.5px solid #C1C1C1',
            fontSize: '15px',
          }}
        >
          {text}
        </span>
      )}
    </Box>
  );
};

export interface IObjectCardProps {
  object: ObjectProps;
  isAddActive?: boolean;
  handleAddActive?: (objectName: string) => void;
  addOrRemove?: boolean;
}

export const ObjectCard = React.memo<IObjectCardProps>(
  ({
    object,
    isAddActive = false,
    handleAddActive = (objectName: string) => {
      console.log(objectName);
    },
    addOrRemove = true,
  }) => {
    const onAddClick = () => {
      handleAddActive(object.name);
    };
    return (
      <Box
        sx={{
          position: 'relative',
          // maxWidth: '100%',
        }}
      >
        <HoverIconButton
          style={{
            position: 'absolute',
            left: '100%',
            top: '50%',
            transform: 'translateY(-50%)translateX(-50%)',
          }}
          onAddClick={onAddClick}
          isActive={isAddActive}
          responseToHover={false}
          addOrRemove={addOrRemove}
        />
        <Box
          ref={object.cardRef}
          sx={{
            backgroundColor: '#F6F6F6',
            borderRadius: '15px',
            border: '2px solid #E5E5E5',
            padding: '10px 4px',
            userSelect: 'none',
            margin: '12px 0px',
            maxWidth: '100%',
            wordWrap: 'break-word',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            fontSize: '16px',
            fontWeight: 800,
            textAlign: 'center',
            color: '#222',
          }}
        >
          {object.name}
        </Box>
      </Box>
    );
  },
);

export interface IProcessCardProps {
  process: ProcessProps;
  handleProcessClick: (stepId: string) => void;
  isFocusing: boolean;
  isAddActive?: boolean;
  handleAddActive?: (objectName: string) => void;

  handleEditContent: (stepTaskId: string, newContent: string) => void;
  // handleSizeChange: () => void;
}

export const ProcessCard: React.FC<IProcessCardProps> = React.memo(
  ({
    process,
    handleProcessClick,
    isFocusing,
    isAddActive = false,
    handleAddActive = (objectName: string) => {
      console.log(objectName);
    },
    // handleSizeChange,
    handleEditContent,
  }) => {
    const onAddClick = () => {
      handleAddActive(process.id);
    };
    return (
      <Box
        sx={{
          position: 'relative',
          // width: '100%',
        }}
      >
        <HoverIconButton
          style={{
            position: 'absolute',
            left: '0',
            top: '50%',
            transform: 'translateY(-50%)translateX(-50%)',
          }}
          onAddClick={onAddClick}
          isActive={isAddActive}
          addOrRemove={undefined}
        />
        <Box
          ref={process.cardRef}
          sx={{
            backgroundColor: '#F6F6F6',
            borderRadius: '15px',
            padding: '8px',
            margin: '18px 0px',
            userSelect: 'none',
            cursor: 'pointer',
            border: isFocusing ? '2px solid #43b2aa' : '2px solid #E5E5E5',
            transition: 'all 80ms ease-in-out',
            '&:hover': {
              border: isFocusing ? '2px solid #03a89d' : '2px solid #b3b3b3',
              backgroundImage: 'linear-gradient(0, #0001, #0001)',
            },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
          onClick={() => handleProcessClick(process.id)}
        >
          <Box
            sx={{
              fontSize: '16px',
              fontWeight: 800,
              textAlign: 'center',
              color: '#222',
              marginTop: '4px',
              marginBottom: '4px',
            }}
          >
            {process.name}
          </Box>
          {/* Assuming AgentIcon is another component */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              justifyContent: 'center',
              flexWrap: 'wrap',
              margin: '8px 0',
            }}
          >
            {process.agents.map(agentName => (
              <AgentIcon
                key={`outline.${process.name}.${agentName}`}
                name={globalStorage.agentMap.get(agentName)?.icon ?? 'unknown'}
                style={{
                  width: '40px',
                  height: 'auto',
                  marginRight: '3px',
                  userSelect: 'none',
                }}
                tooltipInfo={globalStorage.agentMap.get(agentName)}
              />
            ))}
          </Box>

          {isFocusing && (
            <Box onClick={e => e.stopPropagation()}>
              <Divider
                sx={{
                  margin: '5px 0px',
                  borderBottom: '2px dashed', // 设置为虚线
                  borderColor: '#d4d4d4',
                }}
              />
              <EditableBox
                text={process.content}
                inputCallback={(text: string) => {
                  handleEditContent(process.id, text);
                  // handleEditStep(step.name, { ...step, task: text });
                }}
              />
            </Box>
          )}
        </Box>
      </Box>
    );
  },
);

const Card: React.FC = React.memo(() => {
  return <></>; // Replace with your component JSX
});

export default Card;
