import React, { useState } from "react";
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

const ManageUsers = () => {
  const {
    viewDetailManageUser,
    rolesAndPoliciesManageUser,
    editrolesAndPoliciesUser,
    unSavedChangesPoliciesModal,
  } = useGlobalModal();

  const [activeTab, setActiveTab] = useState("1");

  const usersData = [
    {
      profile: Profile2,
      name: "John O'Connor",
      email: "john.oconnor@gmail.com",
      id: "U003",
      file: true,
    },
    {
      profile: Profile3,
      name: "Sarah Johnson",
      email: "sarah.johnson@gmail.com",
      id: "U004",
      file: false,
    },
    {
      profile: Profile4,
      name: "James Williams",
      email: "james.williams@gmail.com",
      id: "U005",
      file: true,
    },
    {
      profile: Profile6,
      name: "Jameel Khan",
      email: "Jameel.khan@gmail.com",
      id: "U006",
      file: false,
    },
    {
      profile: Profile4,
      name: "James Williams",
      email: "james.williams@gmail.com",
      id: "U005",
      file: false,
    },
    {
      profile: Profile5,
      name: "Zahid Khan",
      email: "Zahid.khan@gmail.com",
      id: "U006",
      file: true,
    },
  ];

  const tabStyle = (key) => ({
    fontSize: activeTab === key ? "26px" : "26px",
    fontWeight: activeTab === key ? "700" : "400",
    fontFamily: "Switzer Variable",
    color: activeTab === key ? "#30426A" : "#30426A",
  });

  const items = [
    {
      key: "1",
      label: <span style={tabStyle("1")}>Users</span>,
    },
    {
      key: "2",
      label: (
        <span style={tabStyle("2")}>
          Pending Requests <span style={{ color: "#30426A" }}>(02)</span>
        </span>
      ),
    },
    {
      key: "3",
      label: <span style={tabStyle("3")}>Rejected Requests</span>,
    },
  ];

  return (
    <>
      <PageLayout background="white">
        <div className="px-4 md:px-6 lg:px-8">
          <div className={styles.ManageUserMainDiv}>
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={items}
              className={styles.customTabs}
            />

            <div className={styles.ExportButtonClass}>
              <CustomButton text={"Export"} className="big-dark-button" />
            </div>
          </div>

          <div className={styles.ManageUserSecondDiv}>
            <Row gutter={[24, 16]}>
              {/* ✅ Only show user cards when Users tab is active */}
              {activeTab === "1" && (
                <Row gutter={[24, 16]}>
                  {usersData.map((user, index) => (
                    <Col key={index} xs={24} sm={12}>
                      <ManageUsersCard
                        profile={user.profile}
                        name={user.name}
                        email={user.email}
                        id={user.id}
                        file={user.file}
                      />
                    </Col>
                  ))}
                </Row>
              )}

              {activeTab === "2" && <div>No pending requests.</div>}
              {activeTab === "3" && <div>No rejected requests.</div>}
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
