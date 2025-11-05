import React, { useCallback, useEffect, useRef, useState } from "react";
import { Tabs, Row, Col } from "antd";
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

  return (
    <>
      <div className={styles.ManageUserSecondDiv}>
        {/* ✅ Only show user cards when Users tab is active */}
        <Row gutter={[24, 16]}>
          {adminManageUserTabData?.employees?.map((user, index) => (
            <Col key={index} xs={24} sm={12}>
              <ManageUsersCard
                profile={user.profilePicture}
                name={user.employeeName}
                email={user.emailAddress}
                id={user.employeeID}
                file={user.isDisable}
              />
            </Col>
          ))}
        </Row>
      </div>
    </>
  );
};

export default UsersTab;
