import { useEffect, useRef, useState } from "react";

/**
 * Custom hook for infinite scroll detection on table
 * @param {Function} onBottomReach - Callback when bottom is reached
 * @param {number} threshold - Pixel threshold from bottom
 * @param {string} prefixCls - CSS class prefix for table
 * @returns {Object} Scroll state and container ref
 */
export const useTableScrollBottom = (
  onBottomReach,
  threshold = 0,
  prefixCls = "ant-table"
) => {
  const [hasReachedBottom, setHasReachedBottom] = useState(false);
  const containerRef = useRef(null);
  const previousScrollTopRef = useRef(0);

  useEffect(() => {
    const selector = `.${prefixCls}-body`;
    const scrollContainer = document.querySelector(selector);

    if (!scrollContainer) {
      console.warn(`Scroll container not found for selector: ${selector}`);
      return;
    }

    containerRef.current = scrollContainer;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;

      // Detect vertical scroll only
      const scrolledVertically = scrollTop !== previousScrollTopRef.current;
      previousScrollTopRef.current = scrollTop;

      if (!scrolledVertically) return;

      const isScrollable = scrollHeight > clientHeight;
      const isBottom = scrollTop + clientHeight >= scrollHeight - threshold;

      if (isScrollable && isBottom && !hasReachedBottom) {
        setHasReachedBottom(true);
        onBottomReach?.();

        // Reset after delay to prevent multiple triggers
        setTimeout(() => setHasReachedBottom(false), 1000);
      }
    };

    scrollContainer.addEventListener("scroll", handleScroll);
    return () => scrollContainer.removeEventListener("scroll", handleScroll);
  }, [hasReachedBottom, onBottomReach, threshold, prefixCls]);

  return {
    hasReachedBottom,
    containerRef,
    setHasReachedBottom,
  };
};