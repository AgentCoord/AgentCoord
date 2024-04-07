import React from 'react';
import debounce from 'lodash/debounce';

// Define the props for the RectWatcher component
interface RectWatcherProps {
  children: React.ReactNode;
  onRectChange: (size: { height: number; width: number }) => void;
  debounceDelay?: number; // Optional debounce delay with a default value
}

// Rewrite the RectWatcher component with TypeScript
export const RectWatcher = React.memo<RectWatcherProps>(
  ({
    children,
    onRectChange,
    debounceDelay = 10, // Assuming the delay is meant to be in milliseconds
  }) => {
    const [lastSize, setLastSize] = React.useState<{
      height: number;
      width: number;
    }>({
      height: -1,
      width: -1,
    });
    const ref = React.createRef<HTMLElement>(); // Assuming the ref is attached to a div element

    const debouncedHeightChange = React.useMemo(
      () =>
        debounce((newSize: { height: number; width: number }) => {
          if (
            newSize.height !== lastSize.height ||
            newSize.width !== lastSize.width
          ) {
            onRectChange(newSize);
            setLastSize(newSize);
          }
        }, debounceDelay),
      [onRectChange, debounceDelay, lastSize],
    );

    React.useEffect(() => {
      if (ref.current) {
        const resizeObserver = new ResizeObserver(
          (entries: ResizeObserverEntry[]) => {
            if (!entries.length) {
              return;
            }
            const entry = entries[0];
            debouncedHeightChange({
              height: entry.contentRect.height,
              width: entry.contentRect.width,
            });
          },
        );
        resizeObserver.observe(ref.current);
        return () => resizeObserver.disconnect();
      }
      return () => undefined;
    }, [debouncedHeightChange]);

    // Ensure children is a single React element
    if (
      React.Children.count(children) !== 1 ||
      !React.isValidElement(children)
    ) {
      console.error('RectWatcher expects a single React element as children.');
      return <></>;
    }

    // Clone the child element with the ref attached
    return React.cloneElement(children, { ref } as any);
  },
);
