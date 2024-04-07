import React from 'react';

export const useResize = <T extends HTMLElement = HTMLElement>(
  onResize: () => void,
) => {
  const ref = React.useRef<T>(null);
  React.useEffect(() => {
    if (ref.current) {
      const observer = new ResizeObserver(onResize);
      observer.observe(ref.current);
      return () => observer.disconnect();
    }
    return () => undefined;
  }, [ref.current]);
  return ref;
};
