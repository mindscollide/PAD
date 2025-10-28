// src/pages/complianceOfficer/approval/Approval.jsx

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Col, Row } from "antd";
import { useNavigate } from "react-router-dom";

// 🔹 Components

// 🔹 Contexts
import { useGlobalLoader } from "../../../context/LoaderContext";
import { useApi } from "../../../context/ApiContext";
import { useGlobalModal } from "../../../context/GlobalModalContext";
import { useDashboardContext } from "../../../context/dashboardContaxt";

// 🔹 Styles
import style from "./groups_and_policy.module.css";
import { BorderlessTable, Button, PageLayout } from "../../../components";
import { useMyAdmin } from "../../../context/AdminContext";
import { useSearchBarContext } from "../../../context/SearchBarContaxt";
import { buildApiRequest, getGroupPolicyColumns } from "./utils";
import { useNotification } from "../../../components/NotificationProvider/NotificationProvider";
import { useTableScrollBottom } from "../../../common/funtions/scroll";
import GroupAndPolicyAddViewEdit from "./addEditViewFlow";
import { SearchGroupPoliciesList } from "../../../api/adminApi";

const GroupsAndPolicy = () => {
  const navigate = useNavigate();
  const hasFetched = useRef(false);
  const tableScrollAdminGroupsAndPolicyList = useRef(null);

  // ----------------- Contexts -----------------
  const { showNotification } = useNotification();
  const { showLoader } = useGlobalLoader();
  const { callApi } = useApi();
  const {
    adminGropusAndPolicyData,
    setAdminGropusAndPolicyData,
    adminGropusAndPolicyMqtt,
    setAdminGropusAndPolicyMqtt,
    resetAdminGropusAndPolicyListContextState,
    resetAdminGropusAndPolicyContextState,
    setOpenNewFormForAdminGropusAndPolicy,
    openNewFormForAdminGropusAndPolicy,
    setPageTypeForAdminGropusAndPolicy,
    pageTypeForAdminGropusAndPolicy,
    setPageTabeForAdminGropusAndPolicy,
    pageTabesForAdminGropusAndPolicy,
  } = useMyAdmin();

  const {
    adminGropusAndPolicySearch,
    setAdminGropusAndPolicySearch,
    resetAdminGropusAndPolicySearch,
  } = useSearchBarContext();

  // ----------------- Local State -----------------
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPolicyID, setCurrentPolicyID] = useState(null);

  // ----------------- Helpers -----------------

  /** 🔹 Fetch approvals from API */
  const fetchApiCall = useCallback(
    async (requestData, replace = false, showLoaderFlag = true) => {
      if (!requestData || typeof requestData !== "object") return;
      if (showLoaderFlag) showLoader(true);

      const res = await SearchGroupPoliciesList({
        callApi,
        showNotification,
        showLoader,
        requestdata: requestData,
        navigate,
      });

      const groupPolicies = Array.isArray(res?.groupPolicies)
        ? res.groupPolicies
        : [];
      setAdminGropusAndPolicyData((prev) => ({
        groupsAndPolicy: replace
          ? groupPolicies
          : [...(prev?.groupsAndPolicy || []), ...groupPolicies],
        // this is for to run lazy loading its data comming from database of total data in db
        // totalRecordsDataBase: res?.totalRecords || 0,
        totalRecordsDataBase: 0,

        // this is for to know how mush dta currently fetch from  db
        totalRecordsTable: replace
          ? groupPolicies.length
          : adminGropusAndPolicyData.totalRecordsTable + groupPolicies.length,
      }));

      setAdminGropusAndPolicySearch((prev) => {
        const next = {
          ...prev,
          pageNumber: replace
            ? groupPolicies.length
            : prev.pageNumber + groupPolicies.length,
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
      setAdminGropusAndPolicyData,
      showLoader,
      showNotification,
    ]
  );

  /** 🔹 Handle "View Details" modal */
  const handleOpenCreateGroup = () => {
    // Step 1 & 2 — reset values
    setPageTypeForAdminGropusAndPolicy(0);
    setPageTabeForAdminGropusAndPolicy(0);

    // Step 3 — open the new form
    setOpenNewFormForAdminGropusAndPolicy(true);
  };

  /** 🔹 Handle "Edit Details" modal */
  const handleOpenEditGroup = async (record) => {
    console.log("handleOpenEditGroup", record);
    await setCurrentPolicyID(record.groupPolicyID);
    // // Step 1 & 2 — reset values
    await setPageTypeForAdminGropusAndPolicy(1);
    await setPageTabeForAdminGropusAndPolicy(0);

    // // Step 3 — open the new form
    await setOpenNewFormForAdminGropusAndPolicy(true);
  };

  /** 🔹 Handle "View Details" modal */
  const handleViewDetails = async (record) => {
    console.log("handleViewDetails", record);
    setCurrentPolicyID(record.groupPolicyID);
    // Step 1 & 2 — reset values
    setPageTypeForAdminGropusAndPolicy(3);
    setPageTabeForAdminGropusAndPolicy(0);

    // Step 3 — open the new form
    setOpenNewFormForAdminGropusAndPolicy(true);
  };

  const columns = getGroupPolicyColumns({
    onViewDetails: (record) => handleViewDetails(record),
    onEdit: (record) => handleOpenEditGroup(record),
  });

  /** 🔹 Handle removing individual filter */
  const handleRemoveFilter = (key) => {
    const resetMap = {
      policyName: { policyName: "" },
    };

    setAdminGropusAndPolicySearch((prev) => ({
      ...prev,
      ...resetMap[key],
      pageNumber: 0,
      filterTrigger: true,
    }));
  };

  /** 🔹 Build Active Filters */
  const activeFilters = (() => {
    const { policyName } = adminGropusAndPolicySearch || {};

    return [
      policyName && {
        key: "policyName",
        value:
          policyName.length > 13 ? policyName.slice(0, 13) + "..." : policyName,
      },
    ].filter(Boolean);
  })();

  // ----------------- Effects -----------------

  // Initial Fetch
  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      const requestData = buildApiRequest(adminGropusAndPolicySearch);

      fetchApiCall(requestData, true, true);
    }
  }, [buildApiRequest, adminGropusAndPolicySearch, fetchApiCall]);

  // Reset on Unmount
  useEffect(() => {
    return () => {
      resetAdminGropusAndPolicySearch();
      resetAdminGropusAndPolicyListContextState();
    };
  }, []);

  // Fetch on Filter Trigger
  useEffect(() => {
    if (adminGropusAndPolicySearch.filterTrigger) {
      const requestData = buildApiRequest(adminGropusAndPolicySearch);

      fetchApiCall(requestData, true, true);
    }
  }, [adminGropusAndPolicySearch.filterTrigger]);

  // Reload Detection
  useEffect(() => {
    try {
      const navEntries = performance.getEntriesByType("navigation");
      if (navEntries[0]?.type === "reload") {
        resetAdminGropusAndPolicySearch();
        resetAdminGropusAndPolicyListContextState();
      }
    } catch (error) {
      console.error("Reload detection failed", error);
    }
  }, []);

  // MQTT Updates
  useEffect(() => {
    if (adminGropusAndPolicyMqtt) {
      setAdminGropusAndPolicyMqtt(false);
      let requestData = buildApiRequest(adminGropusAndPolicySearch);
      requestData = {
        ...requestData,
        PageNumber: 0,
      };
      fetchApiCall(requestData, true, false);
    }
  }, [adminGropusAndPolicyMqtt]);

  useEffect(() => {
    return () => {
      resetAdminGropusAndPolicyContextState();
    };
  }, []);

  // Infinite Scroll
  useTableScrollBottom(
    async () => {
      if (
        adminGropusAndPolicyData?.totalRecordsDataBase <=
        adminGropusAndPolicyData?.totalRecordsTable
      )
        return;
      try {
        setLoadingMore(true);
        const requestData = buildApiRequest(adminGropusAndPolicySearch);
        await fetchApiCall(requestData, false, false);
      } catch (err) {
        console.error("Error loading more approvals:", err);
      } finally {
        setLoadingMore(false);
      }
    },
    0,
    "border-less-table-white-3"
  );

  // ----------------- Render -----------------
  return (
    <>
      {!openNewFormForAdminGropusAndPolicy ? (
        <>
          {/* 🔹 Active Filter Tags */}
          {activeFilters.length > 0 && (
            <Row gutter={[12, 12]} className={style["filter-tags-container"]}>
              {activeFilters.map(({ key, value }) => (
                <Col key={key}>
                  <div className={style["filter-tag"]}>
                    <span>{value}</span>
                    <span
                      className={style["filter-tag-close"]}
                      onClick={() => handleRemoveFilter(key)}
                    >
                      &times;
                    </span>
                  </div>
                </Col>
              ))}
            </Row>
          )}

          {/* 🔹 Page Layout */}
          <PageLayout
            background="gray-2"
            className={activeFilters.length > 0 && "changeHeight"}
          >
            <div className="px-4 md:px-6 lg:px-8">
              {/* Header */}
              <Row justify="space-between" align="middle" className="mb-4">
                <Col>
                  <h2 className={style["heading"]}>Group Policies</h2>
                </Col>
                <Col>
                  <Button
                    type="text"
                    className={"small-dark-button"}
                    text="Create Group"
                    id={"create-group-and-policies"}
                    onClick={handleOpenCreateGroup}
                  />
                </Col>
              </Row>

              {/* Table */}
              <BorderlessTable
                rows={adminGropusAndPolicyData?.groupsAndPolicy || []}
                columns={columns}
                scroll={
                  adminGropusAndPolicyData?.approvals?.length
                    ? {
                        x: "max-content",
                        y: activeFilters.length > 0 ? 450 : 500,
                      }
                    : undefined
                }
                classNameTable="border-less-table-white-3"
                loading={loadingMore}
                ref={tableScrollAdminGroupsAndPolicyList}
              />
            </div>
          </PageLayout>
        </>
      ) : (
        <GroupAndPolicyAddViewEdit currentPolicyID={currentPolicyID} />
      )}
    </>
  );
};

export default GroupsAndPolicy;
