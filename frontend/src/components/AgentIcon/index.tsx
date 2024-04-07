import React from 'react';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import { styled, SxProps } from '@mui/material/styles';
// import Box from '@mui/material/Box';
import { Divider, Box } from '@mui/material';
import { IconName, IconUrl, IconMap } from './agents';
import { IAgent } from '@/apis/get-agents';
import { ActionType } from '@/storage/plan';

interface ITooltipInfo extends IAgent {
  action?: { type: ActionType; description: string; style: SxProps };
}
export interface IAgentIconProps {
  name?: IconName | string;
  style?: React.CSSProperties;
  tooltipInfo?: ITooltipInfo;
}

const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: '#f2f2f2',
    color: 'rgba(0, 0, 0, 0.87)',
    width: 'fit-content',
    fontSize: theme.typography.pxToRem(12),
    border: '1px solid #0003',
    boxShadow: '1px 1px 4px #0003',
  },
}));

const generateTooltip = (info: ITooltipInfo) => {
  return (
    <Box sx={{ maxWidth: '20vh', padding: '4px 0px' }}>
      <Box
        sx={{
          fontSize: '16px',
          fontWeight: 600,
          userSelect: 'none',
          padding: '0 4px',
        }}
      >
        {info.name}
      </Box>
      <Box
        sx={{
          margin: '4px 0',
          fontSize: '14px',
          padding: '0 4px',
          borderRadius: '6px',
          fontWeight: 400,
          userSelect: 'none',
        }}
      >
        {info.profile}
      </Box>
      {info.action && (
        <Box
          sx={{
            borderRadius: '6px',
            padding: '4px 4px',
            border: '1px solid #333',
            ...info.action.style,
          }}
        >
          <Box sx={{ fontWeight: 600 }}>{info.action.type}</Box>
          <Divider
            sx={{
              margin: '1px 0px',
              borderBottom: '1px dashed', // 设置为虚线
              borderColor: '#888888',
            }}
          />
          <Box>{info.action.description}</Box>
        </Box>
      )}
    </Box>
  );
};

export default React.memo<IAgentIconProps>(
  ({ style = {}, name = 'Unknown', tooltipInfo }) => {
    const _name = React.useMemo(() => IconMap[name], [name]);

    return tooltipInfo ? (
      <HtmlTooltip
        title={generateTooltip(tooltipInfo)}
        followCursor
        placement="right-start"
      >
        <img
          // title={_name}
          alt={_name}
          src={IconUrl[_name]}
          style={{
            width: '100%',
            height: '100%',
            imageRendering: 'pixelated',
            ...style,
          }}
        />
      </HtmlTooltip>
    ) : (
      <img
        // title={_name}
        alt={_name}
        src={IconUrl[_name]}
        style={{
          width: '100%',
          height: '100%',
          imageRendering: 'pixelated',
          ...style,
        }}
      />
    );
  },
);

export { IconName, IconMap, IconUrl } from './agents';
