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

const RolesAndPoliciesModal = () => {
  const {
    rolesAndPoliciesManageUser,
    setRolesAndPoliciesManageUser,
    setEditrolesAndPoliciesUser,
  } = useGlobalModal();

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
                          Sarah Johnson
                        </label>
                        <label className={styles.UserStatusesClass}>
                          User Status:{" "}
                          <span className={styles.userStatusActive}>
                            Active
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
                          <Tag className={styles.tagClasses}>Employee</Tag>
                          <Tag className={styles.tagClasses}>
                            Line Manager
                          </Tag>{" "}
                          <Tag className={styles.tagClasses}>
                            Compliance Officer
                          </Tag>
                          <Tag className={styles.tagClasses}>
                            Head of Approver
                          </Tag>
                          <Tag className={styles.tagClasses}>
                            Head of compliance approval
                          </Tag>
                          <Tag className={styles.tagClasses}>
                            Head of compliance approval
                          </Tag>
                        </div>
                      </div>
                    </div>
                  </Col>
                  <Col span={13}>
                    <h5 className={styles.assignedGroupText}>
                      Assigned Group Policy
                    </h5>
                    <div className={styles.assignedGroupMainDiv}>
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
                        standards. Members can collaborate to update existing
                        policies, develop new frameworks, track approvals, and
                        share best practices.
                      </p>
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
                  onClick={() => {
                    setRolesAndPoliciesManageUser(false);
                    setEditrolesAndPoliciesUser(true);
                  }}
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
