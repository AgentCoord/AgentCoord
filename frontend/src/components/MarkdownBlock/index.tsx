import React from 'react';
import remarkGfm from 'remark-gfm';
import Box from '@mui/material/Box';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { SxProps } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';

// import './markdown-style.css';
import './github-mardown.css';
// import './hljs-atom-one-dark.min.css';
// import './prism-one-dark.css';

export interface IMarkdownViewArguments {
  text?: string;
  style?: SxProps;
}

export default React.memo<IMarkdownViewArguments>(
  ({ text = '', style = {} }) => {
    return (
      <Box className="markdown-body" sx={{ minHeight: '20px', ...style }}>
        <ReactMarkdown
          remarkPlugins={[remarkMath, remarkGfm]}
          rehypePlugins={[rehypeHighlight, rehypeKatex]}
        >
          {text}
        </ReactMarkdown>
      </Box>
    );
  },
);
