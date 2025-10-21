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

const ManageUsers = () => {
  const [activeTab, setActiveTab] = useState("1");

  const usersData = [
    {
      profile: Profile2,
      name: "John O'Connor",
      email: "john.oconnor@gmail.com",
      id: "U003",
    },
    {
      profile: Profile3,
      name: "Sarah Johnson",
      email: "sarah.johnson@gmail.com",
      id: "U004",
    },
    {
      profile: Profile4,
      name: "James Williams",
      email: "james.williams@gmail.com",
      id: "U005",
    },
    {
      profile: Profile6,
      name: "Jameel Khan",
      email: "Jameel.khan@gmail.com",
      id: "U006",
    },
    {
      profile: Profile4,
      name: "James Williams",
      email: "james.williams@gmail.com",
      id: "U005",
    },
    {
      profile: Profile5,
      name: "Zahid Khan",
      email: "Zahid.khan@gmail.com",
      id: "U006",
    },
  ];

  const items = [
    {
      key: "1",
      label: "Users",
    },
    {
      key: "2",
      label: (
        <span>
          Pending Requests <span style={{ color: "#30426A" }}>(02)</span>
        </span>
      ),
    },
    {
      key: "3",
      label: "Rejected Requests",
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

            <CustomButton text={"Export"} className="big-dark-button" />
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
    </>
  );
};

export default ManageUsers;
