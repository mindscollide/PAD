import React, { useEffect, useState } from "react";
import { Tabs, Row, Col } from "antd";
import { ManageUsersCard, PageLayout } from "../../../components";
import styles from "./ManageUsers.module.css";
import CustomButton from "../../../components/buttons/button";
import Profile2 from "../../../assets/img/Profile2.png";
import Profile3 from "../../../assets/img/Profile3.png";
import Profile4 from "../../../assets/img/Profile4.png";
import Profile5 from "../../../assets/img/Profile5.png";
import Profile6 from "../../../assets/img/Profile6.png";
import { useGlobalModal } from "../../../context/GlobalModalContext";
import ViewDetailManageUserModal from "./modal/viewDetailManageUserModal/ViewDetailmanageUserModal";
import RolesAndPoliciesModal from "./modal/rolesAndPoliciesModal/RolesAndPoliciesModal";
import EditRoleAndPoliciesModal from "./modal/editRoleAndPoliciesModal/EditRoleAndPoliciesModal";
import UnSaveChangesModal from "./modal/unSaveChangesModal/UnSaveChangesModal";
import PendingRequest from "./pendingRequestsTab/PendingRequest";
import { useMyAdmin } from "../../../context/AdminContext";
import UsersTab from "./usersTab/ManageUsers";
import RequestApprovedRejeectedModal from "./modal/requestApprovedrejectModal/requestApprovedrejectModal";
import RejectedRequestTab from "./rejectedRequestTab/rejectedRequestTab";
import ViewDetailsOfRejectedRequestModal from "./modal/viewDetailsOfRejectedRequestModal/ViewDetailsOfRejectedRequestModal";
import { useSearchBarContext } from "../../../context/SearchBarContaxt";

