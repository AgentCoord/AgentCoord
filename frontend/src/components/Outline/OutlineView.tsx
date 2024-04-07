// 已移除对d3的引用
import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import D3Graph from './D3Graph';
import { ObjectCard, ProcessCard, EditObjectCard } from './Cards';
import { RectWatcher } from './RectWatcher';
import { globalStorage } from '@/storage';

export default observer(() => {
  const { outlineRenderingStepTaskCards, focusingStepTaskId } = globalStorage;
  const [renderCount, setRenderCount] = useState(0);
  const [addObjectHover, setAddObjectHover] = useState(false);
  const [isAddingObject, setIsAddingObject] = useState(false);
  const [activeObjectAdd, setActiveObjectAdd] = useState('');
  const [activeProcessIdAdd, setactiveProcessIdAdd] = useState('');

  const handleProcessClick = (processName: string) => {
    if (processName === focusingStepTaskId) {
      globalStorage.setFocusingStepTaskId(undefined);
    } else {
      globalStorage.setFocusingStepTaskId(processName);
    }
  };

  const finishAddInitialObject = (objectName: string) => {
    setIsAddingObject(false);
    globalStorage.addUserInput(objectName);
  };

  const addInitialObject = () => setIsAddingObject(true);

  const handleObjectAdd = (objectName: string) =>
    setActiveObjectAdd(activeObjectAdd === objectName ? '' : objectName);
  const handleProcessAdd = (processName: string) =>
    setactiveProcessIdAdd(
      activeProcessIdAdd === processName ? '' : processName,
    );

  const cardRefMap = new Map<string, React.RefObject<HTMLElement>>();
  const getCardRef = (cardId: string) => {
    if (cardRefMap.has(cardId)) {
      return cardRefMap.get(cardId);
    } else {
      cardRefMap.set(cardId, React.createRef<HTMLElement>());
      return cardRefMap.get(cardId);
    }
  };

  const handleEditContent = (stepTaskId: string, newContent: string) => {
    globalStorage.setStepTaskContent(stepTaskId, newContent);
  };
  const WidthRatio = ['30%', '15%', '52.5%'];

  const [cardRefMapReady, setCardRefMapReady] = React.useState(false);

  React.useEffect(() => {
    setCardRefMapReady(true);
    setRenderCount(old => (old + 1) % 10);
  }, []);

  React.useEffect(() => {
    if (activeObjectAdd !== '' && activeProcessIdAdd !== '') {
      if (
        outlineRenderingStepTaskCards
          .filter(({ id }) => id === activeProcessIdAdd)[0]
          .inputs.includes(activeObjectAdd)
      ) {
        globalStorage.removeStepTaskInput(activeProcessIdAdd, activeObjectAdd);
      } else {
        globalStorage.addStepTaskInput(activeProcessIdAdd, activeObjectAdd);
      }
      // globalStorage.addStepTaskInput(activeProcessIdAdd, activeObjectAdd);
      setActiveObjectAdd('');
      setactiveProcessIdAdd('');
    }
  }, [activeObjectAdd, activeProcessIdAdd]);

  return (
    <Box
      sx={{
        position: 'relative',
        height: '100%',
        overflow: 'auto',
      }}
      ref={getCardRef('root')}
      onScroll={() => {
        globalStorage.renderLines({ delay: 0, repeat: 2 });
      }}
    >
      <RectWatcher onRectChange={() => setRenderCount(old => (old + 1) % 10)}>
        <Stack
          sx={{
            position: 'absolute',
            zIndex: 2,
            paddingTop: '30px',
            width: '100%',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              width: WidthRatio[0],
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            {isAddingObject ? (
              <EditObjectCard finishEdit={finishAddInitialObject} />
            ) : (
              <Box
                onMouseOver={() => setAddObjectHover(true)}
                onMouseOut={() => setAddObjectHover(false)}
                onClick={() => addInitialObject()}
                sx={{ display: 'inline-flex', paddingTop: '6px' }}
              >
                <IconButton
                  sx={{
                    color: 'primary',
                    '&:hover': {
                      color: 'primary.dark',
                    },
                    padding: '0px',
                    borderRadius: 0,
                    border: '1px dotted #333',

                    visibility: addObjectHover ? 'visible' : 'hidden',
                  }}
                >
                  <AddIcon />
                </IconButton>
              </Box>
            )}
          </Box>

          {globalStorage.userInputs.map(initialInput => (
            <Box key={initialInput} sx={{ display: 'flex' }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flex: `0 0 ${WidthRatio[0]}`,
                }}
              >
                <ObjectCard
                  key={initialInput}
                  object={{
                    name: initialInput,
                    cardRef: getCardRef(`object.${initialInput}`),
                  }}
                  // isAddActive={initialInput === activeObjectAdd}
                  isAddActive={activeProcessIdAdd !== ''}
                  {...(activeProcessIdAdd !== ''
                    ? {
                        addOrRemove: !outlineRenderingStepTaskCards
                          .filter(({ id }) => id === activeProcessIdAdd)[0]
                          .inputs.includes(initialInput),
                      }
                    : {})}
                  handleAddActive={handleObjectAdd}
                />
              </Box>
            </Box>
          ))}

          {outlineRenderingStepTaskCards.map(
            ({ id, name, output, agentIcons, agents, content, ref }, index) => (
              <Box
                key={`stepTaskCard.${id}`}
                sx={{ display: 'flex' }}
                ref={ref}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    width: WidthRatio[0],
                    justifyContent: 'center',
                    flex: `0 0 ${WidthRatio[0]}`,
                  }}
                >
                  {output && (
                    <ObjectCard
                      key={`objectCard.${output}`}
                      object={{
                        name: output,
                        cardRef: getCardRef(`object.${output}`),
                      }}
                      // isAddActive={output === activeObjectAdd}
                      isAddActive={
                        activeProcessIdAdd !== '' &&
                        outlineRenderingStepTaskCards
                          .map(({ id }) => id)
                          .indexOf(activeProcessIdAdd) > index
                      }
                      {...(activeProcessIdAdd !== ''
                        ? {
                            addOrRemove: !outlineRenderingStepTaskCards
                              .filter(({ id }) => id === activeProcessIdAdd)[0]
                              .inputs.includes(output),
                          }
                        : {})}
                      handleAddActive={handleObjectAdd}
                    />
                  )}
                </Box>
                <Box sx={{ flex: `0 0 ${WidthRatio[1]}` }} />
                <Box
                  sx={{
                    // display: 'flex',
                    alignItems: 'center',
                    // width: WidthRatio[2],
                    justifyContent: 'center',
                    flex: `0 0 ${WidthRatio[2]}`,
                  }}
                >
                  {name && (
                    <ProcessCard
                      process={{
                        id,
                        name,
                        icons: agentIcons,
                        agents,
                        content,
                        cardRef: getCardRef(`process.${name}`),
                      }}
                      handleProcessClick={handleProcessClick}
                      isFocusing={focusingStepTaskId === id}
                      isAddActive={id === activeProcessIdAdd}
                      handleAddActive={handleProcessAdd}
                      handleEditContent={handleEditContent}
                    />
                  )}
                </Box>
              </Box>
            ),
          )}
        </Stack>
      </RectWatcher>
      {cardRefMapReady && (
        <D3Graph
          cardRefMap={cardRefMap}
          focusingStepId={focusingStepTaskId || ''}
          relations={outlineRenderingStepTaskCards
            .map(({ id, name, inputs, output }) => {
              const relations: {
                type: string;
                stepTaskId: string;
                stepCardName: string;
                objectCardName: string;
              }[] = [];
              inputs.forEach(input => {
                relations.push({
                  type: 'input',
                  stepTaskId: id,
                  stepCardName: `process.${name}`,
                  objectCardName: `object.${input}`,
                });
              });
              if (output) {
                relations.push({
                  type: 'output',
                  stepTaskId: id,
                  stepCardName: `process.${name}`,
                  objectCardName: `object.${output}`,
                });
              }
              return relations;
            })
            .flat()}
          forceRender={renderCount}
        />
      )}
    </Box>
  );
});
