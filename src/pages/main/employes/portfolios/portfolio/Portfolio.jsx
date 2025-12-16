import React, { useEffect, useState, useCallback, useRef } from "react";
import { Collapse, Typography, Tooltip } from "antd";
import { CaretDownOutlined, CaretUpOutlined } from "@ant-design/icons";
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
  toYYMMDD,
} from "../../../../../common/funtions/rejex";
import UploadIcon from "../../../../../assets/img/upload-icon.png";
import { buildPortfolioRequest, getEmployeePortfolioColumns } from "./utils";
import { formatBrokerOptions } from "../pendingApprovals/utill";
import { useNavigate } from "react-router-dom";

const { Panel } = Collapse;
const { Text } = Typography;

const Portfolio = ({ className, activeFilters }) => {
  const [activeKey, setActiveKey] = useState([]);
  const [hasMore, setHasMore] = useState(true); // ✅ track if more data exists
  const [loadingMore, setLoadingMore] = useState(false);

  const didFetchRef = useRef(false);
  const listRef = useRef(null); // ✅ scroll container ref

  const navigate = useNavigate();
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

  const brokerOptions = formatBrokerOptions(employeeBasedBrokersData || []);

  const columns = getEmployeePortfolioColumns({
    formatCode,
    formatApiDateTime,
    UploadIcon,
    brokerOptions,
    Text,
  });


  const fetchPortfolio = useCallback(
    async (requestData, replace = false) => {
      if (!requestData || typeof requestData !== "object") return;

      if (!replace) setLoadingMore(true);
      else showLoader(true);

      try {
        const res = await SearchEmployeeApprovedUploadedPortFolio({
          callApi,
          showNotification,
          showLoader,
          requestdata: requestData,
          navigate,
        });

        const instruments = Array.isArray(res?.instruments)
          ? res.instruments
          : [];
        if (replace) {
          setEmployeePortfolioData(instruments);
        } else {
          setEmployeePortfolioData((prev) => [...prev, ...instruments]);
        }

        // ✅ Save totalRecords from API
        const total = Number(res?.totalRecords || 0);

        // ✅ Disable scrolling if we've loaded everything
        setHasMore(requestData.PageNumber + instruments.length < total);
        setAggregateTotalQuantity(res?.aggregateTotalQuantity);
      } catch (err) {
        console.error("❌ Error fetching portfolio:", err);
      } finally {
        showLoader(false);
        setLoadingMore(false);
      }
    },
    [callApi, showNotification, showLoader, navigate, setAggregateTotalQuantity]
  );

  // ✅ initial load
  useEffect(() => {
    if (didFetchRef.current) return;
    didFetchRef.current = true;

    const req = buildPortfolioRequest(employeePortfolioSearch);

    fetchPortfolio(req, true);

    try {
      const nav = performance.getEntriesByType("navigation");
      if (nav?.[0]?.type === "reload") resetEmployeePortfolioSearch();
    } catch (err) {
      console.error("❌ Error detecting reload:", err);
    }
  }, [fetchPortfolio, resetEmployeePortfolioSearch]);

  // ✅ Scroll handler for pagination
  const handleScroll = () => {
    if (!listRef.current || loadingMore || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = listRef.current;

    if (scrollTop + clientHeight >= scrollHeight - 10) {
      // ⬆️ Stop if we’ve reached totalRecords
      if (!hasMore) return;
      // ⬆️ User scrolled to bottom → call API with pageNumber + 10
      const nextPage = (employeePortfolioSearch.pageNumber || 0) + 10;

      const req = buildPortfolioRequest({
        ...employeePortfolioSearch,
        pageNumber: nextPage,
      });

      fetchPortfolio(req, false);

      setEmployeePortfolioSearch((prev) => ({
        ...prev,
        pageNumber: nextPage,
      }));
    }
  };

  useEffect(() => {
    const node = listRef.current;
    if (!node) return;
    node.addEventListener("scroll", handleScroll);
    return () => node.removeEventListener("scroll", handleScroll);
  });

  useEffect(() => {
    if (employeePortfolioSearch.filterTrigger) {
      const req = buildPortfolioRequest(employeePortfolioSearch);

      fetchPortfolio(req, true);
      setEmployeePortfolioSearch((prev) => ({
        ...prev,
        filterTrigger: false,
      }));
    }
  }, [employeePortfolioSearch.filterTrigger]);

  return (
    <div
      ref={listRef}
      style={{
        height: employeePortfolioData.length > 0 ? "540px" : "80vh",
        overflowY: "auto",
      }} // ✅ scroll container
    >
      {employeePortfolioData.length > 0 ? (
        <Collapse
          activeKey={activeKey}
          onChange={(keys) => setActiveKey(keys)}
          bordered={false}
          className={className || ""}
          style={{ background: "#fff", border: "none" }}
          expandIcon={({ isActive }) => (
            <CaretDownOutlined
              style={{ fontSize: "14px", transition: "transform 0.3s" }}
              rotate={isActive ? 180 : 0}
            />
          )}
          expandIconPosition="end"
        >
          {employeePortfolioData.map((instrument, idx) => {
            const panelKey = instrument.instrumentId || idx.toString();
            const isPositive = instrument.totalQuantity >= 0;

            return (
              <Panel
                className={styles.Panel}
                header={
                  <div className={styles.panelHeader}>
                    <Tooltip
                      title={`${instrument.instrumentName} - ${instrument.instrumentShortCode} `}
                    >
                      <span className={styles.shortName}>
                        {instrument.instrumentShortCode}
                      </span>
                    </Tooltip>
                    {/* <Tooltip title={instrument.instrumentName}> */}
                      <span className={`${styles.longName} ${styles.textWrap}`}>
                        {instrument.instrumentName}
                      </span>
                    {/* </Tooltip> */}
                    <span
                      className={styles.quantity}
                      style={{ color: isPositive ? "#00640A" : "#A50000" }}
                    >
                      {instrument.totalQuantity?.toLocaleString()}
                    </span>
                  </div>
                }
                key={panelKey}
              >
                <BorderlessTable
                  rows={instrument?.transactions || []}
                  columns={columns}
                  pagination={false}
                  rowKey="transactionId"
                  classNameTable="border-less-table-white"
                  scroll={{ x: "max-content", y: 450 }}
                />
              </Panel>
            );
          })}
        </Collapse>
      ) : (
        <EmptyState type="portfolio" />
      )}

      {loadingMore && (
        <div style={{ textAlign: "center", padding: "10px" }}>
          Loading more...
        </div>
      )}
      {/* {!hasMore && (
        <div style={{ textAlign: "center", padding: "10px" }}>
          ✅ All records loaded
        </div>
      )} */}
    </div>
  );
};

export default Portfolio;
