/**
 * Builds Ant Design Table column definitions for employee portfolio transactions.
 *
 * Features:
 * - Transaction ID: formatted with optional uploaded icon (2px spacing).
 * - Transaction Conducted Date & Time: formatted via `formatApiDateTime`.
 * - Type: Buy/Sell with conditional color coding.
 * - Quantity: Number with Buy/Sell color coding.
 * - Brokers: Supports single, multiple, or "Multiple Brokers".
 *   - Matches broker IDs against provided `brokerOptions`.
 *   - Falls back to showing raw ID(s) if not found.
 *   - Automatically wraps text for long broker names.
 * - Verification Date & Time: formatted via `formatApiDateTime`.
 *
 * @param {Object} deps - External dependencies
 * @param {Function} deps.formatCode - Formats transaction IDs
 * @param {Function} deps.formatApiDateTime - Formats date/time values
 * @param {string} deps.UploadIcon - Path/URL for uploaded portfolio icon
 * @param {Array} deps.brokerOptions - Available brokers [{ brokerID: number, brokerName: string, label: string }]
 * @param {React.ElementType} deps.Text - Typography/Text component (e.g., from Ant Design)
 * @param {React.ElementType} [deps.Tag] - Optional Tag component (e.g., from Ant Design) for broker display
 * @returns {Array} Column definitions for Ant Design Table
 */

import { Tooltip } from "antd";
import { toYYMMDD } from "../../../../../common/funtions/rejex";

/**
 * Builds the request payload for portfolio API call.
 *
 * @param {Object} searchState - Form or filter state object
 * @returns {Object} Normalized request payload for backend
 */
export const buildPortfolioRequest = (searchState = {}) => {
  const startDate = searchState.startDate
    ? toYYMMDD(searchState.startDate)
    : "";

  // Plain UTC date conversion - the same-day padding workaround was
  // removed 2026-08-25 now that BE's fix (API_Changes/2026-08-24_same_day_
  // date_search_now_works.md) is confirmed live.
  const endDate = searchState.endDate ? toYYMMDD(searchState.endDate) : "";

  return {
    InstrumentName:
      searchState.mainInstrumentName || searchState.instrumentName || "",
    Quantity: searchState.quantity ? Number(searchState.quantity) : 0,
    StartDate: startDate,
    EndDate: endDate,
    BrokerIds: Array.isArray(searchState.brokerIDs)
      ? searchState.brokerIDs
      : [],
    // Real 1-indexed page number (BE_API_Changes/2026-08-24_same_day_date_
    // search_now_works.md pagination offset fix, bundled into
    // sp_searchEmployeeApprovedCompliantPortfolio_FixSameDayDateFilter.sql
    // - OFFSET (PageNumber-1)*Length) - was `|| 0`, matching the old buggy
    // backend that used PageNumber as a raw row offset.
    PageNumber: Number(searchState.pageNumber) || 1,
    Length: Number(searchState.pageSize) || 10,
  };
};
export function getEmployeePortfolioColumns({
  formatCode,
  formatApiDateTime,
  UploadIcon,
  brokerOptions = [],
  Text,
}) {
  /**
   * Resolve a row's broker info into a display string + tooltip content,
   * matching the "single name directly / Multiple Brokers + full list on
   * hover" convention used for broker/action-by columns elsewhere in the
   * app. Confirmed against a real response: each row carries `brokerList`,
   * an array of full broker objects ({brokerID, brokerName, psxCode,
   * brokerStatusID, brokerStatus}) - not the flattened `broker`/`brokers`
   * fields this used to guess at, which were never actually on the row
   * (silently always showed "—"). Display is derived purely from this
   * array's length.
   *
   * @param {Array<{brokerID, brokerName}>} [brokerList]
   * @returns {{ display: string, tooltip: string }}
   */
  const getBrokerNames = (brokerList) => {
    const list = Array.isArray(brokerList) ? brokerList : [];

    const names = list
      .map((b) => {
        if (b?.brokerName) return b.brokerName;
        // Defensive fallback if a list item is ever missing brokerName -
        // resolve by ID against the broker master list instead.
        const match = brokerOptions.find(
          (opt) => String(opt.brokerID) === String(b?.brokerID)
        );
        return match?.brokerName || match?.label || null;
      })
      .filter(Boolean);

    if (names.length === 0) return { display: "—", tooltip: "" };
    if (names.length === 1) return { display: names[0], tooltip: "" };
    return { display: "Multiple Brokers", tooltip: names.join(", ") };
  };

  return [
    {
      title: "Transaction ID",
      dataIndex: "tradeApprovalId",
      key: "tradeApprovalId",
      width: 100,

      render: (text, record) => (
        <span className="font-medium flex items-center">
          {formatCode?.(text) || "—"}
          {record?.uploadPortFolioTranaction && (
            <img
              draggable={false}
              src={UploadIcon}
              alt="Uploaded Portfolio"
              style={{ width: 16, height: 16, marginLeft: "2px" }}
            />
          )}
        </span>
      ),
    },
    {
      title: "Transaction Conducted Date & Time",
      dataIndex: "verificationConductedDate",
      key: "verificationConductedDate",
      width: 150,
      align: "center",

      render: (_, record) => {
        const rawValue = `${record?.verificationConductedDate || ""} ${
          record?.verificationConductedTime || ""
        }`.trim();
        return formatApiDateTime?.(rawValue || "—") || "—";
      },
    },
    {
      title: "Type",
      dataIndex: "tradeType",
      key: "tradeType",
      width: 50,
      align: "center",

      render: (text) => (
        <Text style={{ color: text === "Buy" ? "#00640A" : "#A50000" }}>
          {text}
        </Text>
      ),
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      width: 100,
      align: "center",

      render: (value, record) => (
        <Text
          style={{ color: record.tradeType === "Buy" ? "#00640A" : "#A50000" }}
        >
          {value?.toLocaleString?.() || "—"}
        </Text>
      ),
    },
    {
      title: "Brokers",
      dataIndex: "brokerList",
      key: "brokerList",
      width: 150,
      align: "center",

      render: (brokerList) => {
        const { display, tooltip } = getBrokerNames(brokerList);
        return (
          <div
            style={{
              whiteSpace: "normal", // ✅ allows wrapping
              wordBreak: "break-word", // ✅ breaks long words
              maxWidth: "100%", // prevents overflow
            }}
          >
            {tooltip ? (
              <Tooltip title={tooltip}>
                <span style={{ cursor: "pointer" }}>{display}</span>
              </Tooltip>
            ) : (
              display
            )}
          </div>
        );
      },
    },
    {
      title: "Verification Date & Time",
      dataIndex: "verificationConductedDate",
      key: "verificationConductedDate",
      width: 150,
      align: "center",

      render: (_, record) => {
        const rawValue = `${record?.verificationConductedDate || ""} ${
          record?.verificationConductedTime || ""
        }`.trim();
        return formatApiDateTime?.(rawValue || "—") || "—";
      },
    },
  ];
}
