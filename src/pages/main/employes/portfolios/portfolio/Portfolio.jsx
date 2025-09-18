// src/pages/employee/portfolio/Portfolio.jsx

import React, { useEffect, useState, useCallback, useRef } from "react";
import { Collapse, Typography, Tooltip } from "antd";
import { CaretDownOutlined, CaretUpOutlined } from "@ant-design/icons";
import moment from "moment";
import styles from "../styles.module.css";

// Components
import { BorderlessTable } from "../../../../../components";
import EmptyState from "../../../../../components/emptyStates/empty-states";

// Contexts
import { useSearchBarContext } from "../../../../../context/SearchBarContaxt";
import { useApi } from "../../../../../context/ApiContext";
import { useGlobalLoader } from "../../../../../context/LoaderContext";
import { usePortfolioContext } from "../../../../../context/portfolioContax";
import { useNotification } from "../../../../../components/NotificationProvider/NotificationProvider";
import { useDashboardContext } from "../../../../../context/dashboardContaxt";

// API
import { SearchEmployeeApprovedUploadedPortFolio } from "../../../../../api/protFolioApi";

// Utils
import {
  formatApiDateTime,
  formatCode,
} from "../../../../../commen/funtions/rejex";
import UploadIcon from "../../../../../assets/img/upload-icon.png";
import { getEmployeePortfolioColumns } from "./utils";
import { formatBrokerOptions } from "../pendingApprovals/utill";

const { Panel } = Collapse;
const { Text } = Typography;

/**
 * Portfolio Component
 *
 * Renders the employee’s approved uploaded portfolio.
 * Each instrument expands into a collapsible panel showing its transactions in a table.
 *
 * ✅ Features:
 * - Fetches portfolio data from API
 * - Collapsible panels per instrument
 * - Conditional formatting (Buy/Sell colors, uploaded icon)
 * - Supports reload handling and search state sync
 * - Gracefully handles empty state
 *
 * @component
 * @param {Object} props
 * @param {string} [props.className] - Optional custom className for wrapper.
 * @returns {JSX.Element} Portfolio component with collapsible instrument panels.
 */
