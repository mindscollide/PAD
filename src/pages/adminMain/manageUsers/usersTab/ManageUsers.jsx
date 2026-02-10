import React, { useCallback, useEffect, useRef, useState } from "react";
import { Tabs, Row, Col, Spin } from "antd";
import { ManageUsersCard, PageLayout } from "../../../../components";
import styles from "../ManageUsers.module.css";
import { useMyAdmin } from "../../../../context/AdminContext";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../../../../components/NotificationProvider/NotificationProvider";
import { useGlobalLoader } from "../../../../context/LoaderContext";
import { useApi } from "../../../../context/ApiContext";
import { SearchManageUserListRequest } from "../../../../api/adminApi";
import { buildManageUserUseraTabApiRequest } from "../Utils";
import { useSearchBarContext } from "../../../../context/SearchBarContaxt";

const UsersTab = () => {
  const navigate = useNavigate();
  const hasFetched = useRef(false);
  const containerRef = useRef(null);

  // ----------------- Contexts -----------------

  const { showNotification } = useNotification();
  const { showLoader } = useGlobalLoader();
  const { callApi } = useApi();

  const { usersTabSearch, setUsersTabSearch, resetUsersTabSearch } =
    useSearchBarContext();

  const {
    resetmanageUsersContextState,
    adminManageUserTabData,
    setAdminManageUserTabData,
  } = useMyAdmin();

  console.log(adminManageUserTabData, "adminManageUserTabData");

  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true); // until proven otherwise

  // ----------------- Helpers -----------------

  /** 🔹 Fetch approvals from API */
  const fetchApiCall = useCallback(
    async (requestData, replace = false, showLoaderFlag = true) => {
      if (!requestData || typeof requestData !== "object") return;
      if (showLoaderFlag) showLoader(true);

      const res = await SearchManageUserListRequest({
        callApi,
        showNotification,
        showLoader,
        requestdata: requestData,
        navigate,
      });

      if (res) {
        setAdminManageUserTabData(res);
      }
    },
    [callApi, navigate, showLoader, showNotification]
  );

  // Initial Fetch
  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      const requestData = buildManageUserUseraTabApiRequest(usersTabSearch);
      sessionStorage.removeItem("sessionWiseEmployeeName");
      sessionStorage.removeItem("sessionWiseEmployeeID");
      fetchApiCall(requestData, true, true);
    }
  }, [buildManageUserUseraTabApiRequest, usersTabSearch, fetchApiCall]);

  // Fetch on Filter Trigger
  useEffect(() => {
    if (usersTabSearch.filterTrigger) {
      const requestData = buildManageUserUseraTabApiRequest(usersTabSearch);
      fetchApiCall(requestData, true, true);

      // ✅ Reset filterTrigger to false after API call so it can be triggered again later
      setUsersTabSearch((prev) => ({
        ...prev,
        filterTrigger: false,
      }));
    }
  }, [usersTabSearch.filterTrigger]);

  // Update hasMore when adminManageUserTabData changes
  useEffect(() => {
    const total = adminManageUserTabData?.totalRecords ?? 0;
    const currentLen = adminManageUserTabData?.employees?.length ?? 0;
    setHasMore(currentLen < total);
  }, [adminManageUserTabData]);

  // Scroll handler for lazy loading
  const handleScroll = async () => {
    if (!containerRef.current) return;
    if (loadingMore) return;
    if (!hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;

    // if reached bottom (small offset to be safe)
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      setLoadingMore(true);

      try {
        // calculate current offset (PageNumber) as current loaded employees length
        const currentLength = adminManageUserTabData?.employees?.length || 0;

        // build request based on current search/filter but override pagination
        const baseRequest = buildManageUserUseraTabApiRequest(usersTabSearch);
        const requestData = {
          ...baseRequest,
          PageNumber: currentLength, // sRow
          Length: 10, // eRow (static 10)
        };

        const res = await SearchManageUserListRequest({
          callApi,
          showNotification,
          showLoader, // you can pass showLoader or not; it won't show global loader if you manage local spinner
          requestdata: requestData,
          navigate,
        });

        const newEmployees = res?.employees || [];

        if (newEmployees.length > 0) {
          // merge new employees into existing array and also update any other top-level response fields (e.g., totalRecords)
          setAdminManageUserTabData((prev = {}) => ({
            ...res, // take latest top-level fields (totalRecords etc.) from response
            employees: [...(prev.employees || []), ...newEmployees],
          }));
        } else {
          // no new data => stop further fetching
          setHasMore(false);
        }
      } catch (err) {
        console.error("Error fetching more users:", err);
      } finally {
        setLoadingMore(false);
      }
    }
  };

  // Attach scroll listener to the managed container
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // attach
    el.addEventListener("scroll", handleScroll);

    // cleanup
    return () => {
      el.removeEventListener("scroll", handleScroll);
    };
  }, [containerRef.current, hasMore, loadingMore, adminManageUserTabData]);

  return (
    <>
      <div ref={containerRef} className={styles.ManageUserSecondDivUsersTab}>
        {/* ✅ Only show user cards when Users tab is active */}
        <Row gutter={[24, 16]}>
          {adminManageUserTabData?.employees?.map((user, index) => (
            <Col key={index} md={12} lg={12}>
              <ManageUsersCard
                profile={user.profilePicture}
                name={user.employeeName}
                email={user.emailAddress}
                id={user.employeeID}
                file={user.isDisable}
                employeeCode={user.employeeCode}
              />
            </Col>
          ))}
        </Row>

        {/* loading spinner at bottom while fetching */}
        {loadingMore && (
          <div style={{ textAlign: "center", padding: 12 }}>
            <Spin size="large" />
          </div>
        )}
      </div>
    </>
  );
};

export default UsersTab;
