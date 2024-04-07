/* eslint-disable max-lines */

import React from 'react';
import { SxProps, CircularProgress } from '@mui/material';
import Box from '@mui/material/Box';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
// import SendIcon from '@mui/icons-material/Send';
import { observer } from 'mobx-react-lite';
import AgentIcon from '../AgentIcon';
import TaskModificationSvg from './TaskModificationSvg';
import {
  TaskModificationProvider,
  useTaskModificationContext,
} from './context';
import { IAgentActionTreeNode, globalStorage } from '@/storage';
import SendIcon from '@/icons/sendIcon';
import { ActionType } from '@/storage/plan';

const RequirementNoteNode: React.FC<{
  data: {
    text: string;
  };
  style?: SxProps;
}> = ({ data, style }) => {
  return (
    <Box sx={{ ...style }}>
      <Box sx={{ color: '#ACACAC', userSelect: 'none', minWidth: '250px' }}>
        {data.text}
      </Box>
    </Box>
  );
};

const RequirementInputNode: React.FC<{
  style?: SxProps;
}> = ({ style }) => {
  const { handleRequirementSubmit, updateNodeRefMap } =
    useTaskModificationContext();
  const [number, setNumber] = React.useState(1);
  const myRef = React.useRef<HTMLElement>(null);
  React.useEffect(() => {
    updateNodeRefMap('requirement', myRef);
  }, []);
  // const handleWheel = (event: any) => {
  //   // 向上滚动时减少数字，向下滚动时增加数字
  //   if (event.deltaY < 0) {
  //     setNumber(prevNumber => prevNumber + 1);
  //   } else {
  //     setNumber(prevNumber => Math.max(1, prevNumber - 1));
  //   }
  // };

  const handleSubmit = () => {
    handleRequirementSubmit(textValue, number);
  };
  const [textValue, setTextValue] = React.useState('');
  return (
    <Box
      sx={{
        ...style,
      }}
      ref={myRef}
    >
      <Paper
        sx={{
          p: '0px',
          display: 'flex',
          alignItems: 'center',
          width: 250,
          backgroundColor: 'white',
          boxShadow: 'none',
          border: '2px solid #b0b0b0',
          borderRadius: '8px',
        }}
      >
        <InputBase
          sx={{ marginLeft: 1, flex: 1, backgroundColor: 'white' }}
          placeholder="Add Branch"
          onChange={e => {
            setTextValue(e.target.value);
          }}
          onKeyDown={e => {
            if (e.key === 'ArrowUp') {
              setNumber(prevNumber => prevNumber + 1);
            } else if (e.key === 'ArrowDown') {
              setNumber(prevNumber => Math.max(1, prevNumber - 1));
            }
          }}
        />
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'flex-end',
            height: '100%',
          }}
          // onWheel={handleWheel}
        >
          <IconButton
            type="submit"
            sx={{
              color: 'primary',
              '&:hover': {
                color: 'primary.dark',
              },
              padding: '0px',
            }}
            onClick={handleSubmit}
          >
            <SendIcon color="#b6b6b6" />
          </IconButton>
          <Box
            sx={{
              height: 'min-content',
              paddingLeft: '4px',
              paddingRight: '4px',
              cursor: 'pointer', // 提示用户可以与之互动
            }}
          >
            <Box component="span" sx={{ fontSize: '0.5em' }}>
              X
            </Box>
            <Box component="span" sx={{ fontSize: '1em' }}>
              {number}
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};
const RootNode: React.FC<{
  style?: SxProps;
}> = ({ style }) => {
  const { updateNodeRefMap, updateWhoIsAddingBranch, whoIsAddingBranch } =
    useTaskModificationContext();
  const [onHover, setOnHover] = React.useState(false);
  const myRef = React.useRef<HTMLElement>(null);
  React.useEffect(() => {
    updateNodeRefMap('root', myRef);
  }, []);
  // React.useEffect(() => {
  //   console.log(onHover, whoIsAddingBranch);
  // }, [onHover, whoIsAddingBranch]);
  return (
    <Box
      onMouseOver={() => setOnHover(true)}
      onMouseOut={() => setOnHover(false)}
      sx={{
        ...style,
        flexDirection: 'column',
        position: 'relative',
        backgroundColor: 'red',
      }}
      ref={myRef}
    >
      <IconButton
        sx={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translateX(-50%) ',
          color: 'primary',
          '&:hover': {
            color: 'primary.dark',
          },
          opacity: onHover || whoIsAddingBranch === 'root' ? '1' : '0',
          // visibility: 'visible',
          // visibility:
          //   onHover || whoIsAddingBranch === 'root' ? 'visible' : 'hidden',
          padding: '0px',
          borderRadius: '50%',
          border: '1px dotted #333',
          height: '16px',
          width: '16px',
          marginTop: '-6px',
          '& .MuiSvgIcon-root': {
            fontSize: '14px',
          },
        }}
        onClick={() => updateWhoIsAddingBranch('root')}
      >
        {whoIsAddingBranch !== 'root' ? <AddIcon /> : <RemoveIcon />}
      </IconButton>
    </Box>
  );
};

