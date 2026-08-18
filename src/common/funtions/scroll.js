// import { useEffect, useRef, useState } from "react";
// /**
//  * Custom hook for infinite scroll detection on table
//  * @param {Function} onBottomReach - Callback when bottom is reached
//  * @param {number} threshold - Pixel threshold from bottom
//  * @param {string} prefixCls - CSS class prefix for table
//  * @returns {Object} Scroll state and container ref
//  */
// export const useTableScrollBottom = (
//   onBottomReach,
//   threshold = 0,
//   prefixCls = "ant-table"
// ) => {
//   const [hasReachedBottom, setHasReachedBottom] = useState(false);
//   const containerRef = useRef(null);
//   const previousScrollTopRef = useRef(0);

//   useEffect(() => {
//     const selector = `.${prefixCls}-body`;
//     const scrollContainer = document.querySelector(selector);

//     if (!scrollContainer) {
//       console.warn(`Scroll container not found for selector: ${selector}`);
//       return;
//     }

//     containerRef.current = scrollContainer;

//     const handleScroll = () => {
//       const { scrollTop, scrollHeight, clientHeight } = scrollContainer;

//       // Detect vertical scroll only
//       const scrolledVertically = scrollTop !== previousScrollTopRef.current;
//       previousScrollTopRef.current = scrollTop;

//       if (!scrolledVertically) return;

//       const isScrollable = scrollHeight > clientHeight;
//       const isBottom = scrollTop + clientHeight >= scrollHeight - threshold;

//       if (isScrollable && isBottom && !hasReachedBottom) {
//         setHasReachedBottom(true);
//         onBottomReach?.();

//         // Reset after delay to prevent multiple triggers
//         setTimeout(() => setHasReachedBottom(false), 1000);
//       }
//     };

//     scrollContainer.addEventListener("scroll", handleScroll);
//     return () => scrollContainer.removeEventListener("scroll", handleScroll);
//   }, [hasReachedBottom, onBottomReach, threshold, prefixCls]);

//   return {
//     hasReachedBottom,
//     containerRef,
//     setHasReachedBottom,
//   };
// };

import { useEffect, useRef, useState } from "react";

export const useTableScrollBottom = (
  onBottomReach,
  threshold = 0,
  prefixCls = "ant-table"
) => {
  const [hasReachedBottom, setHasReachedBottom] = useState(false);
  const sentinelRef = useRef(null);
  const observerRef = useRef(null);

  useEffect(() => {
    const scrollContainer = document.querySelector(`.${prefixCls}-body`);
    if (!scrollContainer) {
      console.warn(`Scroll container not found for .${prefixCls}-body`);
      return;
    }

    // Create (or reuse) a 1px sentinel at the end of the scrollable body
    let sentinel = scrollContainer.querySelector("[data-scroll-sentinel]");
    if (!sentinel) {
      sentinel = document.createElement("div");
      sentinel.setAttribute("data-scroll-sentinel", "true");
      sentinel.style.height = "1px";
      scrollContainer.appendChild(sentinel);
    }
    sentinelRef.current = sentinel;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasReachedBottom) {
          setHasReachedBottom(true);
          onBottomReach?.();
          setTimeout(() => setHasReachedBottom(false), 1000);
        }
      },
      {
        root: scrollContainer,
        rootMargin: `0px 0px ${threshold}px 0px`,
        threshold: 0,
      }
    );

    observer.observe(sentinel);
    observerRef.current = observer;

    return () => observer.disconnect();
  }, [hasReachedBottom, onBottomReach, threshold, prefixCls]);

  return { hasReachedBottom, containerRef: sentinelRef, setHasReachedBottom };
};
