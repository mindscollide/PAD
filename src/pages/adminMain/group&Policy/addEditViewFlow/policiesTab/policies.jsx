import React, { useCallback, useEffect, useRef, useState } from "react";
import { Row, Col, Checkbox, Divider, Collapse } from "antd";
import styles from "./policies.module.css";
import { useMyAdmin } from "../../../../../context/AdminContext";
import { useNotification } from "../../../../../components/NotificationProvider/NotificationProvider";
import { useGlobalLoader } from "../../../../../context/LoaderContext";
import { useApi } from "../../../../../context/ApiContext";
import { useNavigate } from "react-router-dom";
import { SearchPoliciesForGroupPolicyPanel } from "../../../../../api/adminApi";
import { useSearchBarContext } from "../../../../../context/SearchBarContaxt";
import { buildApiRequest, policyColumns } from "./utils";
import EmptyState from "../../../../../components/emptyStates/empty-states";
import { BorderlessTable } from "../../../../../components";
import { CaretDownOutlined } from "@ant-design/icons";

/**
 * 🔹 Policies Component
 * Allows selecting or deselecting policies for a group.
 * Data syncs directly with the global AdminContext.
 */

const Policies = ({ className, activeFilters }) => {
  const { Panel } = Collapse;
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

  // /** 🔹 Fetch approvals from API */
  // const fetchApiCall = useCallback(
  //   async (requestData, replace = false, showLoaderFlag = true) => {
  //     if (!requestData || typeof requestData !== "object") return;
  //     if (showLoaderFlag) showLoader(true);

  //     const res = await SearchPoliciesForGroupPolicyPanel({
  //       callApi,
  //       showNotification,
  //       showLoader,
  //       requestdata: requestData,
  //       navigate,
  //     });
  //     const groupPolicies = Array.isArray(res?.groupPolicies)
  //       ? res.groupPolicies
  //       : [];
  //     //   const mapped = mappedDataList(groupPolicies);
  //     const mapped = groupPolicies;

  //     setAdminGroupeAndPoliciesPoliciesTabData((prev) => ({
  //       groupPolicies: replace
  //         ? mapped
  //         : [...(prev?.groupPolicies || []), ...mapped],
  //       // this is for to run lazy loading its data comming from database of total data in db
  //       totalRecordsDataBase: res?.totalRecords || 0,
  //       // this is for to know how mush dta currently fetch from  db
  //       totalRecordsTable: replace
  //         ? mapped.length
  //         : adminGroupeAndPoliciesPoliciesTabData.totalRecordsTable +
  //           mapped.length,
  //     }));

  //     setAdminGropusAndPolicyPoliciesTabSearch((prev) => {
  //       const next = {
  //         ...prev,
  //         pageNumber: replace ? mapped.length : prev.pageNumber + mapped.length,
  //       };

  //       // this is for check if filter value get true only on that it will false
  //       if (prev.filterTrigger) {
  //         next.filterTrigger = false;
  //       }

  //       return next;
  //     });
  //   },
  //   [
  //     callApi,
  //     navigate,
  //     showLoader,
  //     showNotification,
  //     setAdminGropusAndPolicyPoliciesTabSearch,
  //     setAdminGroupeAndPoliciesPoliciesTabData,
  //   ]
  // );
  const [hasMore, setHasMore] = useState(true); // ✅ track if more data exists
  const [aggregateTotalQuantity, setAggregateTotalQuantity] = useState(0);
  const [activeKey, setActiveKey] = useState([]);

  const fetchApiCall = useCallback(
    async (requestData, replace = false) => {
      if (!requestData || typeof requestData !== "object") return;

      if (!replace) setLoadingMore(true);
      else showLoader(true);

      try {
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
        console.log("groupPolicies", res);
        if (replace) {
          setAdminGroupeAndPoliciesPoliciesTabData(groupPolicies);
        } else {
          setAdminGroupeAndPoliciesPoliciesTabData((prev) => [
            ...prev,
            ...groupPolicies,
          ]);
        }

        // ✅ Save totalRecords from API
        const total = Number(res?.totalRecords || 0);

        // ✅ Disable scrolling if we've loaded everything
        setHasMore(requestData.PageNumber + groupPolicies.length < total);
        setAggregateTotalQuantity(res?.aggregateTotalQuantity);
      } catch (err) {
        console.error("❌ Error fetching portfolio:", err);
      } finally {
        showLoader(false);
        setLoadingMore(false);
      }
    },
    [
      callApi,
      showNotification,
      showLoader,
      navigate,
      setAdminGroupeAndPoliciesPoliciesTabData,
    ]
  );
  console.log("groupPolicies", adminGroupeAndPoliciesPoliciesTabData);

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
  const [policies, setPolicies] = useState([]);

  const handleSelectChange = (record, checked) => {
    setPolicies((prev) =>
      prev.map((item) =>
        item.policyId === record.policyId
          ? { ...item, isSelected: checked }
          : item
      )
    );
  };

  const handleDurationChange = (record, value) => {
    setPolicies((prev) =>
      prev.map((item) =>
        item.policyId === record.policyId
          ? { ...item, durationValue: value }
          : item
      )
    );
  };
  return (
    <div
      ref={listRef}
      style={{ height: "80vh", overflowY: "auto" }} // ✅ scroll container
    >
      {adminGroupeAndPoliciesPoliciesTabData?.length > 0 ? (
        <Collapse
          activeKey={activeKey}
          onChange={(keys) => setActiveKey(keys)}
          bordered={false}
          className={styles.accordian || ""}
          style={{
            background: "#fff",
            border: "none",
            height: "100%",
            overflow: "hidden",
          }}
          expandIcon={({ isActive }) => (
            <CaretDownOutlined
              style={{ fontSize: "14px", transition: "transform 0.3s" }}
              rotate={isActive ? 180 : 0}
            />
          )}
          expandIconPosition="end"
        >
          {adminGroupeAndPoliciesPoliciesTabData.map((groupPolicies, idx) => {
            const panelKey = groupPolicies.groupPolicyID || idx.toString();
            return (
              <Panel
                className={styles.Panel}
                header={
                  <div className={styles.panelHeader}>
                    <span className={styles.shortName}>
                      {groupPolicies.groupPolicyName}
                    </span>
                  </div>
                }
                key={panelKey}
              >
                {/* ✅ FIXED HEIGHT SCROLL CONTAINER */}
                <div
                  style={{
                    maxHeight: "420px",
                    overflowY: "auto",
                    overflowX: "hidden", // or 'auto' if you want x-scroll too
                    paddingRight: "8px",
                  }}
                >
                  <BorderlessTable
                    rows={groupPolicies?.policies || []}
                    columns={policyColumns({
                      onSelectChange: handleSelectChange,
                      onDurationChange: handleDurationChange,
                    })}
                    pagination={false}
                    rowKey="transactionId"
                    classNameTable="border-less-table-white-2"
                    scroll={{ y: 400 }} // ✅ internal scroll, not page scroll
                    style={{ width: "100%" }}
                  />
                </div>
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

export default Policies;
