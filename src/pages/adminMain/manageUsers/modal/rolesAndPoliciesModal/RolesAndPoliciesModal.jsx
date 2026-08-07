import React, { useState } from "react";
import { Col, Row, Tag } from "antd";

// 🔹 Components & Contexts
import { GlobalModal } from "../../../../../components";
import { useGlobalModal } from "../../../../../context/GlobalModalContext";

// 🔹 Utils & APIs
import Profile2 from "../../../../../assets/img/Profile2.png";

// 🔹 Styles
import styles from "./RolesAndPoliciesModal.module.css";
import CustomButton from "../../../../../components/buttons/button";
import { useMyAdmin } from "../../../../../context/AdminContext";
import {
  GetAllExistingGroupDataRequest,
  GetAllUserRolesDataRequest,
} from "../../../../../api/adminApi";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../../../../../components/NotificationProvider/NotificationProvider";
import { useGlobalLoader } from "../../../../../context/LoaderContext";
import { useApi } from "../../../../../context/ApiContext";

const RolesAndPoliciesModal = () => {
  const navigate = useNavigate();

  // 🔷 Context Hooks
  const { showNotification } = useNotification();
  const { showLoader } = useGlobalLoader();
  const { callApi } = useApi();
  // 🔹  Context State of View Detail Modal in which All data store
  const {
    roleAndPolicyViewDetailData,
    setEditRoleAndPolicyGroupDropdownData,
    setAllUserRolesForEditRolePolicyData,
  } = useMyAdmin();

  console.log(
    roleAndPolicyViewDetailData,
    "roleAndPolicyViewDetailDataroleAndPolicyViewDetailData"
  );
  const {
    rolesAndPoliciesManageUser,
    setRolesAndPoliciesManageUser,
    setEditrolesAndPoliciesUser,
  } = useGlobalModal();

  // 🔹 Local button spinner for "Edit Roles & Policies" - was flashing the
  // main/global loader while its 2 lookups ran; a local spinner on the
  // button itself is less disruptive for something this scoped.
  const [isEditRolesButtonLoading, setIsEditRolesButtonLoading] =
    useState(false);

  /** 🔹 on Click On Edit Button In ComplianceOfficer Dropdown in view detail modal of manage User users Tab*/
  // Uses a local button spinner instead of the main/global loader while
  // these two lookups run, then opens the Edit modal.
  const onClickOfEditRolesAndPolicyButton = async () => {
    setIsEditRolesButtonLoading(true);
    try {
      let res = await GetAllExistingGroupDataRequest({
        callApi,
        showNotification,
        showLoader,
        setRolesAndPoliciesManageUser,
        setEditrolesAndPoliciesUser,
        navigate,
      });

      if (res) {
        // Edit Role And Policy Group And Policy Dropdown State
        setEditRoleAndPolicyGroupDropdownData(res);
      }

      let res2 = await GetAllUserRolesDataRequest({
        callApi,
        showNotification,
        showLoader,
        setRolesAndPoliciesManageUser,
        setEditrolesAndPoliciesUser,
        navigate,
      });

      if (res2) {
        // Edit Role And Policy Group And Policy Dropdown State
        setAllUserRolesForEditRolePolicyData(res2);
      }
    } finally {
      setIsEditRolesButtonLoading(false);
    }
  };

  // -----------------------
  // 🔹 Render
  // -----------------------
  return (
    <>
      <GlobalModal
        visible={rolesAndPoliciesManageUser}
        width="1296px"
        centered
        modalHeader={null}
        onCancel={() => setRolesAndPoliciesManageUser(false)}
        modalBody={
          <>
            <div className={styles.modalBodyRoleAndPoliciesWrapper}>
              <Row>
                <Col span={24}>
                  <h5 className={styles.roleAndPoliciesHeading}>
                    Roles & Policies
                  </h5>
                </Col>
              </Row>

              <div className={styles.roleAndPoliciesMainDiv}>
                <Row>
                  <Col span={11}>
                    {/* For Image and text on roles and Policies Div */}
                    <div className={styles.BackgroundOfImgAndText}>
                      <img src={Profile2} height={95} width={95} />
                      <div className={styles.nameContainer}>
                        <label className={styles.FullUserName}>
                          {roleAndPolicyViewDetailData?.userDetails?.fullName}
                        </label>
                        <label className={styles.UserStatusesClass}>
                          User Status:{" "}
                          <span className={styles.userStatusActive}>
                            {roleAndPolicyViewDetailData?.userDetails
                              ?.userStatusID === 1
                              ? "Active"
                              : roleAndPolicyViewDetailData?.userDetails
                                  ?.userStatusID === 2
                              ? "Disabled"
                              : roleAndPolicyViewDetailData?.userDetails
                                  ?.userStatusID === 3
                              ? "Closed"
                              : roleAndPolicyViewDetailData?.userDetails
                                  ?.userStatusID === 4
                              ? "Dormant"
                              : roleAndPolicyViewDetailData?.userDetails
                                  ?.userStatusID === 5
                              ? "Registration request pending"
                              : roleAndPolicyViewDetailData?.userDetails
                                  ?.userStatusID === 6
                              ? "Registration request accepted"
                              : roleAndPolicyViewDetailData?.userDetails
                                  ?.userStatusID === 7
                              ? "Registration request rejected"
                              : "NonActive"}
                          </span>
                        </label>
                      </div>
                    </div>

                    {/* For Tags on roles and Policies Div */}
                    <div className={styles.BackgroundOfImgAndText}>
                      <div className={styles.backgrounColorOfBrokerDetail}>
                        <label className={styles.viewDetailMainLabels}>
                          Roles
                        </label>
                        <div className={styles.tagContainer}>
                          {roleAndPolicyViewDetailData?.userDetails?.assignedRoles
                            ?.split(",") // Split string by comma
                            .map((role, index) => (
                              <Tag key={index} className={styles.tagClasses}>
                                {role.trim()}{" "}
                                {/* Remove any leading/trailing spaces */}
                              </Tag>
                            ))}
                        </div>
                      </div>
                    </div>
                  </Col>
                  <Col span={13}>
                    <h5 className={styles.assignedGroupText}>
                      Assigned Group Policy
                    </h5>
                    <div className={styles.assignedGroupMainDiv}>
                      {roleAndPolicyViewDetailData?.assignedGroupPolicies
                        ?.length > 0 ? (
                        roleAndPolicyViewDetailData.assignedGroupPolicies.map(
                          (policy) => (
                            <div
                              key={policy.groupPolicyID}
                              className={styles.assignedGroupItem}
                            >
                              <label className={styles.assignedGroupLabel}>
                                Group Title
                              </label>
                              <p className={styles.assignedGroupHeading}>
                                {policy.groupTitle}
                              </p>

                              <label className={styles.assignedGroupLabel}>
                                Group Description
                              </label>
                              <p className={styles.assignedGroupSubHeading}>
                                {policy.groupDescription}
                              </p>
                            </div>
                          )
                        )
                      ) : (
                        <p className={styles.noGroupedPolicyAssigned}>
                          This user is not assigned any Group Policy
                        </p>
                      )}
                    </div>
                  </Col>
                </Row>
              </div>
            </div>
            <Row>
              <Col span={23} className={styles.mainButtonDivClose}>
                <CustomButton
                  text={"Edit Roles & Policies"}
                  className="big-light-button"
                  onClick={onClickOfEditRolesAndPolicyButton}
                  loading={isEditRolesButtonLoading}
                />
                <CustomButton
                  text={"Close"}
                  className="big-light-button"
                  onClick={() => setRolesAndPoliciesManageUser(false)}
                />
              </Col>
            </Row>
          </>
        }
      />
    </>
  );
};

export default RolesAndPoliciesModal;
