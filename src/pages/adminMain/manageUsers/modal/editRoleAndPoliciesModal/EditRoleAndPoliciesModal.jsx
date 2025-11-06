import React, { useState } from "react";
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

const EditRoleAndPoliciesModal = () => {
  const {
    editrolesAndPoliciesUser,
    setEditrolesAndPoliciesUser,
    setUnSavedChangesPoliciesModal,
  } = useGlobalModal();

  // 🔹  Context State of View Detail Modal in which All data store
  const {
    editRoleAndPolicyGroupDropdownData,
    allUserRolesForEditRolePolicyData,
  } = useMyAdmin();

  console.log(
    { editRoleAndPolicyGroupDropdownData, allUserRolesForEditRolePolicyData },
    "editRoleAndPolicyGroupDropdownData"
  );

  const [selectedRoles, setSelectedRoles] = useState([]);
  const [userStatus, setUserStatus] = useState("Active");
  const [selectedPolicy, setSelectedPolicy] = useState(null);

  const groupPolicyOptions =
    editRoleAndPolicyGroupDropdownData?.groupPolicies?.map((policy) => ({
      label: policy.groupTitle,
      value: policy.groupPolicyID,
    })) || [];

  const roles = [
    "Employees",
    "Line Manager",
    "Compliance Officer",
    "Head of transaction approval",
    "Head of compliance approval",
    "Admin",
  ];

  const allRoles = allUserRolesForEditRolePolicyData?.userRoles || [];

  const toggleRole = (roleId) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId]
    );
  };

  const statusOptions = [
    { label: "Active", value: "Active", color: "#00640a" },
    { label: "Disabled", value: "Disabled", color: "#9ca3af" },
    { label: "Dormant", value: "Dormant", color: "#ff4d4f" },
    { label: "Closed", value: "Closed", color: "#000000" },
  ];

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
                  <span className={styles.userName}>Sarah Johnson</span>
                  <Select
                    value={userStatus}
                    onChange={setUserStatus}
                    className={styles.statusDropdown}
                    options={statusOptions.map((status) => ({
                      label: (
                        <span style={{ color: status.color, fontWeight: 600 }}>
                          {status.label}
                        </span>
                      ),
                      value: status.value,
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
                              selectedRoles.includes(role)
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
                  {selectedPolicy !== "Policy & Compliance Alliance" ? (
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
                        />
                      ) : (
                        <p className={styles.noPolicyText}>
                          No Group Policies Available
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
                          Policy Management Hub – Streamlining Compliance,
                          Governance, and Regulatory Best Practices
                        </p>
                        <label className={styles.assignedGroupLabel}>
                          Group Description
                        </label>
                        <p className={styles.assignedGroupSubHeading}>
                          The Policy Management Hub is a dedicated platform for
                          creating, reviewing, and maintaining organizational
                          policies. This group brings together compliance
                          officers, managers, and stakeholders to ensure
                          consistent governance and adherence to regulatory
                          standards.
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
                setEditrolesAndPoliciesUser(false);
                setUnSavedChangesPoliciesModal(true);
              }}
            />
            <CustomButton text="Save Changes" className="big-dark-button" />
          </Row>
        </>
      }
    />
  );
};

export default EditRoleAndPoliciesModal;
