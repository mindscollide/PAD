import React, { useState } from "react";
import { Dropdown, Flex, Menu } from "antd";
import { EllipsisOutlined } from "@ant-design/icons";
import styles from "./manageUserCards.module.css";

const ManageUsersCard = ({ profile, name, email, id }) => {
  const [menuVisible, setMenuVisible] = useState(false);
  console.log(menuVisible, "menuVisiblemenuVisible");

  const items = [
    {
      key: "1",
      label: "View Details",
    },
    {
      key: "2",
      label: "Session wise activity",
    },
    {
      key: "3",
      label: "Roles & Policies",
    },
  ];

  return (
    <div className={styles.mainUserCarddiv}>
      {/* Left Section - Profile */}
      {/* For Profile Picture */}
      <div className={styles.manageUserSection}>
        <img src={profile} alt={name} className={styles.manageUserProfileImg} />
      </div>
      {/* Fpr Details and dropdown icon */}
      <div className={styles.fordetailUserManage}>
        <div className={styles.fordetailUserManageSubDiv}>
          <div className={styles.manageUserName}>
            <h5 style={{ margin: 0 }}>{name}</h5>
          </div>

          <div className={styles.manageUserEmail}>
            <span>{email}</span>
            <span>ID: {id}</span>
          </div>
        </div>
        <Dropdown
          menu={{ items }}
          trigger={["click"]}
          onOpenChange={(flag) => setMenuVisible(flag)}
        >
          <div className={styles.moreBackgroundColor}>
            <EllipsisOutlined
              className={styles.moreIcon}
              style={{
                color: menuVisible ? "#30426A" : "#000",
              }}
            />
          </div>
        </Dropdown>
      </div>
    </div>
  );
};

export default ManageUsersCard;
