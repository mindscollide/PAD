import React, { useState } from "react";
import { Dropdown, Flex, Menu } from "antd";
import { EllipsisOutlined } from "@ant-design/icons";
import styles from "./manageUserCards.module.css";
import { useGlobalModal } from "../../context/GlobalModalContext";
import GroupPolicies from "../../assets/img/GroupPeople.png";

const ManageUsersCard = ({ profile, name, email, id, file }) => {
  const { setViewDetailManageUser } = useGlobalModal();

  const [menuVisible, setMenuVisible] = useState(false);

  const items = [
    {
      key: "1",
      label: (
        <span
          onClick={() => {
            setViewDetailManageUser(true);
          }}
          className={styles.dropdownClass}
        >
          View Details
        </span>
      ),
    },
    {
      key: "2",
      label: (
        <span className={styles.dropdownClass}>Session wise activity</span>
      ),
    },
    {
      key: "3",
      label: <span className={styles.dropdownClass}>Roles & Policies</span>,
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
            <h5 style={{ margin: 0 }}>
              {name}{" "}
              <span className={styles.fileImgClass}>
                {file ? <img src={GroupPolicies} /> : null}
              </span>
            </h5>
          </div>

          <div className={styles.manageUserEmail}>
            <span>{email}</span>
            <span>ID: {id}</span>
          </div>
        </div>
        <Dropdown
          menu={{ items }}
          trigger={["click"]}
          placement="bottomRight"
          onOpenChange={(flag) => setMenuVisible(flag)}
        >
          <div
            className={
              menuVisible
                ? styles.moreBackgroundColorActive
                : styles.moreBackgroundColor
            }
          >
            <EllipsisOutlined
              className={
                menuVisible
                  ? styles.backgroundcolorMoreIconActive
                  : styles.backgroundcolorMoreIcon
              }
            />
          </div>
        </Dropdown>
      </div>
    </div>
  );
};

export default ManageUsersCard;
