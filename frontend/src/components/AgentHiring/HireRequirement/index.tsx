import React from 'react';
import { SxProps } from '@mui/material';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import FormControl from '@mui/material/FormControl';
import FilledInput from '@mui/material/FilledInput';
import CampaignIcon from '@mui/icons-material/Campaign';

export interface IHireRequirementProps {
  style?: SxProps;
  valueRef?: React.MutableRefObject<string>;
  onSubmit?: (value: string) => void;
  onChange?: (value: string) => void;
}

export default React.memo<IHireRequirementProps>(
  ({ style = {}, valueRef, onSubmit, onChange }) => {
    const [value, setValue] = React.useState('');
    const handleChange = React.useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        setValue(event.target.value);
        onChange?.(event.target.value);
      },
      [onChange],
    );
    const handleSubmit = React.useCallback(() => {
      onSubmit?.(value);
    }, [onSubmit, value]);
    React.useEffect(() => {
      if (valueRef) {
        valueRef.current = value;
      }
    }, [valueRef, value]);
    return (
      <FormControl
        sx={{
          width: '100%',
          position: 'relative',
          ...style,
        }}
      >
        <Box
          sx={{
            width: '100%',
            opacity: 0.5,
            fontWeight: 600,
            fontSize: '18px',
            userSelect: 'none',
            padding: '2px 6px',
          }}
        >
          Hire Requirement
        </Box>
        <FilledInput
          placeholder="请输入……"
          fullWidth
          multiline
          rows={4}
          value={value}
          onChange={handleChange}
          size="small"
          sx={{
            fontSize: '14px',
            paddingTop: '10px',
            paddingBottom: '10px',
            borderRadius: '10px',
            borderBottom: 'none !important',
            '&::before': {
              borderBottom: 'none !important',
            },
          }}
        />
        <IconButton
          disabled={!value}
          aria-label="提交"
          sx={{ position: 'absolute', right: '6px', bottom: '2px' }}
          onClick={handleSubmit}
        >
          <CampaignIcon />
        </IconButton>
      </FormControl>
    );
  },
);