const ManageUsers = () => {
  // ----------------- Contexts -----------------

  const {
    viewDetailManageUser,
    rolesAndPoliciesManageUser,
    editrolesAndPoliciesUser,
    unSavedChangesPoliciesModal,
    activeManageUserTab,
    setActiveManageUserTab,
    viewDetailRejectedModal,
  } = useGlobalModal();

  const {
    manageUsersTab,
    setManageUsersTab,
    resetmanageUsersContextState,
    modaPendingRequestModalOpenAction,
    setModaPendingRequestModalOpenAction,
    resetModalStateBulkAction,
    setTypeofAction,
  } = useMyAdmin();

  const {
    usersTabSearch,
    setUsersTabSearch,
    resetUsersTabSearch,
    pendingRequestsTabSearch,
    setPendingRequestsTabSearch,
    resetPendingRequestsTabSearch,
    rejectedRequestsTabSearch,
    setRejectedRequestsTabSearch,
    resetRejectedRequestsTabSearch,
  } = useSearchBarContext();

  const [currentUserData, setCurrentUserData] = useState([]);

  const tabStyle = (key) => ({
    fontSize: manageUsersTab === key ? "26px" : "26px",
    fontWeight: manageUsersTab === key ? "700" : "400",
    fontFamily: "Switzer Variable",
    color: manageUsersTab === key ? "#30426A" : "#30426A",
  });

  const items = [
    {
      key: "0",
      label: <span style={tabStyle("0")}>Users</span>,
    },
    {
      key: "1",
      label: (
        <span style={tabStyle("1")}>
          Pending Requests <span style={{ color: "#30426A" }}>(02)</span>
        </span>
      ),
    },
    {
      key: "2",
      label: <span style={tabStyle("2")}>Rejected Requests</span>,
    },
  ];

  useEffect(() => {
    return () => {
      resetmanageUsersContextState();
    };
  }, []);

  useEffect(() => {
    if (!modaPendingRequestModalOpenAction) {
      setTypeofAction(-1);
      setCurrentUserData([]);
    }
  }, [modaPendingRequestModalOpenAction]);
  // take bulk action on pending request
  const handleBulkAction = () => {
    try {
      // your async logic here
      console.log("Performing bulk action...");
      setTypeofAction(1);
      setModaPendingRequestModalOpenAction(true);
      // Example: await an API call
      // await someAsyncFunction();
    } catch (error) {
      console.error("Error performing bulk action:", error);
    }
  };
  /** 🔹 Handle removing individual filter */
  const handleRemoveFilter = (key) => {
    const resetCommon = {
      employeeName: "",
      emailAddress: "",
      departmentName: "",
    };

    if (manageUsersTab === "0") {
      // 🟢 Users Tab
      const resetMap = {
        ...resetCommon,
        employeeID: 0,
      };

      setUsersTabSearch((prev) => ({
        ...prev,
        [key]: resetMap[key],
        pageNumber: 0,
        filterTrigger: true,
      }));
    } else if (manageUsersTab === "1") {
      // 🟡 Pending Requests Tab
      const resetMap = {
        ...resetCommon,
        employeeID: "",
        startDate: null,
        endDate: null,
      };

      setPendingRequestsTabSearch((prev) => ({
        ...prev,
        [key]: resetMap[key],
        pageNumber: 0,
        filterTrigger: true,
      }));
    } else if (manageUsersTab === "2") {
      // 🔴 Rejected Requests Tab
      const resetMap = {
        ...resetCommon,
      };

      setRejectedRequestsTabSearch((prev) => ({
        ...prev,
        [key]: resetMap[key],
        pageNumber: 0,
        filterTrigger: true,
      }));
    }
  };

  /** 🔹 Handle removing all filters */
  const handleRemoveAllFilters = () => {
    if (manageUsersTab === "0") {
      setUsersTabSearch((prev) => ({
        ...prev,
        employeeName: "",
        employeeID: 0,
        emailAddress: "",
        departmentName: "",
        pageNumber: 0,
        filterTrigger: true,
      }));
    } else if (manageUsersTab === "1") {
      setPendingRequestsTabSearch((prev) => ({
        ...prev,
        employeeName: "",
        employeeID: "",
        emailAddress: "",
        departmentName: "",
        startDate: null,
        endDate: null,
        pageNumber: 0,
        filterTrigger: true,
      }));
    } else if (manageUsersTab === "2") {
      setRejectedRequestsTabSearch((prev) => ({
        ...prev,
        employeeName: "",
        emailAddress: "",
        departmentName: "",
        pageNumber: 0,
        filterTrigger: true,
      }));
    }
  };

  /** 🔹 Build Active Filters */
  const activeFilters = (() => {
    const truncate = (text) =>
      typeof text === "string" && text.length > 13
        ? `${text.slice(0, 13)}...`
        : text;

    let searchState = {};

    if (manageUsersTab === "0") {
      searchState = usersTabSearch;
    } else if (manageUsersTab === "1") {
      searchState = pendingRequestsTabSearch;
    } else if (manageUsersTab === "2") {
      searchState = rejectedRequestsTabSearch;
    }

    const {
      employeeName,
      employeeID,
      emailAddress,
      departmentName,
      startDate,
      endDate,
    } = searchState || {};

    const filters = [];

    if (employeeName)
      filters.push({
        key: "employeeName",
        label: "Employee Name",
        value: truncate(employeeName),
      });

    if (employeeID && employeeID !== 0)
      filters.push({
        key: "employeeID",
        label: "Employee ID",
        value: String(employeeID),
      });

    if (emailAddress)
      filters.push({
        key: "emailAddress",
        label: "Email",
        value: truncate(emailAddress),
      });

    if (departmentName)
      filters.push({
        key: "departmentName",
        label: "Department",
        value: truncate(departmentName),
      });

    if (startDate)
      filters.push({
        key: "startDate",
        label: "Start Date",
        value: new Date(startDate).toLocaleDateString(),
      });

    if (endDate)
      filters.push({
        key: "endDate",
        label: "End Date",
        value: new Date(endDate).toLocaleDateString(),
      });

    return filters;
  })();

  return (
    <>
      {/* 🔹 Active Filter Tags */}
      {activeFilters.length > 0 && (
        <Row gutter={[12, 12]} className={styles["filter-tags-container"]}>
          {activeFilters.map(({ key, value }) => (
            <Col key={key}>
              <div className={styles["filter-tag"]}>
                <span>{value}</span>
                <span
                  className={styles["filter-tag-close"]}
                  onClick={() => handleRemoveFilter(key)}
                >
                  &times;
                </span>
              </div>
            </Col>
          ))}

          {/* 🔹 Show Clear All only if more than one filter */}
          {activeFilters.length > 1 && (
            <Col>
              <div
                className={`${styles["filter-tag"]} ${styles["clear-all-tag"]}`}
                onClick={handleRemoveAllFilters}
              >
                <span>Clear All</span>
              </div>
            </Col>
          )}
        </Row>
      )}
      <PageLayout
        background="white"
        className={activeFilters.length > 0 && "changeHeight"}
      >
        <div className={styles.ManageUserMainDiv}>
          <Tabs
            activeKey={manageUsersTab}
            onChange={(key) => {
              // 🔹 Reset search state for previous tab before switching
              if (manageUsersTab === "0") {
                resetUsersTabSearch();
              } else if (manageUsersTab === "1") {
                resetPendingRequestsTabSearch();
              } else if (manageUsersTab === "2") {
                resetRejectedRequestsTabSearch();
              }

              // 🔹 Set new active tab
              setManageUsersTab(key);
            }}
            items={items}
            className={styles.customTabs}
          />

          <div className={styles.ExportButtonClass}>
            {manageUsersTab === "0" && (
              <CustomButton text="Export" className="big-dark-button" />
            )}
            {manageUsersTab === "1" && (
              <CustomButton
                text="Bulk Action"
                className="big-dark-button"
                onClick={handleBulkAction}
              />
            )}
          </div>
        </div>

        <div className={styles.ManageUserSecondDiv}>
          {/* ✅ Only show user cards when Users tab is active */}
          {manageUsersTab === "0" && (
            <Row gutter={[24, 16]}>
              <UsersTab />
            </Row>
          )}

          {/* ✅ Only show PendingRequest Component when PendingRequest tab is active */}
          {manageUsersTab === "1" && (
            <PendingRequest
              currentUserData={currentUserData}
              setCurrentUserData={setCurrentUserData}
            />
          )}

          {manageUsersTab === "2" && <RejectedRequestTab />}
        </div>
      </PageLayout>

      {/* For Open View Detail Modal */}
      {viewDetailManageUser && <ViewDetailManageUserModal />}

      {/* For Open Roles & Policies Modal */}
      {rolesAndPoliciesManageUser && <RolesAndPoliciesModal />}

      {/* For Edit ROle and Polices Modal */}
      {editrolesAndPoliciesUser && <EditRoleAndPoliciesModal />}

      {/* For unSaved changes ROle and Polices Modal */}
      {unSavedChangesPoliciesModal && <UnSaveChangesModal />}

      {/* For take bulk action   */}
      {modaPendingRequestModalOpenAction && (
        <RequestApprovedRejeectedModal
          currentUserData={currentUserData}
          setCurrentUserData={setCurrentUserData}
        />
      )}

      {/* For View Detail Of Rejected Request Modal */}
      {viewDetailRejectedModal && <ViewDetailsOfRejectedRequestModal />}
    </>
  );
};

export default ManageUsers;
