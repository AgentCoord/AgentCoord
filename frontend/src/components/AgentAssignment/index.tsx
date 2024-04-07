/* eslint-disable max-lines */

import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { CircularProgress, SxProps } from '@mui/material';
import Box from '@mui/material/Box';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
// import SendIcon from '@mui/icons-material/Send';
import _ from 'lodash';
// import { autorun } from 'mobx';
// import {
//   fakeAgentScoreMap,
//   fakeAgentSelections,
//   fakeCurrentAgentSelection,
// } from './data/fakeAgentAssignment';
import CheckIcon from '@/icons/CheckIcon';
import AgentIcon from '@/components/AgentIcon';
import { globalStorage } from '@/storage';
import SendIcon from '@/icons/SendIcon';

const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: '#e7e7e7',
    color: 'rgba(0, 0, 0, 0.87)',
    width: 'fit-content',
    fontSize: theme.typography.pxToRem(12),
    border: '1px solid #dadde9',
  },
}));
const getHeatColor = (value: number) => {
  return `rgba(74, 156, 158,${value / 5})`;
};
const AgentScoreCell: React.FC<{
  data: { score: number; reason: string };
}> = ({ data }) => {
  return (
    <HtmlTooltip
      title={
        <>
          <Box>Score Reason:</Box>
          <Box>{data.reason}</Box>
        </>
      }
      followCursor
      placement="right-start"
    >
      <Box
        sx={{
          width: '35px',
          height: '35px',
          backgroundColor: getHeatColor(data.score),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '14px',
          fontWeight: '200',
          fontStyle: 'italic',
        }}
      >
        {data.score}
      </Box>
    </HtmlTooltip>
  );
};

const AspectCell: React.FC<{
  key?: string;
  aspect?: string;
  style?: SxProps;
  isSelected?: boolean;
  handleSelected?: (aspect: string) => void;
}> = ({ key, aspect, style, isSelected, handleSelected }) => {
  const mystyle: SxProps = {
    width: '150px',
    height: '35px',
    position: 'sticky', // 使得这个Box成为sticky元素
    right: -1, // 0距离左侧，这将确保它卡在左侧
    backgroundColor: '#ffffff', // 防止滚动时格子被内容覆盖
    zIndex: 1, // 确保它在其他内容上方
    display: 'flex',
    alignItems: 'center',
    paddingLeft: '8px',
    fontSize: '14px',
    lineHeight: '1',
    borderBottom: '2px solid #ffffff',
    ...style,
  };
  if (!aspect) {
    return <Box sx={mystyle} />;
  }
  return (
    <Box
      key={key}
      sx={{
        ...mystyle,
        cursor: 'pointer',
        color: isSelected ? 'black' : '#ACACAC',
        textDecoration: isSelected ? 'underline' : 'none',
        textDecorationColor: '#43b2aa',
        textDecorationThickness: '1.5px',
        fontWeight: '300',
        fontSize: '14px',
        fontStyle: 'italic',
      }}
      onClick={() => {
        if (handleSelected) {
          handleSelected(aspect);
        }
      }}
    >
      {aspect || ''}
    </Box>
  );
};

