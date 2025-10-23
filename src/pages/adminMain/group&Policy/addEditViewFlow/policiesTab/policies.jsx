import React, { useCallback, useEffect, useRef, useState } from "react";
import { Collapse } from "antd";
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
import AccordianArrowIcon from "../../../../../assets/img/accordian_arrow.png";

const { Panel } = Collapse;

/**
 * 🔹 Policies Component
 *
 * A component that displays policies in an accordion layout with infinite scrolling.
 * Allows users to select/deselect policies for a group with configurable thresholds.
 * Manages data synchronization with global AdminContext and handles lazy loading.
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.className - Additional CSS class names
 * @param {Object} props.activeFilters - Currently active filters for policy data
 *
 * @example
 * <Policies
 *   className="custom-class"
 *   activeFilters={{ status: 'active' }}
 * />
 */

const Policies = ({ className, activeFilters }) => {
  // 🔹 Navigation & Refs
  const navigate = useNavigate();
  const didFetchRef = useRef(false); // Prevents duplicate initial fetches
  const listRef = useRef(null); // Scroll container reference for infinite scrolling

  // 🔹 Context Hooks
  const { showNotification } = useNotification();
  const { showLoader } = useGlobalLoader();
  const { callApi } = useApi();

  // 🔹 State Management
  const [loadingMore, setLoadingMore] = useState(false); // Loading state for pagination
  const [activeKey, setActiveKey] = useState([]); // Controls which accordion panels are open

  // 🔹 Admin Context
  const {
    tabesFormDataofAdminGropusAndPolicy,
    setTabesFormDataofAdminGropusAndPolicy,
    resetAdminGroupeAndPoliciesPoliciesTabDataState,
    adminGroupeAndPoliciesPoliciesTabData,
    setAdminGroupeAndPoliciesPoliciesTabData,
  } = useMyAdmin();

  // 🔹 Search Context
  const {
    resetAdminGropusAndPolicyPoliciesTabSearch,
    adminGropusAndPolicyPoliciesTabSearch,
    setAdminGropusAndPolicyPoliciesTabSearch,
  } = useSearchBarContext();

  /**
   * 🔹 Fetches policies from API with pagination support
   *
   * @param {Object} requestData - API request parameters
   * @param {boolean} replace - If true, replaces existing data; otherwise appends
   * @returns {Promise<void>}
   */
  const fetchApiCall = useCallback(
    async (requestData, replace = false) => {
      if (!requestData || typeof requestData !== "object") return;

      // Set loading states
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
        console.log("policyCategories", policyCategories);
        if (policyCategories?.length > 0) {
          // create array of all indexes as strings: ["0", "1", "2", ...]
          const allKeys = policyCategories.map(
            (policyCategories, idx) =>
              policyCategories.policyCategoryID
                ? policyCategories.policyCategoryID.toString()
                : idx.toString() // fallback to 0,1,2,...
          );
          setActiveKey(allKeys);
        }
        // Update data based on replace flag
        if (replace) {
          setAdminGroupeAndPoliciesPoliciesTabData(policyCategories);
        } else {
          setAdminGroupeAndPoliciesPoliciesTabData((prev) => [
            ...prev,
            ...policyCategories,
          ]);
        }

        // Update pagination tracking
      } catch (err) {
        console.error("❌ Error fetching portfolio:", err);
        showNotification?.("error", "Failed to load policies");
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

  /**
   * 🔹 Initial Data Load Effect
   * Runs once on component mount to fetch initial policy data
   */
  useEffect(() => {
    if (didFetchRef.current) return;
    didFetchRef.current = true;

    const req = buildApiRequest(adminGropusAndPolicyPoliciesTabSearch);
    fetchApiCall(req, true);


  }, [fetchApiCall, resetAdminGropusAndPolicyPoliciesTabSearch]);

  useEffect(() => {
    if (adminGropusAndPolicyPoliciesTabSearch.filterTrigger) {
      const req = buildApiRequest(adminGropusAndPolicyPoliciesTabSearch);

      fetchApiCall(req, true);
      setAdminGropusAndPolicyPoliciesTabSearch((prev) => ({
        ...prev,
        filterTrigger: false,
      }));
    }
  }, [adminGropusAndPolicyPoliciesTabSearch.filterTrigger]);

  /**
   * 🔹 Handles policy selection/deselection
   * Updates the global form data when policies are selected or deselected
   *
   * @param {Object} record - The policy record being toggled
   * @param {boolean} checked - Selection state (true = selected, false = deselected)
   */
  const handleSelectChange = (record, checked) => {
    setTabesFormDataofAdminGropusAndPolicy((prev) => {
      const currentPolicies = Array.isArray(prev.policies) ? prev.policies : [];
      let updatedPolicies;

      if (checked) {
        // Add policy if it doesn't already exist
        const exists = currentPolicies?.some(
          (p) => p.policyID === record.policyID
        );
        if (!exists) {
          updatedPolicies = [
            ...currentPolicies,
            {
              policyID: record.policyID,
              threshold: record.duration || "30 days",
            },
          ];
        } else {
          updatedPolicies = currentPolicies;
        }
      } else {
        // Remove policy from selection
        updatedPolicies = currentPolicies.filter(
          (p) => p.policyID !== record.policyID
        );
      }

      return {
        ...prev,
        policies: updatedPolicies,
      };
    });
  };

  /**
   * 🔹 Handles duration threshold changes for selected policies
   *
   * @param {Object} record - The policy record being modified
   * @param {string} value - New duration value
   */
  const handleDurationChange = (record, value) => {
    // setPolicies((prev) =>
    //   prev.map((item) =>
    //     item.policyId === record.policyId
    //       ? { ...item, durationValue: value }
    //       : item
    //   )
    // );
  };

  return (
    <div
      ref={listRef}
      className={
        activeFilters
          ? `${styles.filterMAinArea} ${className || ""}`
          : `${styles.mainArea} ${className || ""}`
      }
    >
      {/* 🔹 Policy Categories Accordion */}
      {adminGroupeAndPoliciesPoliciesTabData?.length > 0 ? (
        <Collapse
          activeKey={activeKey}
          onChange={(keys) => {
            setActiveKey(keys);
            console.log("setActiveKey", keys);
          }}
          bordered={false}
          defaultActiveKey={0}
          className={styles.accordian}
          expandIcon={({ isActive }) => (
            <img
              src={AccordianArrowIcon}
              draggable={false}
              alt="expand"
              className={`${styles.icon} ${isActive ? styles.iconRotated : ""}`}
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
                  {/* 🔹 Policy Table within Accordion */}
                  <div className={styles.innerTableArea}>
                    <BorderlessTable
                      rows={policyCategories?.policies || []}
                      columns={policyColumns({
                        onSelectChange: handleSelectChange,
                        onDurationChange: handleDurationChange,
                        selectedPolicies:
                          tabesFormDataofAdminGropusAndPolicy?.policies
                            ? tabesFormDataofAdminGropusAndPolicy?.policies
                            : [],
                      })}
                      pagination={false}
                      rowKey="transactionId"
                      classNameTable="border-less-table-white-2"
                      scroll={{ y: 400 }} // Internal table scroll
                      style={{ width: "100%" }}
                    />
                  </div>
                </Panel>
              );
            }
          )}
        </Collapse>
      ) : (
        // 🔹 Empty State
        <EmptyState type="portfolio" />
      )}

      {/* 🔹 Loading Indicator for Infinite Scroll */}
      {loadingMore && (
        <div style={{ textAlign: "center", padding: "10px" }}>
          Loading more...
        </div>
      )}
    </div>
  );
};

export default Policies;
