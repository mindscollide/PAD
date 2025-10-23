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
import AccordianArrowIcon from "../../../../../assets/img/accordian_arrow.png";

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

        const policyCategories = Array.isArray(res?.policyCategories)
          ? res.policyCategories
          : [];
        //   const mapped = mappedDataList(policyCategories);
        console.log("policyCategories", res);
        if (replace) {
          setAdminGroupeAndPoliciesPoliciesTabData(policyCategories);
        } else {
          setAdminGroupeAndPoliciesPoliciesTabData((prev) => [
            ...prev,
            ...policyCategories,
          ]);
        }

        // ✅ Save totalRecords from API
        const total = Number(res?.totalRecords || 0);

        // ✅ Disable scrolling if we've loaded everything
        setHasMore(requestData.PageNumber + policyCategories.length < total);
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
    // 2️⃣ Update tabesFormDataofAdminGropusAndPolicy.policies
    setTabesFormDataofAdminGropusAndPolicy((prev) => {
      const currentPolicies = Array.isArray(prev.policies) ? prev.policies : [];

      let updatedPolicies;

      if (checked) {
        // Add new policy (avoid duplicates)
        const exists = currentPolicies.some(
          (p) => p.policyID === record.policyId
        );
        if (!exists) {
          updatedPolicies = [
            ...currentPolicies,
            {
              policyID: record.policyId,
              threshold: record.duration || "30 days",
            },
          ];
        } else {
          updatedPolicies = currentPolicies;
        }
      } else {
        // Remove unchecked policy
        updatedPolicies = currentPolicies.filter(
          (p) => p.policyID !== record.policyId
        );
      }

      return {
        ...prev,
        policies: updatedPolicies,
      };
    });
  };

  console.log("groupPolicies", tabesFormDataofAdminGropusAndPolicy);

  const handleDurationChange = (record, value) => {
    setPolicies((prev) =>
      prev.map((item) =>
        item.policyId === record.policyId
          ? { ...item, durationValue: value }
          : item
      )
    );
  };
  // ✅ Scroll handler for pagination
  const handleScroll = () => {
    if (!listRef.current || loadingMore || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = listRef.current;

    if (scrollTop + clientHeight >= scrollHeight - 10) {
      // ⬆️ Stop if we’ve reached totalRecords
      if (!hasMore) return;
      // ⬆️ User scrolled to bottom → call API with pageNumber + 10
      const nextPage =
        (adminGropusAndPolicyPoliciesTabSearch.pageNumber || 0) + 10;

      const req = buildApiRequest({
        ...adminGropusAndPolicyPoliciesTabSearch,
        pageNumber: nextPage,
      });

      fetchApiCall(req, false);

      setAdminGropusAndPolicyPoliciesTabSearch((prev) => ({
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
  return (
    <div
      ref={listRef}
      s
      style={{
        maxHeight: "420px",
        overflowY: "overlay",
        overflowX: "hidden",
      }}
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
            // marginBottom: "-20px",
          }}
          expandIcon={({ isActive }) => (
            <img
              src={AccordianArrowIcon} // 👈 your image paths
              draggable={false}
              alt="expand"
              style={{
                width: 18,
                height: 12,
                transition: "transform 0.3s",
                transform: `rotate(${isActive ? 180 : 0}deg)`, // 👈 rotate smoothly
              }}
            />
          )}
          expandIconPosition="end"
        >
          {adminGroupeAndPoliciesPoliciesTabData.map(
            (policyCategories, idx) => {
              const panelKey =
                policyCategories.policyCategoryID || idx.toString();
              return (
                <Panel
                  className={styles.Panel}
                  headerClass={styles.customHeader}
                  header={
                    <div className={styles.panelHeader}>
                      <span className={styles.shortName}>
                        {policyCategories.categoryName}
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
                      paddingRight: "0px",
                    }}
                  >
                    <BorderlessTable
                      rows={policyCategories?.policies || []}
                      columns={policyColumns({
                        onSelectChange: handleSelectChange,
                        onDurationChange: handleDurationChange,
                        selectedPolicies:
                          tabesFormDataofAdminGropusAndPolicy.policies,
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
            }
          )}
        </Collapse>
      ) : (
        <EmptyState type="portfolio" />
      )}

      {loadingMore && (
        <div style={{ textAlign: "center", padding: "10px" }}>
          Loading more...
        </div>
      )}
    </div>
  );
};

export default Policies;