const Portfolio = ({ className }) => {
  /** Tracks open/closed collapse panels */
  const [activeKey, setActiveKey] = useState([]);

  /** Local state for instruments list */
  const [instrumentData, setInstrumentData] = useState([]);

  /** Prevents multiple first-load API calls */
  const didFetchRef = useRef(false);

  // ✅ Contexts
  const {
    resetEmployeePortfolioSearch,
    setEmployeePortfolioSearch,
    employeePortfolioSearch,
  } = useSearchBarContext();
  const { callApi } = useApi();
  const { showLoader } = useGlobalLoader();
  const { showNotification } = useNotification();
  const {
    employeePortfolioData,
    setEmployeePortfolioData,
    setAggregateTotalQuantity,
  } = usePortfolioContext();
  const { employeeBasedBrokersData } = useDashboardContext();

  /**
   * Builds request payload for portfolio API from search state.
   *
   * @param {Object} [searchState={}] - Current search/filter state
   * @returns {Object} API request payload
   */
  const buildPortfolioRequest = (searchState = {}) => ({
    InstrumentName:
      searchState.mainInstrumentName || searchState.instrumentName || "",
    Quantity: searchState.quantity ? Number(searchState.quantity) : 0,
    StartDate: searchState.startDate
      ? moment(searchState.startDate).format("YYYYMMDD")
      : "",
    EndDate: searchState.endDate
      ? moment(searchState.endDate).format("YYYYMMDD")
      : "",
    BrokerIds: Array.isArray(searchState.broker) ? searchState.broker : [],
    PageNumber: Number(searchState.pageNumber) || 0,
    Length: Number(searchState.pageSize) || 10,
  });

  /** Broker dropdown options */
  const brokerOptions = formatBrokerOptions(employeeBasedBrokersData || []);

  /** Table column definitions for transactions */
  const columns = getEmployeePortfolioColumns({
    formatCode,
    formatApiDateTime,
    UploadIcon,
    brokerOptions,
    Text,
  });

  /**
   * Fetches portfolio data from API.
   *
   * @async
   * @param {Object} requestData - API request payload
   * @param {boolean} [replace=false] - Replace or append existing state
   */
  const fetchPortfolio = useCallback(
    async (requestData, replace = false) => {
      if (!requestData || typeof requestData !== "object") return;

      showLoader(true);
      try {
        const res = await SearchEmployeeApprovedUploadedPortFolio({
          callApi,
          showNotification,
          showLoader,
          requestdata: requestData,
        });

        const instruments = Array.isArray(res?.instruments)
          ? res.instruments
          : [];

        setEmployeePortfolioData({
          data: instruments,
          totalRecords: res?.totalRecords ?? instruments.length,
          Apicall: true,
          replace,
        });

        setAggregateTotalQuantity(res?.aggregateTotalQuantity);
      } catch (err) {
        console.error("❌ Error fetching portfolio:", err);
      } finally {
        showLoader(false);
      }
    },
    [callApi, showNotification, showLoader, setEmployeePortfolioData]
  );

  /**
   * Sync context → local state when API updates data.
   */
  useEffect(() => {
    if (!employeePortfolioData?.Apicall) return;

    setInstrumentData(employeePortfolioData.data || []);

    setEmployeePortfolioSearch((prev) => ({
      ...prev,
      totalRecords: employeePortfolioData.totalRecords,
      pageNumber: employeePortfolioData.replace ? 10 : prev.pageNumber,
    }));

    setEmployeePortfolioData((prev) => ({ ...prev, Apicall: false }));
  }, [employeePortfolioData?.Apicall]);

  /**
   * Initial load:
   * - Fetches first page of portfolio
   * - Resets search state on page reload
   */
  useEffect(() => {
    if (didFetchRef.current) return;
    didFetchRef.current = true;

    const req = buildPortfolioRequest({ PageNumber: 0, Length: 10 });
    fetchPortfolio(req, true);

    try {
      const nav = performance.getEntriesByType("navigation");
      if (nav?.[0]?.type === "reload") resetEmployeePortfolioSearch();
    } catch (err) {
      console.error("❌ Error detecting reload:", err);
    }
  }, [fetchPortfolio, resetEmployeePortfolioSearch]);

  /**
   * Run search whenever filterTrigger flips true
   */
  useEffect(() => {
    if (employeePortfolioSearch.filterTrigger) {
      const req = buildPortfolioRequest(employeePortfolioSearch);
      fetchPortfolio(req, true);

      // Reset trigger
      setEmployeePortfolioSearch((prev) => ({
        ...prev,
        filterTrigger: false,
      }));
    }
  }, [
    employeePortfolioSearch.filterTrigger,
    fetchPortfolio,
    setEmployeePortfolioSearch,
  ]);

  /**
   * Custom collapse icon toggle
   */
  const toggleIcon = (panelKey) =>
    activeKey.includes(panelKey) ? <CaretUpOutlined /> : <CaretDownOutlined />;

  return (
    <>
      {instrumentData.length > 0 ? (
        <Collapse
          activeKey={activeKey}
          onChange={(keys) => setActiveKey(keys)}
          bordered={false}
          className={className || ""}
          style={{ background: "#fff", border: "none" }}
          expandIcon={({ isActive }) => (
            <CaretDownOutlined
              style={{ fontSize: "14px", transition: "transform 0.3s" }}
              rotate={isActive ? 180 : 0} // 🔄 rotate when active
            />
          )}
          expandIconPosition="end"  
        >
          {instrumentData.map((instrument, idx) => {
            const panelKey = instrument.instrumentId || idx.toString();
            const isPositive = instrument.totalQuantity >= 0;

            return (
              <Panel
                className={styles.Panel}
                header={
                  <div className={styles.panelHeader}>
                    <Tooltip title={instrument.instrumentShortCode}>
                      <span className={styles.shortName}>
                        {instrument.instrumentShortCode}
                      </span>
                    </Tooltip>
                    <Tooltip title={instrument.instrumentName}>
                      <span className={`${styles.longName} ${styles.textWrap}`}>
                        {instrument.instrumentName}
                      </span>
                    </Tooltip>
                    <span
                      className={styles.quantity}
                      style={{ color: isPositive ? "#00640A" : "#A50000" }}
                    >
                      {instrument.totalQuantity?.toLocaleString()}
                    </span>
                    {/* <span className={styles.icon}>{toggleIcon(panelKey)}</span> */}
                  </div>
                }
                key={panelKey}
                // showArrow={false}
              >
                <BorderlessTable
                  rows={instrument.transactions || []}
                  columns={columns}
                  pagination={false}
                  rowKey="transactionId"
                  classNameTable="border-less-table-white"
                  scroll={{ x: "max-content", y: 450 }} // ✅ horizontal scroll only when needed
                />
              </Panel>
            );
          })}
        </Collapse>
      ) : (
        <EmptyState type="portfolio" />
      )}
    </>
  );
};

export default Portfolio;
