import React, { useCallback, useEffect, useRef, useState } from "react";
import { Row, Col, Checkbox, Divider } from "antd";
import styles from "./policies.module.css";
import { useMyAdmin } from "../../../../../context/AdminContext";
import { useNotification } from "../../../../../components/NotificationProvider/NotificationProvider";
import { useGlobalLoader } from "../../../../../context/LoaderContext";
import { useApi } from "../../../../../context/ApiContext";
import { useNavigate } from "react-router-dom";
import { SearchPoliciesForGroupPolicyPanel } from "../../../../../api/adminApi";
import { useSearchBarContext } from "../../../../../context/SearchBarContaxt";
import { buildApiRequest } from "./utils";
import EmptyState from "../../../../../components/emptyStates/empty-states";

/**
 * 🔹 Policies Component
 * Allows selecting or deselecting policies for a group.
 * Data syncs directly with the global AdminContext.
 */

const Policies = () => {
  const navigate = useNavigate();
  const didFetchRef = useRef(false);
  const listRef = useRef(null); // ✅ scroll container ref
  const { showNotification } = useNotification();
  const { showLoader } = useGlobalLoader();
  const { callApi } = useApi();
  const [loadingMore, setLoadingMore] = useState(false);

  const {
    tabesFormDataofAdminGropusAndPolicy,
    setTabesFormDataofAdminGropusAndPolicy,
    resetAdminGroupeAndPoliciesPoliciesTabDataState,
    adminGroupeAndPoliciesPoliciesTabData,
    setAdminGroupeAndPoliciesPoliciesTabData,
  } = useMyAdmin();
  const {
    resetAdminGropusAndPolicyPoliciesTabSearch,
    adminGropusAndPolicyPoliciesTabSearch,
    setAdminGropusAndPolicyPoliciesTabSearch,
  } = useSearchBarContext();

  /** 🔹 Fetch approvals from API */
  const fetchApiCall = useCallback(
    async (requestData, replace = false, showLoaderFlag = true) => {
      if (!requestData || typeof requestData !== "object") return;
      if (showLoaderFlag) showLoader(true);

      const res = await SearchPoliciesForGroupPolicyPanel({
        callApi,
        showNotification,
        showLoader,
        requestdata: requestData,
        navigate,
      });
      const groupPolicies = Array.isArray(res?.groupPolicies)
        ? res.groupPolicies
        : [];
      //   const mapped = mappedDataList(groupPolicies);
      const mapped = groupPolicies;

      setAdminGroupeAndPoliciesPoliciesTabData((prev) => ({
        groupPolicies: replace
          ? mapped
          : [...(prev?.groupPolicies || []), ...mapped],
        // this is for to run lazy loading its data comming from database of total data in db
        totalRecordsDataBase: res?.totalRecords || 0,
        // this is for to know how mush dta currently fetch from  db
        totalRecordsTable: replace
          ? mapped.length
          : adminGroupeAndPoliciesPoliciesTabData.totalRecordsTable +
            mapped.length,
      }));

      setAdminGropusAndPolicyPoliciesTabSearch((prev) => {
        const next = {
          ...prev,
          pageNumber: replace ? mapped.length : prev.pageNumber + mapped.length,
        };

        // this is for check if filter value get true only on that it will false
        if (prev.filterTrigger) {
          next.filterTrigger = false;
        }

        return next;
      });
    },
    [
      callApi,
      navigate,
      showLoader,
      showNotification,
      setAdminGropusAndPolicyPoliciesTabSearch,
      setAdminGroupeAndPoliciesPoliciesTabData,
    ]
  );

  // ✅ initial load
  useEffect(() => {
    if (didFetchRef.current) return;
    didFetchRef.current = true;

    const req = buildApiRequest(adminGropusAndPolicyPoliciesTabSearch);

    fetchApiCall(req, true);

    try {
      const nav = performance.getEntriesByType("navigation");
      if (nav?.[0]?.type === "reload")
        resetAdminGropusAndPolicyPoliciesTabSearch();
    } catch (err) {
      console.error("❌ Error detecting reload:", err);
    }
  }, [fetchApiCall, resetAdminGropusAndPolicyPoliciesTabSearch]);

  return (
    <div
      ref={listRef}
      style={{ height: "80vh", overflowY: "auto" }} // ✅ scroll container
    >
      {tabesFormDataofAdminGropusAndPolicy?.groupPolicies?.length > 0 ? (
        {
          /* <Collapse
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
        </Collapse> */
        }
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

export default Policies;
