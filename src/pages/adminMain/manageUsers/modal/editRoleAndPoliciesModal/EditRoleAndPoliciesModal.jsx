import React, { useEffect, useState } from "react";
import { Col, Row, Select } from "antd";

// 🔹 Components & Contexts
import { CheckBox, GlobalModal } from "../../../../../components";
import { useGlobalModal } from "../../../../../context/GlobalModalContext";
import CustomButton from "../../../../../components/buttons/button";

// 🔹 Assets
import Profile2 from "../../../../../assets/img/Profile2.png";
import DarkCrossImg from "../../../../../assets/img/DarkCrossImg.png";

// 🔹 Styles
import styles from "./EditRoleAndPoliciesModal.module.css";
import { useMyAdmin } from "../../../../../context/AdminContext";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../../../../../components/NotificationProvider/NotificationProvider";
import { useGlobalLoader } from "../../../../../context/LoaderContext";
import { useApi } from "../../../../../context/ApiContext";
import { UpdateEditRolesAndPoliciesRequest } from "../../../../../api/adminApi";

const EditRoleAndPoliciesModal = () => {
  const navigate = useNavigate();

  // 🔷 Context Hooks
  const { showNotification } = useNotification();
  const { showLoader } = useGlobalLoader();
  const { callApi } = useApi();
  const {
    editrolesAndPoliciesUser,
    setEditrolesAndPoliciesUser,
    setUnSavedChangesPoliciesModal,
    setRoleAndPoliciesIntimationModal,
  } = useGlobalModal();

  // 🔹  Context State of View Detail Modal in which All data store
  const {
    editRoleAndPolicyGroupDropdownData,
    allUserRolesForEditRolePolicyData,
    // this is the Context state in which I get the fullName and statuses
    roleAndPolicyViewDetailData,
    storeEditRolesAndPoliciesData,
    setStoreEditRolesAndPoliciesData,
  } = useMyAdmin();

  console.log(
    allUserRolesForEditRolePolicyData,
    "allUserRolesForEditRolePolicyData"
  );

  // 🔹 Extract user details from context
  const userDetails = roleAndPolicyViewDetailData?.userDetails;

  const [selectedRoles, setSelectedRoles] = useState([]);
  // 🔹 Initialize state based on userStatusID
  const [userStatus, setUserStatus] = useState(userDetails?.userStatusID || 1);

  const [selectedPolicy, setSelectedPolicy] = useState(null);

  // get data from sessionStorage
  const userProfileData = JSON.parse(
    sessionStorage.getItem("user_profile_data") || "{}"
  );
  const loggedInUserID = userProfileData?.userID;

  // 🔹 This the groupPolicyOptions data which is coming in the Change Group Policy dropdown
  const groupPolicyOptions =
    editRoleAndPolicyGroupDropdownData?.groupPolicies?.map((policy) => ({
      label: policy.groupTitle,
      value: policy.groupPolicyID,
      description: policy.groupDescription,
    })) || [];

  // 🔹 This the checkbox data in which all roles will be shown
  const allRoles = allUserRolesForEditRolePolicyData?.userRoles || [];

  // 🔹check if there is already roles assigned then checkbox will be enable
  useEffect(() => {
    if (allRoles?.length && userDetails?.assignedRoles) {
      const assignedRolesArray = userDetails.assignedRoles
        .split(",")
        .map((role) => role.trim());

      const preSelectedRoles = allRoles
        .filter((role) => assignedRolesArray.includes(role.roleName))
        .map((role) => role.userRoleID);

      setSelectedRoles(preSelectedRoles);
    }
  }, [allRoles, userDetails]);

  // 🔹 Determine if Employee roleName is selected (case-insensitive match)
  const isEmployeeSelected = allRoles.some(
    (role) =>
      selectedRoles.includes(role.userRoleID) &&
      role.roleName.toLowerCase().includes("employee")
  );

  // 🔹 This the checkbox toggle function in which you checked or unChecked them
  const toggleRole = (roleId) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId]
    );
  };

  // 🔹 Selected policy from the change Group Policy
  const selectedPolicyData = groupPolicyOptions.find(
    (p) => p.value === selectedPolicy
  );

  // 🔹 Active, Disable and other statuses
  const statusOptions = [
    { label: "Active", value: 1, color: "#00640a" },
    { label: "Disabled", value: 2, color: "#9ca3af" },
    { label: "Dormant", value: 4, color: "#ff4d4f" },
    { label: "Closed", value: 3, color: "#000000" },
  ];

  // 🔹 onCLick Save This API Function will be hit
  const onClickSaveOnEditRolesAndPolicies = async () => {
    showLoader(true);
    let payload = {
      //Jis sy ma Edit Krraha uski User Id jaegi
      UserID: userDetails?.userID,
      FK_UserStatusID: userStatus,
      Roles: selectedRoles,
      GroupPolicies: selectedPolicy ? [selectedPolicy] : [],
      LastUpdatedBy: loggedInUserID,
    };

    let res = await UpdateEditRolesAndPoliciesRequest({
      callApi,
      showNotification,
      showLoader,
      requestdata: payload,
      setEditrolesAndPoliciesUser,
      setRoleAndPoliciesIntimationModal,
      navigate,
    });

    if (res) {
      if (res && res.hasDependency) {
        setStoreEditRolesAndPoliciesData({
          hasDependency: res.hasDependency,
          employees: res.employees,
        });
      }
    }
  };

  return (
    <GlobalModal
      visible={editrolesAndPoliciesUser}
      width="1200px"
      centered
      modalHeader={null}
      onCancel={() => setEditrolesAndPoliciesUser(false)}
      modalBody={
        <>
          <div className={styles.modalWrapper}>
            {/* Top Header */}
            <Row justify="space-between" align="middle">
              <Col>
                <h5 className={styles.modalTitle}>Edit Roles & Policies</h5>
              </Col>
              <Col>
                <div className={styles.userInfo}>
                  <img src={Profile2} alt="User" height={40} width={40} />
                  <span className={styles.userName}>
                    {userDetails?.fullName || "—"}
                  </span>
                  <Select
                    value={userStatus}
                    prefixCls={"UserStatusDropdown"}
                    onChange={setUserStatus}
                    className={styles.statusDropdown}
                    options={statusOptions.map((status) => ({
                      label: (
                        <span style={{ color: status.color, fontWeight: 600 }}>
                          {status.label}
                        </span>
                      ),
                      value: status.value, // numeric ID
                    }))}
                  />
                </div>
              </Col>
            </Row>

            {/* Main Content */}
            <div className={styles.mainContent}>
              <Row gutter={32}>
                {/* Left: Roles + Status Checkboxes */}
                <Col span={11}>
                  <div className={styles.rolesWrapper}>
                    <Row className={styles.roleHeader}>
                      <Col span={18}>
                        <label className={styles.columnHeader}>Roles</label>
                      </Col>
                      <Col span={6}>
                        <label className={styles.columnHeader}>Status</label>
                      </Col>
                    </Row>

                    {allRoles.map((role) => (
                      <Row
                        key={role.userRoleID}
                        className={styles.roleRow}
                        align="middle"
                      >
                        <Col span={19}>
                          <span
                            className={
                              selectedRoles.includes(role.userRoleID)
                                ? styles.roleTextActive
                                : styles.roleTextInactive
                            }
                          >
                            {role.roleName}
                          </span>
                        </Col>
                        <Col span={5}>
                          <CheckBox
                            type="checkbox"
                            checked={selectedRoles.includes(role.userRoleID)}
                            onChange={() => toggleRole(role.userRoleID)}
                          />
                        </Col>
                      </Row>
                    ))}
                  </div>
                </Col>

                {/* Right: Policy Info */}
                <Col span={13}>
                  {!selectedPolicyData ? (
                    <div className={styles.policySection}>
                      <label className={styles.policyHeading}>
                        Assigned Policy:{" "}
                        <span className={styles.policyDescription}>
                          Policy Management Hub – Streamlining Compliance,
                          Governance, and Regulatory Best Practices
                        </span>
                      </label>
                      <label className={styles.dropdownLabel}>
                        Change Group Policy
                      </label>

                      {groupPolicyOptions.length > 0 ? (
                        <Select
                          placeholder="Search Group Policy"
                          className={styles.policyDropdown}
                          showSearch
                          allowClear
                          value={selectedPolicy}
                          onChange={setSelectedPolicy}
                          options={groupPolicyOptions}
                          optionFilterProp="label"
                          disabled={!isEmployeeSelected} // 🔹 Disable until Employee checked
                        />
                      ) : (
                        <p className={styles.noGroupedPolicyAssigned}>
                          This user is not assigned any Group Policy
                        </p>
                      )}
                    </div>
                  ) : (
                    <>
                      <h5 className={styles.assignedGroupText}>
                        Assigned Group Policy
                      </h5>
                      <div className={styles.assignedGroupMainDiv}>
                        <img
                          src={DarkCrossImg}
                          alt="close"
                          className={styles.closeIcon}
                          onClick={() => setSelectedPolicy(null)}
                        />
                        <label className={styles.assignedGroupLabel}>
                          Group Title
                        </label>
                        <p className={styles.assignedGroupHeading}>
                          {selectedPolicyData.label}
                        </p>
                        <label className={styles.assignedGroupLabel}>
                          Group Description
                        </label>
                        <p className={styles.assignedGroupSubHeading}>
                          {selectedPolicyData.description}
                        </p>
                      </div>
                    </>
                  )}
                </Col>
              </Row>
            </div>
          </div>

          {/* Footer Buttons */}
          <Row justify="end" className={styles.footerActions}>
            <CustomButton
              text="Close"
              className="big-light-button"
              onClick={() => {
                // 🔹 Store unsaved data globally
                setStoreEditRolesAndPoliciesData({
                  UserID: userDetails?.userID,
                  FK_UserStatusID: userStatus,
                  Roles: selectedRoles,
                  GroupPolicies: selectedPolicy ? [selectedPolicy] : [],
                  LastUpdatedBy: loggedInUserID,
                });

                // 🔹 Close current modal, open unsaved changes modal
                setEditrolesAndPoliciesUser(false);
                setUnSavedChangesPoliciesModal(true);
              }}
            />
            <CustomButton
              text="Save Changes"
              className="big-dark-button"
              onClick={onClickSaveOnEditRolesAndPolicies}
            />
          </Row>
        </>
      }
    />
  );
};

export default EditRoleAndPoliciesModal;
