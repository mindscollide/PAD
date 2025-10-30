import React, { useState } from "react";
import { Col, Row, Tag } from "antd";

// 🔹 Components & Contexts
import { GlobalModal, InstrumentSelect } from "../../../../../components";
import { useGlobalModal } from "../../../../../context/GlobalModalContext";

// 🔹 Utils & APIs
import Profile2 from "../../../../../assets/img/Profile2.png";
import EditIcon from "../../../../../assets/img/EditIcon.png";

// 🔹 Styles
import styles from "./ViewDetailManageUserModal.module.css";
import CustomButton from "../../../../../components/buttons/button";

const ViewDetailManageUserModal = () => {
  const {
    viewDetailManageUser,
    setViewDetailManageUser,
    setRolesAndPoliciesManageUser,
  } = useGlobalModal();

  const [isEditOpen, setIsEditOpen] = useState(false);

  // -----------------------
  // 🔹 Render
  // -----------------------
  return (
    <GlobalModal
      visible={viewDetailManageUser}
      width="1428px"
      centered
      modalHeader={null}
      onCancel={() => setViewDetailManageUser(false)}
      modalBody={
        <div className={styles.modalBodyWrapper}>
          {/* Status Header */}
          <Row>
            <Col span={24}>
              <h5 className={styles.viewManageUserDetailHeading}>
                View Details
              </h5>
            </Col>
          </Row>

          <Row gutter={[4, 4]}>
            <Col span={8}>
              <div className={styles.backgroundColorOfInstrumentDetailApproved}>
                <img
                  src={Profile2}
                  height={54}
                  width={54}
                  className={styles.profileImg}
                />
                <div className={styles.nameContainer}>
                  <label className={styles.viewDetailMainLabels}>
                    Full Name
                  </label>
                  <label className={styles.viewDetailSubLabels}>
                    Sarah Johnson
                  </label>
                </div>
              </div>
            </Col>
            <Col span={8}>
              <div className={styles.backgrounColorOfApprovedDetail}>
                <label className={styles.viewDetailMainLabels}>
                  Employee ID
                </label>
                <label className={styles.viewDetailSubLabels}>U003</label>
              </div>
            </Col>
            <Col span={8}>
              <div className={styles.backgrounColorOfApprovedDetail}>
                <label className={styles.viewDetailMainLabels}>Status</label>
                <label className={styles.viewDetailSubLabels}>Active</label>
              </div>
            </Col>
          </Row>

          <Row gutter={[4, 4]} style={{ marginTop: "3px" }}>
            <Col span={8}>
              <div className={styles.backgrounColorOfApprovedDetail}>
                <label className={styles.viewDetailMainLabels}>
                  Department
                </label>
                <label className={styles.viewDetailSubLabels}>Department</label>
              </div>
            </Col>
            <Col span={8}>
              <div className={styles.backgrounColorOfApprovedDetail}>
                <label className={styles.viewDetailMainLabels}>Email</label>
                <label className={styles.viewDetailSubLabels}>
                  sarahjohn@example.com
                </label>
              </div>
            </Col>
            <Col span={8}>
              <div className={styles.backgrounColorOfApprovedDetail}>
                <label className={styles.viewDetailMainLabels}>
                  Member Since
                </label>
                <label className={styles.viewDetailSubLabels}>2024-10-01</label>
              </div>
            </Col>
          </Row>

          <Row gutter={[4, 4]} style={{ marginTop: "3px" }}>
            <Col span={8}>
              <div className={styles.backgrounColorOfApprovedDetail}>
                <label className={styles.viewDetailMainLabels}>
                  Last Loging
                </label>
                <label className={styles.viewDetailSubLabels}>
                  2024-10-15 | 09:46 pm
                </label>
              </div>
            </Col>
            <Col span={16}>
              <div className={styles.backgrounColorOfApprovedDetail}>
                <label className={styles.viewDetailMainLabels}>
                  Assigned Policy Group:
                </label>
                <label className={styles.viewDetailSubLabels}>
                  Policy Management Hub – Streamlining Compliance, Governance,
                  and Regulatory.
                </label>
              </div>
            </Col>
          </Row>

          <Row gutter={[4, 4]} style={{ marginTop: "3px" }}>
            <Col span={24}>
              <div className={styles.backgrounColorOfBrokerDetail}>
                <label className={styles.viewDetailMainLabels}>Roles</label>
                <div className={styles.tagContainer}>
                  <Tag className={styles.tagClasses}>
                    AKD Securities Limited
                  </Tag>
                  <Tag className={styles.tagClasses}>
                    K-Trade Securities Ltd
                  </Tag>{" "}
                  <Tag className={styles.tagClasses}>
                    Approval Routing Rules
                  </Tag>
                </div>
              </div>
            </Col>
          </Row>

          {isEditOpen ? (
            <>
              <Row style={{ marginTop: "3px" }}>
                <Col span={24}>
                  <div className={styles.complianceCard}>
                    <h4 className={styles.cardTitle}>Line Manager</h4>
                  </div>

                  <div className={styles.editMainDiv}>
                    <label className={styles.instrumentLabel}>Name:</label>
                    <InstrumentSelect
                      data={[]}
                      value={null}
                      className={styles.selectinstrumentclass}
                    />

                    <div className={styles.mainButtonDivClose}>
                      <CustomButton
                        text="Cancel"
                        className="big-light-button"
                        onClick={() => setIsEditOpen(false)}
                      />
                      <CustomButton text="Save" className="big-dark-button" />
                    </div>
                  </div>
                </Col>
              </Row>
            </>
          ) : (
            <>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <div className={styles.complianceCard}>
                    <h4 className={styles.cardTitle}>Line Manager</h4>

                    <div className={styles.LMcardContent}>
                      <Row gutter={16} align="middle">
                        {/* Left Column */}
                        <Col span={12}>
                          <div className={styles.infoBlock}>
                            <label className={styles.infoLabel}>
                              Name: Mr. John Doe
                            </label>
                            <div className={styles.infoSubLabel}>
                              Email: john.doe@example.com
                            </div>
                          </div>
                        </Col>

                        {/* Right Column */}
                        <Col span={11}>
                          <div className={styles.infoBlock}>
                            <label className={styles.infoLabel}>ID: U006</label>
                            <div className={styles.infoSubLabel}>
                              Department: Information Technology
                            </div>
                          </div>
                        </Col>

                        {/* Edit Icon */}
                        <Col span={1} className={styles.iconCol}>
                          <img
                            src={EditIcon}
                            onClick={() => setIsEditOpen(true)}
                          />
                        </Col>
                      </Row>
                    </div>
                  </div>
                </Col>

                <Col span={12}>
                  <div className={styles.complianceCard}>
                    <h4 className={styles.cardTitle}>Compliance Officer</h4>
                    <div className={styles.cardContent}>
                      <Row gutter={16} align="middle">
                        {/* Left Column */}
                        <Col span={12}>
                          <div className={styles.infoBlock}>
                            <label className={styles.infoLabel}>
                              Name: Mr. John Doe
                            </label>
                            <div className={styles.infoSubLabel}>
                              Email: john.doe@example.com
                            </div>
                          </div>
                        </Col>

                        {/* Right Column */}
                        <Col span={11}>
                          <div className={styles.infoBlock}>
                            <label className={styles.infoLabel}>ID: U006</label>
                            <div className={styles.infoSubLabel}>
                              Department: Information Technology
                            </div>
                          </div>
                        </Col>

                        {/* Edit Icon */}
                        <Col span={1} className={styles.iconCol}>
                          <img src={EditIcon} />
                        </Col>
                      </Row>
                    </div>
                  </div>
                </Col>
              </Row>

              <Row>
                <Col span={24} className={styles.mainButtonDivClose}>
                  <CustomButton
                    text={"Roles & Policies"}
                    className="big-light-button"
                    onClick={() => {
                      setViewDetailManageUser(false);
                      setRolesAndPoliciesManageUser(true);
                    }}
                  />
                  <CustomButton
                    text={"Close"}
                    className="big-light-button"
                    onClick={() => setViewDetailManageUser(false)}
                  />
                </Col>
              </Row>
            </>
          )}
        </div>
      }
    />
  );
};

export default ViewDetailManageUserModal;
