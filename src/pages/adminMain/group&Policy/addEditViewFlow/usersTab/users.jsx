import React, { useCallback, useEffect, useRef, useState } from "react";
import { Tooltip } from "antd";
import styles from "./users.module.css"; // optional for styling consistency
import { BorderlessTable } from "../../../../../components";
import { useMyAdmin } from "../../../../../context/AdminContext";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../../../../../components/NotificationProvider/NotificationProvider";
import { useGlobalLoader } from "../../../../../context/LoaderContext";
import { useApi } from "../../../../../context/ApiContext";
import {
  SearchAllEmployeesWithAssignedPolicies,
  SearchUsersByGroupPolicyID,
} from "../../../../../api/adminApi";
import { useSearchBarContext } from "../../../../../context/SearchBarContaxt";
import { buildApiRequest, getUserColumns } from "./utils";
import { useTableScrollBottom } from "../../../../../common/funtions/scroll";

const Users = ({
  activeFilters,
  currentPolicyID,
  clickEditFromView,
  setClickEditFromView,
}) => {
  // 🔹 Navigation & Refs
  const navigate = useNavigate();
  const hasFetched = useRef(false); // Prevents duplicate initial fetches
  const tableScrollUserstabPolicies = useRef(null);

  // 🔹 Context Hooks
  const { showNotification } = useNotification();
  const { showLoader } = useGlobalLoader();
  const { callApi } = useApi();

  // 🔹 State Management
  const [loadingMore, setLoadingMore] = useState(false); // Loading state for pagination
  const [sortedInfo, setSortedInfo] = useState({});

  const {
    tabesFormDataofAdminGropusAndPolicy,
    setTabesFormDataofAdminGropusAndPolicy,
    resetAdminGroupeAndPoliciesUsersTabDataState,
    adminGroupeAndPoliciesUsersTabData,
    setAdminGroupeAndPoliciesUsersTabData,
    pageTypeForAdminGropusAndPolicy,
    setPageTypeForAdminGropusAndPolicy,
  } = useMyAdmin();

  // 🔹 Search Context
  const {
    resetAdminGropusAndPolicyUsersTabSearch,
    adminGropusAndPolicyUsersTabSearch,
    setAdminGropusAndPolicyUsersTabSearch,
  } = useSearchBarContext();

  /** 🔹 Fetch approvals from API */
  const fetchApiCall = useCallback(
    async (requestData, replace = false, showLoaderFlag = true, type) => {
      if (!requestData || typeof requestData !== "object") return;
      if (showLoaderFlag) showLoader(true);
      let res = [];
      if (type === 2) {
        res = await SearchUsersByGroupPolicyID({
          callApi,
          showNotification,
          showLoader,
          requestdata: requestData,
          navigate,
        });
      } else {
        res = await SearchAllEmployeesWithAssignedPolicies({
          callApi,
          showNotification,
          showLoader,
          requestdata: requestData,
          navigate,
        });
      }
      const employees = Array.isArray(res?.employees) ? res.employees : [];
      const mapped = employees;
      //   const mapped = manage(employees);

      setAdminGroupeAndPoliciesUsersTabData((prev) => ({
        employees: replace ? mapped : [...(prev?.employees || []), ...mapped],
        // this is for to run lazy loading its data comming from database of total data in db
        totalRecordsDataBase: res?.totalRecords || 0,
        // this is for to know how mush dta currently fetch from  db
        // (was reading the outer adminGroupeAndPoliciesUsersTabData closure
        // instead of this updater's own prev - stale under back-to-back
        // fetches)
        totalRecordsTable: replace
          ? mapped.length
          : (prev?.totalRecordsTable || 0) + mapped.length,
      }));

      setAdminGropusAndPolicyUsersTabSearch((prev) => {
        // PageNumber is 1-indexed on the backend now (page 1 -> first
        // page, ...) - this used to track a cumulative fetched-row count,
        // which only worked with the old (broken) backend pagination
        // (2026-08-10_search_users_by_group_policy_add_department.md). A
        // `replace` fetch always requests page 1, so prime this for the
        // *next* page; a lazy-scroll fetch just advances by one page.
        const next = {
          ...prev,
          pageNumber: replace ? 2 : prev.pageNumber + 1,
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
      setAdminGroupeAndPoliciesUsersTabData,
      setAdminGropusAndPolicyUsersTabSearch,
      showLoader,
      showNotification,
    ]
  );

  const handleNewCall = async () => {
    await setPageTypeForAdminGropusAndPolicy(1);

    let requestData = buildApiRequest(adminGropusAndPolicyUsersTabSearch);
    if (pageTypeForAdminGropusAndPolicy === 2) {
      // 🟠 Update existing → add GroupPolicyID
      requestData = {
        ...requestData,
        GroupPolicyID: currentPolicyID, // 👈 use your stored policy ID
      };
    }
    // 🟠 Update existing → add GroupPolicyID
    fetchApiCall(requestData, true, true, 1);
    setClickEditFromView(false);
  };

  useEffect(() => {
    if (clickEditFromView) {
      handleNewCall();
    }
  }, [clickEditFromView]);

  // Initial Fetch
  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      let requestData = buildApiRequest(adminGropusAndPolicyUsersTabSearch);
      if (pageTypeForAdminGropusAndPolicy === 2) {
        // 🟠 Update existing → add GroupPolicyID
        requestData = {
          ...requestData,
          GroupPolicyID: currentPolicyID, // 👈 use your stored policy ID
        };
      }
      fetchApiCall(requestData, true, true, pageTypeForAdminGropusAndPolicy);
    }
  }, [buildApiRequest, adminGropusAndPolicyUsersTabSearch, fetchApiCall]);

  /** 🔹 Handle checkbox selection change */
  const handleSelectChange = (e, record) => {
    const checked = e.target.checked;
    setTabesFormDataofAdminGropusAndPolicy((prev) => {
      const updatedUsers = checked
        ? [...(prev.users || []), record.employeeID]
        : (prev.users || []).filter((id) => id !== record.employeeID);

      return {
        ...prev,
        users: updatedUsers,
      };
    });
  };

  const handleChange = (_, __, sorter) => setSortedInfo(sorter);

  const columns = getUserColumns({
    sortedInfo,
    handleSelectChange,
    tabesFormDataofAdminGropusAndPolicy,
    pageTypeForAdminGropusAndPolicy,
    currentPolicyID,
  });
  // Fetch on Filter Trigger
  useEffect(() => {
    if (adminGropusAndPolicyUsersTabSearch.filterTrigger) {
      let requestData = buildApiRequest(adminGropusAndPolicyUsersTabSearch);
      if (pageTypeForAdminGropusAndPolicy === 2) {
        // 🟠 Update existing → add GroupPolicyID
        requestData = {
          ...requestData,
          GroupPolicyID: currentPolicyID, // 👈 use your stored policy ID
        };
      }

      fetchApiCall(requestData, true, true);
    }
  }, [adminGropusAndPolicyUsersTabSearch.filterTrigger]);
  // Infinite Scroll
  useTableScrollBottom(
    async () => {
      if (
        adminGroupeAndPoliciesUsersTabData?.totalRecordsDataBase <=
        adminGroupeAndPoliciesUsersTabData?.totalRecordsTable
      )
        return;
      try {
        setLoadingMore(true);
        let requestData = buildApiRequest(adminGropusAndPolicyUsersTabSearch);
        if (pageTypeForAdminGropusAndPolicy === 2) {
          // 🟠 Update existing → add GroupPolicyID
          requestData = {
            ...requestData,
            GroupPolicyID: currentPolicyID, // 👈 use your stored policy ID
          };
        }
        await fetchApiCall(
          requestData,
          false,
          false,
          pageTypeForAdminGropusAndPolicy
        );
      } catch (err) {
        console.error("Error loading more approvals:", err);
      } finally {
        setLoadingMore(false);
      }
    },
    0,
    "border-less-table-white"
  );
  return (
    <div className={styles.userTableContainer}>
      <BorderlessTable
        rows={adminGroupeAndPoliciesUsersTabData?.employees}
        columns={columns}
        classNameTable="border-less-table-white"
        onChange={handleChange} // ✅ must include this
        loading={loadingMore}
        scroll={
          adminGroupeAndPoliciesUsersTabData?.employees?.length
            ? { y: activeFilters ? 400 : 428 }
            : undefined
        }
        style={{ width: "100%" }}
        ref={tableScrollUserstabPolicies}
      />
    </div>
  );
};

export default Users;