const EmotionInput: React.FC<{
  inputCallback: (arg0: string) => void;
}> = ({ inputCallback }) => {
  const [inputValue, setInputValue] = useState('');
  const inputRef = React.useRef();

  const handleInputChange = (event: any) => {
    setInputValue(event.target.value);
  };

  const handleButtonClick = () => {
    inputCallback(inputValue);
    setInputValue('');
  };
  return (
    <Paper
      sx={{
        p: '0px',
        display: 'flex',
        alignItems: 'center',
        width: 400,
        backgroundColor: 'rgb(0,0,0,0)',
        boxShadow: 'none',
        border: '2px solid #b0b0b0',
        borderRadius: '8px',
      }}
    >
      <InputBase
        sx={{ marginLeft: 1, flex: 1 }}
        placeholder="Aspect"
        value={inputValue}
        onChange={handleInputChange}
        ref={inputRef}
      />
      <IconButton
        type="submit"
        sx={{
          color: 'primary',
          '&:hover': {
            color: 'primary.dark',
          },
          padding: '0px 6px',
          height: 'min-content',
          aspectRatio: '1 / 1',
        }}
        onClick={handleButtonClick}
      >
        <SendIcon color="#b6b6b6" />
      </IconButton>
    </Paper>
  );
};
const findSameSelectionId = (
  a: Record<
    string,
    {
      id: string;
      agents: string[];
    }
  >,
  b: Set<string>,
) => {
  const sortedB = Array.from(b).slice().sort(); // 对 b 进行排序
  const bString = sortedB.join(',');

  const akeys = Object.keys(a);
  for (const akey of akeys) {
    const sortedA = a[akey].agents.slice().sort(); // 对 a 中的每个数组进行排序
    if (sortedA.join(',') === bString) {
      return akey; // 找到相同数组则返回索引
    }
  }
  return undefined; // 未找到相同数组
};
interface IPlanModification {
  style?: SxProps;
}
export default observer(({ style = {} }: IPlanModification) => {
  //   console.log(prop);
  const {
    agentMap,
    renderingAgentSelections,
    api: { agentsReady },
  } = globalStorage;

  // autorun(() => {
  //   console.log(renderingAgentSelections);
  // });

  const [agentSelections, setAgentSelections] = React.useState<
    Record<
      string,
      {
        id: string;
        agents: string[];
      }
    >
  >({});
  const [currentAgentSelection, setCurrentSelection] = React.useState<
    string | undefined
  >();
  const [heatdata, setHeatdata] = React.useState<
    Record<
      string,
      Record<
        string,
        {
          score: number;
          reason: string;
        }
      >
    >
  >({});

  const [aspectSelectedSet, setAspectSelectedSet] = React.useState(
    new Set<string>(),
  );

  useEffect(() => {
    if (renderingAgentSelections.current) {
      setAgentSelections(renderingAgentSelections.selections);
      setHeatdata(renderingAgentSelections.heatdata);
      setCurrentSelection(renderingAgentSelections.current);
      setAgentSelectedSet(
        new Set(
          renderingAgentSelections.selections[
            renderingAgentSelections.current
          ].agents,
        ),
      );
    }
  }, [renderingAgentSelections]);

  const handleAspectSelected = (aspect: string) => {
    const newSet = new Set(aspectSelectedSet);
    if (newSet.has(aspect)) {
      newSet.delete(aspect);
    } else {
      newSet.add(aspect);
    }
    setAspectSelectedSet(newSet);
  };
  const [agentSelectedSet, setAgentSelectedSet] = React.useState(
    new Set<string>(),
  );
  const handleAgentSelected = (agent: string) => {
    const newSet = new Set(agentSelectedSet);
    if (newSet.has(agent)) {
      newSet.delete(agent);
    } else {
      newSet.add(agent);
    }
    setAgentSelectedSet(newSet);
  };

  const [agentKeyList, setAgentKeyList] = useState<string[]>([]);

  useEffect(() => {
    // 计算平均分的函数
    function calculateAverageScore(agent: string) {
      const aspects = aspectSelectedSet.size
        ? Array.from(aspectSelectedSet)
        : Object.keys(heatdata);
      const meanScore = _.mean(
        aspects.map(aspect => heatdata[aspect]?.[agent]?.score ?? 0),
      );

      return meanScore;
    }

    // 对agentMap.keys()进行排序
    const newAgentKeyList = Array.from(agentMap.keys()).sort((a, b) => {
      const isSelectedA = agentSelectedSet.has(a);
      const isSelectedB = agentSelectedSet.has(b);

      if (isSelectedA && !isSelectedB) {
        return -1;
      } else if (!isSelectedA && isSelectedB) {
        return 1;
      } else {
        const averageScoreA = calculateAverageScore(a);
        const averageScoreB = calculateAverageScore(b);

        // 降序排序（平均分高的在前）
        return averageScoreB - averageScoreA;
      }
    });

    setAgentKeyList(newAgentKeyList);
  }, [agentMap, heatdata, aspectSelectedSet, agentSelectedSet]);

  if (!agentsReady) {
    return <></>;
  }

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflowY: 'hidden',
      }}
    >
      {globalStorage.api.agentAspectScoresGenerating && (
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
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          ...style,
        }}
      >
        {/* assignments */}
        <Box
          sx={{
            width: '20%',
            backgroundColor: 'white',
            padding: '8px 6px',
            overflowY: 'auto',
          }}
        >
          <Box sx={{ marginBottom: '6px', fontWeight: '600' }}>Assignment</Box>
          <Box>
            {Object.keys(agentSelections).map(selectionId => (
              <Box
                key={`agentSelectionSet.${selectionId}`}
                sx={{
                  border: (() => {
                    if (selectionId === currentAgentSelection) {
                      return '2px solid #508a87';
                    }
                    return '2px solid #afafaf';
                  })(),
                  borderRadius: '10px',
                  margin: '4px 0px',
                  padding: '4px 0px 4px 0px',
                  backgroundColor: '#f6f6f6',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'center', // 添加这一行
                  alignItems: 'center', // 添加这一行
                  flexWrap: 'wrap',
                }}
                onClick={() => {
                  globalStorage.setCurrentAgentSelection(selectionId);
                }}
              >
                {agentSelections[selectionId].agents.map(agentName => (
                  <AgentIcon
                    key={`${selectionId}.${agentName}`}
                    name={agentMap.get(agentName)?.icon}
                    style={{
                      width: 'auto',
                      height: '30px',
                      marginRight: '-5px',
                      userSelect: 'none',
                      margin: '0px 0px',
                    }}
                    tooltipInfo={agentMap.get(agentName)}
                  />
                ))}
              </Box>
            ))}
          </Box>
        </Box>
        {/* comparison */}
        <Box
          sx={{
            width: '80%',
            backgroundColor: 'white',
            marginLeft: '4px',
            padding: '8px 6px',
            overflowY: 'auto',
          }}
        >
          <Box sx={{ marginBottom: '4px', fontWeight: '600' }}>Comparison</Box>

          <Box
            sx={{
              overflowX: 'auto',
              width: '-webkit-fill-available',
            }}
          >
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: `repeat(${agentMap.size}, 35px) max-content`,
                alignItems: 'center',
                gridAutoFlow: 'column',
                gridTemplateRows: `35px repeat(${
                  Object.keys(heatdata).length
                }, 35px)`, // 第一列设置为max-content，其余列为1fr
              }}
            >
              {agentSelectedSet.size > 0 && (
                <Box
                  sx={{
                    gridColumn: `1 / ${1 + agentSelectedSet.size}`,
                    gridRow: `1`,
                    border: '2px dashed #508a87',
                    borderRadius: '10px 10px 0px 10px',
                    boxSizing: 'border-box',
                    width: '100%',
                    height: '100%',
                    position: 'relative',
                    pointerEvents: 'none',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      right: '-3px',
                      bottom: '-3px',
                      height: '50%',
                      // width: '1.35px',
                      aspectRatio: '1 / 1',
                      backgroundColor: '#508a87',
                      borderRadius: '10px 0px 0px 0px',
                      pointerEvents: 'auto',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                    onClick={() => {
                      const findSelectionId = findSameSelectionId(
                        agentSelections,
                        agentSelectedSet,
                      );
                      if (findSelectionId) {
                        globalStorage.setCurrentAgentSelection(findSelectionId);
                      } else {
                        globalStorage.addAgentSelection(
                          Array.from(agentSelectedSet),
                        );
                      }
                    }}
                  >
                    <CheckIcon color="white" size="80%" />
                  </div>
                </Box>
              )}

              {agentKeyList.map((agentKey, agentIndex) => (
                <Box
                  key={agentKey}
                  sx={{
                    gridColumn: `${agentIndex + 1}`,
                    gridRow: `1 / ${2 + Object.keys(heatdata).length}`,
                  }}
                >
                  <Box
                    key={agentKey}
                    onClick={() => {
                      handleAgentSelected(agentKey);
                    }}
                    style={{
                      display: 'grid',
                      placeItems: 'center',
                      gridColumn: `${agentIndex + 1} / ${agentIndex + 2}`,
                      gridRow: '1 / 2',
                      height: '100%',
                      width: '100%',
                      padding: '0px 0px',
                      cursor: 'pointer',
                    }}
                  >
                    <AgentIcon
                      key={`agentIcon.${agentKey}`}
                      name={agentMap.get(agentKey)!.icon}
                      style={{
                        width: 'auto',
                        height: '80%',
                        userSelect: 'none',
                        margin: '0px',
                      }}
                      tooltipInfo={agentMap.get(agentKey)}
                    />
                  </Box>
                  {Object.keys(heatdata).map(aspect => {
                    return (
                      <AgentScoreCell
                        key={`${aspect}.${agentKey}`}
                        data={
                          heatdata[aspect][agentKey] || {
                            reason: '',
                            score: 0,
                          }
                        }
                      />
                    );
                  })}
                </Box>
              ))}

              <AspectCell style={{ height: '100%' }} />
              {Object.keys(heatdata).map(aspect => (
                <AspectCell
                  key={`aspect.${aspect}`}
                  aspect={aspect}
                  isSelected={aspectSelectedSet.has(aspect)}
                  handleSelected={handleAspectSelected}
                  style={{ height: '100%', fontSize: '12px' }}
                />
              ))}
            </Box>
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              height: '35px',
              alignItems: 'center',
              marginTop: '8px',
            }}
          >
            <EmotionInput
              inputCallback={(arg0: string) => {
                globalStorage.addAgentSelectionAspects(arg0);
              }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
  // return <Box>hhh</Box>;
});
/* eslint-enable max-lines */
