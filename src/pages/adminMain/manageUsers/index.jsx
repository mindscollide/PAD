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

const ManageUsers = () => {
  const {
    viewDetailManageUser,
    rolesAndPoliciesManageUser,
    editrolesAndPoliciesUser,
    unSavedChangesPoliciesModal,
    activeManageUserTab,
    setActiveManageUserTab,
  } = useGlobalModal();
  const { manageUsersTab, setManageUsersTab, resetmanageUsersContextState } =
    useMyAdmin();

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
  const pendingRequestsData = [
    {
      PendingRequestUsername: "Muhammad Junaid Akbar Farooqui",
      EmailId: "ali.raza@hbl.com",
      EmployeeID: "U389",
      DepartmentName: "Finance",
      username: "ali.raza",
      profileImage: Profile4,
    },
    {
      PendingRequestUsername: "Faheem Arif",
      EmailId: "faheem.arif@hbl.com",
      EmployeeID: "U235",
      DepartmentName: "Information Technology",
      username: "faheem.arif",
      profileImage: Profile3,
    },

    {
      PendingRequestUsername: "Nadia Shah",
      EmailId: "nadia.shah@hbl.com",
      EmployeeID: "U517",
      DepartmentName: "Marketing",
      username: "nadia.shah",
      profileImage: Profile5,
    },
  ];
  useEffect(() => {
    console.log("Component mounted");

    return () => {
      resetmanageUsersContextState();
    };
  }, []);
  return (
    <>
      <PageLayout background="white">
        <div className="px-4 md:px-6 lg:px-8">
          <div className={styles.ManageUserMainDiv}>
            <Tabs
              activeKey={manageUsersTab}
              onChange={setManageUsersTab}
              items={items}
              className={styles.customTabs}
            />

            <div className={styles.ExportButtonClass}>
              {manageUsersTab === "0" && (
                <CustomButton text="Export" className="big-dark-button" />
              )}
              {manageUsersTab === "1" && (
                <CustomButton text="Bulk Action" className="big-dark-button" />
              )}
            </div>
          </div>

          <div className={styles.ManageUserSecondDiv}>
            {/* ✅ Only show user cards when Users tab is active */}
            <Row gutter={[24, 16]}>
              {manageUsersTab === "0" && (
                <Row gutter={[24, 16]}>
                  <UsersTab />
                </Row>
              )}

              {/* ✅ Only show PendingRequest Component when PendingRequest tab is active */}
              {manageUsersTab === "1" && (
                <Row gutter={[24, 16]}>
                  {pendingRequestsData.map((request, index) => (
                    <Col key={index} xs={24} sm={24}>
                      <PendingRequest
                        PendingRequestUsername={request.PendingRequestUsername}
                        EmailId={request.EmailId}
                        EmployeeID={request.EmployeeID}
                        DepartmentName={request.DepartmentName}
                        username={request.username}
                        profileImage={request.profileImage}
                        onTakeAction={() =>
                          console.log("Take Action on:", request.username)
                        }
                      />
                    </Col>
                  ))}
                </Row>
              )}

              {manageUsersTab === "2" && <div>No rejected requests.</div>}
            </Row>
          </div>
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
    </>
  );
};

export default ManageUsers;