const Node: React.FC<{
  data: {
    id: string;
    agentIcon: string;
    agent: string;
    action: { type: ActionType; description: string; style: SxProps };
    focusing: boolean;
  };
  style?: SxProps;
}> = ({ data, style }) => {
  const {
    updateNodeRefMap,
    whoIsAddingBranch,
    updateWhoIsAddingBranch,
    handleNodeClick,
    handleNodeHover,
    baseNodeSet,
  } = useTaskModificationContext();
  const myRef = React.useRef<HTMLElement>(null);
  const [onHover, setOnHover] = React.useState(false);
  React.useEffect(() => {
    updateNodeRefMap(data.id, myRef);
  }, []);
  return (
    // <RectWatcher onRectChange={onRectChange}>
    <Box
      onMouseOver={() => {
        setOnHover(true);
        handleNodeHover(data.id);
      }}
      onMouseOut={() => {
        setOnHover(false);
        handleNodeHover(undefined);
      }}
      sx={{
        ...style,
        flexDirection: 'column',
        // backgroundColor: '#d9d9d9',
        borderStyle: 'solid',
        borderRadius: '50%',
        height: data.focusing ? '45px' : '30px',
        width: data.focusing ? '45px' : '30px',
        position: 'relative',
        borderWidth: data.focusing ? '3px' : '2px',
        boxShadow: baseNodeSet.has(data.id) ? '0 0 10px 5px #43b2aa' : '',
      }}
      ref={myRef}
      onClick={() => handleNodeClick(data.id)}
    >
      <Box sx={{ display: 'flex', flexDirection: 'row' }}>
        <AgentIcon
          name={data.agentIcon}
          style={{
            width: data.focusing ? '36px' : '28px',
            height: 'auto',
            margin: '0px',
            userSelect: 'none',
          }}
          tooltipInfo={{
            ...globalStorage.agentMap.get(data.agent)!,
            action: data.action,
          }}
        />
      </Box>
      <Box
        sx={{
          position: 'absolute',
          left: '50%',
          top: '100%',
          transform: 'translateX(-50%) translateY(-50%)',
        }}
      >
        <IconButton
          sx={{
            color: 'primary',
            '&:hover': {
              color: 'primary.dark',
            },
            visibility:
              onHover || whoIsAddingBranch === data.id ? 'visible' : 'hidden',
            padding: '0px',
            borderRadius: '50%',
            border: '1px dotted #333',
            height: '16px',
            width: '16px',
            marginTop: '-6px',
            '& .MuiSvgIcon-root': {
              fontSize: '14px',
            },
          }}
          onClick={() => {
            updateWhoIsAddingBranch(data.id);
          }}
        >
          {whoIsAddingBranch !== data.id ? <AddIcon /> : <RemoveIcon />}
        </IconButton>
      </Box>
    </Box>
    // </RectWatcher>
  );
};

