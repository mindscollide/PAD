import React, { useState } from "react";
import { Dropdown, Flex, Menu } from "antd";
import { EllipsisOutlined } from "@ant-design/icons";
import styles from "./manageUserCards.module.css";
import { useGlobalModal } from "../../context/GlobalModalContext";
import GroupPolicies from "../../assets/img/GroupPeople.png";
import Profile2 from "../../assets/img/Profile2.png";
import { useNotification } from "../NotificationProvider/NotificationProvider";
import { useGlobalLoader } from "../../context/LoaderContext";
import { useApi } from "../../context/ApiContext";
import { useNavigate } from "react-router-dom";
import {
  GetViewDetailsUserRoleAndPoliciesRequests,
  ViewDetailManageUserUserTabRequest,
} from "../../api/adminApi";
import { useMyAdmin } from "../../context/AdminContext";
import { useSearchBarContext } from "../../context/SearchBarContaxt";

const ManageUsersCard = ({ profile, name, email, id, file, employeeCode }) => {
  console.log(id, "UserProfileUserProfile");
  const navigate = useNavigate();

  // 🔷 Context Hooks
  const { showNotification } = useNotification();
  const { showLoader } = useGlobalLoader();
  const { callApi } = useApi();
  const { setViewDetailManageUser, setRolesAndPoliciesManageUser } =
    useGlobalModal();
  const {
    setManageUsersViewDetailModalData,
    setRoleAndPolicyViewDetailData,
    setAdminSessionWiseActivityListData,
  } = useMyAdmin();
  const { setAdminSessionWiseActivitySearch } = useSearchBarContext();
  const [menuVisible, setMenuVisible] = useState(false);

  /** 🔹 on Manage User When you Click On dropdown then ViewDetail button show API Function*/
  const onClickOfViewDetailApiFunction = async () => {
    showLoader(true);
    const payload = {
      EmployeeID: Number(id),
    };

    let res = await ViewDetailManageUserUserTabRequest({
      callApi,
      showNotification,
      showLoader,
      requestdata: payload,
      navigate,
    });

    if (res) {
      setManageUsersViewDetailModalData(res);
    }
  };

  /** 🔹 on Click Role And Policies API Hit to get User Details Data in view detail modal of manage User users Tab*/
  const onClickRoleAndPolicy = async () => {
    showLoader(true);
    let payload = {
      UserID: Number(id),
    };

    console.log(payload, "CheckDataDaatat");

    let res = await GetViewDetailsUserRoleAndPoliciesRequests({
      callApi,
      showNotification,
      showLoader,
      requestdata: payload,
      setViewDetailManageUser,
      setRolesAndPoliciesManageUser,
      navigate,
    });

    if (res) {
      setRoleAndPolicyViewDetailData(res);
    }
  };
  const handleOpensessionWiseActivity = async () => {
    // Update employeeName in state
    await setAdminSessionWiseActivityListData((prev) => ({
      ...prev,
      employeeName: name,
    }));

    // Call your API function
    await setAdminSessionWiseActivitySearch((prev) => ({
      ...prev,
      employeeID: id,
    }));

    // Navigate to the route
    navigate("/PAD/admin-users/session-wise-activity");
  };

  const items = [
    {
      key: "1",
      label: (
        <span
          onClick={() => {
            setViewDetailManageUser(true);
            onClickOfViewDetailApiFunction();
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
        <span
          className={styles.dropdownClass}
          onClick={() => handleOpensessionWiseActivity()}
        >
          Session wise activity
        </span>
      ),
    },
    {
      key: "3",
      label: (
        <span
          className={styles.dropdownClass}
          onClick={() => {
            setRolesAndPoliciesManageUser(true);
            onClickRoleAndPolicy();
          }}
        >
          Roles & Policies
        </span>
      ),
    },
  ];

  console.log(items, "CheckItemItem");

  return (
    <div className={styles.mainUserCarddiv}>
      {/* Left Section - Profile */}
      {/* For Profile Picture */}
      <div className={styles.manageUserSection}>
        <img
          src={profile && profile.trim() !== "" ? profile : Profile2}
          alt={name}
          className={styles.manageUserProfileImg}
        />
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
            <span>ID: {employeeCode}</span>
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
