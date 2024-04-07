import { Box } from '@mui/material';
import React from 'react';

// 定义你的图标属性类型，这里可以扩展成任何你需要的属性
interface CustomIconProps {
  size?: number | string;
  color?: string;
  // ...其他你需要的props
}

// 创建你的自定义SVG图标组件
const checkIcon: React.FC<CustomIconProps> = ({
  size = '100%',
  color = 'currentColor',
}) => {
  return (
    <Box
      component="svg"
      width={size}
      height="auto"
      viewBox="0 0 11 9"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10.7204 0C7.37522 1.94391 4.95071 4.40066 3.85635 5.63171L1.18331 3.64484L0 4.54699L4.61463 9C5.4068 7.07085 7.92593 3.30116 11 0.620227L10.7204 0Z"
        fill={color}
      />
    </Box>
  );
};

export default checkIcon;
