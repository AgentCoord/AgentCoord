/* eslint-disable max-lines */

import React from 'react';
import { SxProps } from '@mui/material';
import Box from '@mui/material/Box';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
// import SendIcon from '@mui/icons-material/Send';
import { observer } from 'mobx-react-lite';
import CircularProgress from '@mui/material/CircularProgress';
import AgentIcon from '../AgentIcon';
import PlanModificationSvg from './PlanModificationSvg';
import {
  PlanModificationProvider,
  usePlanModificationContext,
} from './context';
import { IPlanTreeNode, globalStorage } from '@/storage';
import SendIcon from '@/icons/SendIcon';

const RequirementNoteNode: React.FC<{
  data: {
    text: string;
  };
  style?: SxProps;
}> = ({ data, style }) => {
  return (
    <Box sx={{ ...style, flexShrink: 0 }}>
      <Box
        sx={{
          color: '#ACACAC',
          userSelect: 'none',
          // width: 'max-content',
          minWidth: '250px',
        }}
      >
        {data.text}
      </Box>
    </Box>
  );
};

const RequirementInputNode: React.FC<{
  style?: SxProps;
}> = ({ style }) => {
  const { handleRequirementSubmit, updateNodeRefMap } =
    usePlanModificationContext();
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
    usePlanModificationContext();
  const [onHover, setOnHover] = React.useState(false);
  const myRef = React.useRef<HTMLElement>(null);
  React.useEffect(() => {
    updateNodeRefMap('root', myRef);
  }, []);
  return (
    <Box
      onMouseOver={() => setOnHover(true)}
      onMouseOut={() => setOnHover(false)}
      sx={{ ...style, flexDirection: 'column', position: 'relative' }}
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
          visibility:
            onHover || whoIsAddingBranch === 'root' ? 'visible' : 'hidden',
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
  node: IPlanTreeNode;
  style?: SxProps;
}> = ({ node, style = {} }) => {
  const {
    updateNodeRefMap,
    whoIsAddingBranch,
    updateWhoIsAddingBranch,
    handleNodeClick,
    handleNodeHover,
    baseNodeSet,
  } = usePlanModificationContext();
  const [onHover, setOnHover] = React.useState(false);
  const myRef = React.useRef<HTMLElement>(null);
  React.useEffect(() => {
    updateNodeRefMap(node.id, myRef);
  }, []);
  return (
    // <RectWatcher onRectChange={onRectChange}>
    <Box sx={{ ...style }}>
      <Box
        onMouseOver={() => {
          setOnHover(true);
          handleNodeHover(node.id);
        }}
        onMouseOut={() => {
          setOnHover(false);
          handleNodeHover(undefined);
        }}
        sx={{
          flexDirection: 'column',
          backgroundColor: '#F6F6F6',
          border: node.focusing ? '2px solid #4A9C9E' : '2px solid #E5E5E5',
          borderRadius: '12px',
          maxWidth: '140px',
          minWidth: '100px',
          position: 'relative',
          padding: '8px 6px',
          boxShadow: baseNodeSet.has(node.id) ? '0 0 10px 5px #43b2aa' : '',
        }}
        ref={myRef}
        onClick={() => handleNodeClick(node.id)}
      >
        <Box sx={{ textAlign: 'center', fontWeight: 600, marginBottom: '4px' }}>
          {node.name}
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {node.focusing &&
            node.agents.map(agentName => (
              <AgentIcon
                key={`planModification.${node.id}.${agentName}`}
                name={globalStorage.agentMap.get(agentName)?.icon ?? 'unknown'}
                style={{
                  width: '36px',
                  height: 'auto',
                  margin: '0px',
                  userSelect: 'none',
                }}
                tooltipInfo={globalStorage.agentMap.get(agentName)}
              />
            ))}
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
                onHover || whoIsAddingBranch === node.id ? 'visible' : 'hidden',
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
              updateWhoIsAddingBranch(node.id);
            }}
          >
            {whoIsAddingBranch !== node.id ? <AddIcon /> : <RemoveIcon />}
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

const Tree: React.FC<{
  tree: IPlanTreeNode;
}> = ({ tree }) => {
  const { whoIsAddingBranch } = usePlanModificationContext();

  const generalNodeStyle = {
    height: '60px',
    padding: '8px',
    display: 'flex',
    alignItems: 'center',
    margin: '8px 32px 8px 0px',
  };
  const focusedNodeStyle = {
    height: '80px',
    padding: '8px',
    display: 'flex',
    alignItems: 'center',
    margin: '8px 32px 8px 0px',
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'row', zIndex: 999 }}>
      <>
        {tree.id !== 'root' && (
          <Node
            node={tree}
            style={{
              justifyContent: 'center',
              alignSelf: 'flex-start',
              cursor: 'pointer',
              ...(tree.focusing ? focusedNodeStyle : generalNodeStyle),
            }}
          />
        )}
        {tree.id === 'root' && (
          <RootNode
            style={{
              justifyContent: 'center',
              ...(tree.children[0] && tree.children[0].focusing
                ? focusedNodeStyle
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
              style={{ ...generalNodeStyle }}
            />
          )}

          {tree.children.map(childTree => (
            <Tree key={`taskTree-${childTree.id}`} tree={childTree} />
          ))}
          {tree.id === whoIsAddingBranch && (
            <RequirementInputNode
              style={{ height: '80px', display: 'flex', alignItems: 'center' }}
            />
          )}
        </Box>
      </>
    </Box>
  );
};

interface IPlanModificationProps {
  style?: SxProps;
  resizeSignal?: number;
}

const TheViewContent = observer(
  ({ style, resizeSignal }: IPlanModificationProps) => {
    const { renderingPlanForest } = globalStorage;
    const { forest, setForest, setContainerRef, svgForceRender } =
      usePlanModificationContext();
    const myRef = React.useRef<HTMLElement>(null);

    React.useEffect(() => {
      setForest({
        agentIcons: [],
        agents: [],
        children: renderingPlanForest,
        id: 'root',
        leaf: false,
        name: 'root',
        focusing: true,
      });
    }, [renderingPlanForest]);

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
        {myRef.current && <PlanModificationSvg />}
        {forest && <Tree tree={forest} />}
      </Box>
    );
  },
);
/* eslint-enable max-lines */

const PlanModification: React.FC<IPlanModificationProps> = observer(
  ({ style, resizeSignal }) => {
    return (
      <PlanModificationProvider>
        <TheViewContent style={style} resizeSignal={resizeSignal} />
        {globalStorage.api.stepTaskTreeGenerating && (
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
      </PlanModificationProvider>
    );
  },
);

export default PlanModification;
