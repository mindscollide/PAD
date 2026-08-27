import { useEffect, useState } from "react";

/**
 * Client-side "Time Remaining to Trade" countdown.
 *
 * The backend only ever sends a pre-formatted snapshot string (e.g.
 * "2d 5h 30m", TradeRepository.cs's CalculateRemainingTime) - correct at
 * fetch/MQTT time, but frozen from then on: nothing in this codebase ever
 * recomputed or re-rendered it, so a row could sit open for hours showing
 * a stale countdown.
 *
 * Two ways to get an absolute deadline to tick down from:
 *   1. A real raw deadline (deadlineDate "yyyyMMdd" + deadlineTime
 *      "HHmmss") - parseDeadlineToUtcMs - not sent anywhere yet (see
 *      API_Changes/2026-08-27_time_remaining_needs_raw_deadline.md), the
 *      precise option once BE adds it.
 *   2. Estimated from the backend's own "Xd Yh Zm" label -
 *      estimateDeadlineFromLabel - works today with zero BE changes,
 *      accurate to within ~1 minute (the label's own granularity). Callers
 *      should prefer (1) when present and fall back to (2).
 * Either way, formatTimeRemaining recomputes the live display from the
 * resulting absolute ms value on every tick (useTimeRemainingTick).
 */

/** Parses a "yyyyMMdd" + "HHmmss" UTC pair (same convention as
 * formatApiDateTime/rejex.js) into a UTC epoch-ms number, or null if
 * either part is missing/unparseable. */
export const parseDeadlineToUtcMs = (deadlineDate, deadlineTime) => {
  if (
    !deadlineDate ||
    typeof deadlineDate !== "string" ||
    deadlineDate.length < 8
  ) {
    return null;
  }

  const year = parseInt(deadlineDate.slice(0, 4), 10);
  const month = parseInt(deadlineDate.slice(4, 6), 10) - 1;
  const day = parseInt(deadlineDate.slice(6, 8), 10);

  const time = typeof deadlineTime === "string" ? deadlineTime : "";
  const hours = parseInt(time.slice(0, 2), 10) || 0;
  const minutes = parseInt(time.slice(2, 4), 10) || 0;
  const seconds = parseInt(time.slice(4, 6), 10) || 0;

  const utcMs = Date.UTC(year, month, day, hours, minutes, seconds);
  return Number.isNaN(utcMs) ? null : utcMs;
};

/** Mirrors TradeRepository.cs's CalculateRemainingTime, plus a seconds
 * countdown for the final minute ("4s 3s 2s ... 0s") once BE doesn't split
 * that finely - "Expired" once the deadline has passed. Returns null (not
 * a string) when there's no deadline to compute from, so callers can
 * distinguish "no deadline available" from a real "Expired". */
export const formatTimeRemaining = (deadlineUtcMs, nowMs = Date.now()) => {
  if (deadlineUtcMs === null || deadlineUtcMs === undefined) return null;

  const remainingMs = deadlineUtcMs - nowMs;
  if (remainingMs <= 0) return "Expired";

  const totalSeconds = Math.floor(remainingMs / 1000);
  if (totalSeconds < 60) return `${totalSeconds}s`;

  const totalMinutes = Math.floor(totalSeconds / 60);
  const days = Math.floor(totalMinutes / (24 * 60));
  const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
  const minutes = totalMinutes % 60;

  return `${days}d ${hours}h ${minutes}m`;
};

/**
 * Approximates an absolute UTC deadline from the backend's own
 * pre-formatted "Xd Yh Zm" snapshot string ("Expired"/empty ->  null) -
 * the fallback for screens that don't send a raw deadline at all
 * (everywhere, right now - see API_Changes/2026-08-27_time_remaining_
 * needs_raw_deadline.md). Call this ONCE, at the moment a row's data
 * arrives (mapping time, not render time) - `asOfMs` anchors the estimate
 * to when the label was actually valid, so repeated calls on every render
 * don't keep pushing the deadline forward. Only minute-precision (matches
 * the label's own granularity), so the real deadline could be up to ~59s
 * earlier or later than this estimate.
 */
export const estimateDeadlineFromLabel = (label, asOfMs = Date.now()) => {
  if (typeof label !== "string") return null;

  const match = label.match(/(\d+)d\s*(\d+)h\s*(\d+)m/);
  if (!match) return null;

  const [, days, hours, minutes] = match.map(Number);
  const totalMs = ((days * 24 + hours) * 60 + minutes) * 60000;

  return asOfMs + totalMs;
};

/**
 * Call once from the owning PAGE component (not from inside a table
 * column's `render` callback - AntD Table re-invokes `render` for every
 * row on every parent re-render already, and column arrays here are
 * already rebuilt fresh each render, so a single tick at the page level is
 * enough to refresh every row's countdown - no per-row hook needed, which
 * matters because a table `render` callback isn't a real component
 * instance and can't safely own its own hook state across a changing
 * number of rows).
 *
 * Forces a re-render every `intervalMs` (default 1s, so the final minute
 * before a deadline visibly counts down second by second - see
 * formatTimeRemaining) for as long as the owning component stays mounted.
 */
export const useTimeRemainingTick = (intervalMs = 1000) => {
  const [, forceTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => forceTick((t) => t + 1), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
};
