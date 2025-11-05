import React, { useState } from "react";
import { Col, Row } from "antd";

// 🔹 Components & Contexts
import { GlobalModal } from "../../../../../components";
import { useGlobalModal } from "../../../../../context/GlobalModalContext";

// 🔹 Styles
import styles from "./ViewDetailsOfRejectedRequestModal.module.css";
import CustomButton from "../../../../../components/buttons/button";
import { useMyAdmin } from "../../../../../context/AdminContext";
import Profile2 from "../../../../../assets/img/Profile2.png";

const ViewDetailsOfRejectedRequestModal = () => {
  // 🔷 Context Hooks

  const { viewDetailRejectedModal, setViewDetailRejectedModal } =
    useGlobalModal();

  // 🔹  Context State of View Detail Modal in which All data store
  const { manageUsersViewDetailModalData } = useMyAdmin();

  // 🔹 Example data (replace with your real data)
  const rejectionList = [
    {
      rejectedBy: "Syed Muhammad Ali Shah",
      requestDate: "06-10-22",
      rejectedDate: "06-10-22",
      message:
        "After reviewing your information, we were unable to verify the details provided. Unfortunately, this means we cannot approve your sign-up request at this time. Please check your information and try again.",
    },
    {
      rejectedBy: "Usman Tariq Qureshi",
      requestDate: "06-09-22",
      rejectedDate: "16-09-22",
      message:
        "It appears that an account with your information already exists in our system. To avoid duplicates, we are unable to approve a new sign-up request.",
    },
    {
      rejectedBy: "Usman Tariq Qureshi",
      requestDate: "06-09-22",
      rejectedDate: "16-09-22",
      message:
        "It appears that an account with your information already exists in our system. To avoid duplicates, we are unable to approve a new sign-up request.",
    },
    {
      rejectedBy: "Usman Tariq Qureshi",
      requestDate: "06-09-22",
      rejectedDate: "16-09-22",
      message:
        "It appears that an account with your information already exists in our system. To avoid duplicates, we are unable to approve a new sign-up request.",
    },
  ];

  // -----------------------
  // 🔹 Render
  // -----------------------
  return (
    <GlobalModal
      visible={viewDetailRejectedModal}
      width="1428px"
      centered
      modalHeader={null}
      onCancel={() => setViewDetailRejectedModal(false)}
      modalBody={
        <>
          <div className={styles.modalBodyWrapper}>
            <Row>
              <Col span={24}>
                <h5 className={styles.viewManageUserDetailHeading}>
                  Review Notes (Faheem Arif)
                </h5>
              </Col>
            </Row>

            <div className={styles.reviewNotesChildContainer}>
              <div className={styles.lineConnector}>
                {rejectionList.map((item, index) => (
                  <div key={index}>
                    {/* Profile Image + Connector */}
                    <div>
                      {index !== rejectionList.length - 1 && (
                        <div className={styles.verticalLine}></div>
                      )}
                    </div>

                    {/* Content */}
                    <div>
                      <Row>
                        <Col span={24} className={styles.headerImgText}>
                          <img src={Profile2} width="30" height="30" />

                          <span className={styles.RejectedHeading}>
                            Rejected by:{" "}
                          </span>
                          <span className={styles.fullNameHeadingText}>
                            {item.rejectedBy}
                          </span>
                        </Col>
                      </Row>

                      <div className={styles.insideColoredDiv}>
                        <Row>
                          <Col span={12} className={styles.requestedDateText}>
                            Request Date: {item.requestDate}
                          </Col>
                          <Col span={12} className={styles.requestedDateText}>
                            Rejected Date: {item.rejectedDate}
                          </Col>
                        </Row>

                        <Row>
                          <Col span={24} className={styles.subMainText}>
                            {item.message}
                          </Col>
                        </Row>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Row>
            <Col span={24} className={styles.mainButtonSpan}>
              <CustomButton
                text={"Close"}
                className="big-light-button"
                onClick={() => setViewDetailRejectedModal(false)}
              />
            </Col>
          </Row>
        </>
      }
    />
  );
};

export default ViewDetailsOfRejectedRequestModal;
