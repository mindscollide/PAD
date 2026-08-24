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

/**
 * Custom hook for infinite scroll detection on table, via an
 * IntersectionObserver watching a 1px sentinel appended to the end of the
 * AntD table body.
 *
 * FIXED (2026-08-24, per API_Changes/2026-08-24_co_portfolio_history_
 * duplicate_records_fe_investigation.md): every one of this hook's ~44
 * call sites across the app passes a fresh, non-memoized inline
 * `onBottomReach` function on every render. The observer-setup effect
 * below used to list `onBottomReach` (and `hasReachedBottom`, which the
 * effect itself flips) in its own dependency array, so it tore down and
 * rebuilt a brand-new IntersectionObserver on every single re-render, not
 * only when the user actually scrolled. IntersectionObserver fires its
 * callback immediately on `.observe()` if the target is already visible -
 * which it always is for any short/filtered list that fits the viewport -
 * producing an infinite fetch -> append -> re-render -> observer rebuild
 * -> immediate re-fire -> fetch-the-same-page-again loop, with no dedup
 * on the appended rows. Live-confirmed root cause of the CO Portfolio
 * History duplicate-row report (Compliant + Non-Compliant filter, 19
 * rows - short enough that the sentinel never actually left view).
 *
 * Fixed once, here, instead of memoizing the callback at all ~44 call
 * sites: `onBottomReach` is read through a ref that's kept fresh every
 * render, so the observer-setup effect only ever depends on
 * `threshold`/`prefixCls` and no longer rebuilds on a state update or a
 * new render. An `isFetchingRef` also guards against the (usually async)
 * `onBottomReach` being invoked again while a previous call is still in
 * flight, and the original 1s cooldown after completion is preserved via
 * a ref (not the `hasReachedBottom` state) so it can't go stale now that
 * the effect doesn't re-run when it flips.
 *
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
  const sentinelRef = useRef(null);
  const observerRef = useRef(null);

  // Always call the LATEST onBottomReach, updated every render - so the
  // observer-setup effect below never needs it as a dependency, and
  // therefore never rebuilds the observer just because a caller passed a
  // new inline function reference (which is every render, for all
  // current call sites).
  const onBottomReachRef = useRef(onBottomReach);
  onBottomReachRef.current = onBottomReach;

  // Re-entrancy guards, both via ref (not state) so a stale closure over
  // an effect that no longer depends on them can't reintroduce the same
  // bug this fix is for:
  // - isFetchingRef: true for the actual duration of an in-flight
  //   onBottomReach call (typically async) - the primary guard.
  // - cooldownRef: mirrors the original 1s post-fetch cooldown, kept as a
  //   secondary debounce against rapid-fire intersection changes.
  const isFetchingRef = useRef(false);
  const cooldownRef = useRef(false);

  useEffect(() => {
    // FIXED (2026-08-24, follow-up): several callers (e.g. CO Portfolio
    // History) only pass a `scroll.y` prop to AntD's <Table> once the row
    // list is non-empty - AntD only renders its internal `.{prefixCls}-body`
    // scrollable wrapper when `scroll.y` is set, so on first mount, before
    // the (async) initial fetch resolves, that wrapper doesn't exist in the
    // DOM at all yet. This effect used to do a single one-shot
    // `querySelector` and permanently give up (just a console.warn) if it
    // came up empty - previously "masked" by the old bug where the whole
    // effect reran on every render and kept retrying by accident. Now that
    // it correctly only depends on threshold/prefixCls, a one-shot miss on
    // mount means lazy load silently never works for the rest of the
    // page's life. Waits for the container to actually appear (and
    // re-attaches if it's later removed/replaced, e.g. the list goes back
    // to empty on a filter change) via a MutationObserver instead.
    let observer = null;
    let cleanupAttachment = null;

    const attach = (scrollContainer) => {
      // Create (or reuse) a 1px sentinel at the end of the scrollable body
      let sentinel = scrollContainer.querySelector("[data-scroll-sentinel]");
      if (!sentinel) {
        sentinel = document.createElement("div");
        sentinel.setAttribute("data-scroll-sentinel", "true");
        sentinel.style.height = "1px";
        scrollContainer.appendChild(sentinel);
      }
      sentinelRef.current = sentinel;

      observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          if (isFetchingRef.current || cooldownRef.current) return;

          isFetchingRef.current = true;
          cooldownRef.current = true;
          setHasReachedBottom(true);

          Promise.resolve(onBottomReachRef.current?.()).finally(() => {
            isFetchingRef.current = false;
            setTimeout(() => {
              cooldownRef.current = false;
              setHasReachedBottom(false);

              // IntersectionObserver only fires on a visibility TRANSITION
              // (not-visible -> visible), never just "while still
              // visible". If the page just appended still doesn't fill
              // the viewport (a short/filtered list, or simply the next
              // page also fits) the sentinel never actually leaves and
              // re-enters view, so nothing would ever trigger the next
              // page again. unobserve+observe forces IntersectionObserver
              // to re-evaluate and redeliver the target's *current* state
              // immediately, so this fires again (continuing the cascade,
              // throttled to this ~1s cadence) for as long as the
              // sentinel is still visible, and simply goes quiet once
              // it's finally been pushed off-screen by real content.
              if (
                sentinelRef.current &&
                scrollContainer.contains(sentinelRef.current)
              ) {
                observer.unobserve(sentinelRef.current);
                observer.observe(sentinelRef.current);
              }
            }, 1000);
          });
        },
        {
          root: scrollContainer,
          rootMargin: `0px 0px ${threshold}px 0px`,
          threshold: 0,
        }
      );

      observer.observe(sentinel);
      observerRef.current = observer;

      return () => {
        observer?.disconnect();
        observer = null;
        sentinelRef.current = null;
      };
    };

    const findAndAttachIfNeeded = () => {
      const scrollContainer = document.querySelector(`.${prefixCls}-body`);

      if (scrollContainer && !observer) {
        cleanupAttachment = attach(scrollContainer);
      } else if (!scrollContainer && observer) {
        // Container was removed (e.g. list emptied out again) - tear down
        // and wait for it to reappear.
        cleanupAttachment?.();
        cleanupAttachment = null;
      }
    };

    findAndAttachIfNeeded();

    // Watch the whole document for the container showing up/disappearing -
    // scoped broadly (document.body) since the exact ancestor that gets
    // re-rendered varies per page/layout, and this callback is cheap
    // (a single querySelector) relative to how infrequently large DOM
    // mutations actually happen.
    const containerWatcher = new MutationObserver(findAndAttachIfNeeded);
    containerWatcher.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      containerWatcher.disconnect();
      cleanupAttachment?.();
    };
    // Intentionally NOT depending on onBottomReach or hasReachedBottom -
    // see the ref-based pattern above. Only threshold/prefixCls should
    // ever cause this effect (and the MutationObserver watching for the
    // container) to be torn down and rebuilt.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threshold, prefixCls]);

  return { hasReachedBottom, containerRef: sentinelRef, setHasReachedBottom };
};