const Tree: React.FC<{
  tree: IAgentActionTreeNode;
}> = ({ tree }) => {
  const { whoIsAddingBranch } = useTaskModificationContext();

  const generalNodeStyle = {
    height: '30px',
    // padding: '4px 8px',
    display: 'flex',
    alignItems: 'center',
    margin: '8px 20px 8px 8px',
  };
  const focusNodeStyle = {
    height: '45px',
    // padding: '4px 8px',
    display: 'flex',
    alignItems: 'center',
    margin: '8px 20px 8px 8px',
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'row' }}>
      <>
        {tree.id !== 'root' && (
          <Node
            data={{
              id: tree.id,
              agentIcon: tree.icon,
              agent: tree.agent,
              action: { ...tree.action, style: tree.style },
              focusing: tree.focusing,
            }}
            style={{
              justifyContent: 'center',
              alignSelf: 'flex-start',
              cursor: 'pointer',
              aspectRatio: '1 / 1',
              ...(tree.focusing ? focusNodeStyle : generalNodeStyle),
              ...tree.style,
            }}
          />
        )}
        {tree.id === 'root' && (
          <RootNode
            style={{
              justifyContent: 'center',
              ...(tree.children[0] && tree.children[0].focusing
                ? focusNodeStyle
                : generalNodeStyle),
            }}
          />
        )}
      </>
      <>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
          }}
        >
          {tree.id !== 'root' && tree.leaf && (
            <RequirementNoteNode
              data={{ text: tree.requirement || '' }}
              style={{
                ...(tree.focusing ? focusNodeStyle : generalNodeStyle),
              }}
            />
          )}

          {tree.children.map(childTree => (
            <Tree key={`taskTree-${childTree.id}`} tree={childTree} />
          ))}
          {tree.id === whoIsAddingBranch && (
            <RequirementInputNode
              style={{ height: '50px', display: 'flex', alignItems: 'center' }}
            />
          )}
        </Box>
      </>
    </Box>
  );
};

interface ITaskModificationProps {
  style?: SxProps;
  resizeSignal?: number;
}

const TheViewContent = observer(
  ({ style, resizeSignal }: ITaskModificationProps) => {
    const { renderingActionForest } = globalStorage;

    const { forest, setForest, setContainerRef, svgForceRender } =
      useTaskModificationContext();

    const myRef = React.useRef<HTMLElement>(null);

    React.useEffect(() => {
      setForest({
        agent: '',
        icon: '',
        children: renderingActionForest,
        id: 'root',
        leaf: false,
        style: {},
        action: { type: ActionType.Propose, description: '' },
        focusing: true,
      });
    }, [renderingActionForest]);

    React.useEffect(() => {
      setContainerRef(myRef);
    }, []);

    React.useEffect(() => {
      svgForceRender();
    }, [resizeSignal]);

    return (
      <Box
        sx={{
          backgroundColor: 'white',
          position: 'relative',
          overflowY: 'auto',
          overflowX: 'auto',
          padding: '4px 6px',
          userSelect: 'none',
          ...style,
        }}
        ref={myRef}
      >
        {myRef.current && <TaskModificationSvg />}
        {forest && <Tree tree={forest} />}
      </Box>
    );
  },
);
/* eslint-enable max-lines */

const TaskModification: React.FC<ITaskModificationProps> = observer(
  ({ style, resizeSignal }) => {
    return (
      <TaskModificationProvider>
        <TheViewContent style={style} resizeSignal={resizeSignal} />
        {globalStorage.api.agentActionTreeGenerating && (
          <Box
            sx={{
              position: 'absolute',
              bottom: '10px',
              right: '20px',
              zIndex: 999,
            }}
          >
            <CircularProgress size={40} />
          </Box>
        )}
      </TaskModificationProvider>
    );
  },
);

export default TaskModification;
