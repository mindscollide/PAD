import React, { useCallback, useEffect, useRef, useState } from "react";
import { Col, Row } from "antd";

// 🔹 Components & Contexts
import { GlobalModal } from "../../../../../components";
import { useMyAdmin } from "../../../../../context/AdminContext";

// 🔹 Icons
import UsernameIcon from "../../../../../assets/img/username.png";
import EmailIcon from "../../../../../assets/img/Email.png";
import EmployeeIdIcon from "../../../../../assets/img/EmployeeId.png";
import DepartmentIcon from "../../../../../assets/img/user-dark-icon.png";
import AvatarIcon from "../../../../../assets/img/avatar-half-name-icon.png";

// 🔹 Styles
import styles from "./requestApprovedRejeectedModal.module.css";
import CustomButton from "../../../../../components/buttons/button";
import TextArea from "antd/es/input/TextArea";
import {
  GetPredefinedReasonsByAdmin,
  ProcessUserRegistrationRequest,
} from "../../../../../api/adminApi";
import { useApi } from "../../../../../context/ApiContext";
import { useGlobalLoader } from "../../../../../context/LoaderContext";
import { useNotification } from "../../../../../components/NotificationProvider/NotificationProvider";
import { useNavigate } from "react-router-dom";

const RequestApprovedRejeectedModal = ({ currentUserData = [] }) => {
  const { callApi } = useApi();
  const { showLoader } = useGlobalLoader();
  const { showNotification } = useNotification();
  const hasFetched = useRef(false);
  const navigate = useNavigate();

  const {
    modaPendingRequestModalOpenAction,
    setModaPendingRequestModalOpenAction,
    typeofAction,
  } = useMyAdmin();

  const [writeNote, setWriteNote] = useState("");
  const [reasons, setReasons] = useState([]);

  // 🔹 Handle textarea input (limit to 500 chars)
  const handleNoteChange = (e) => {
    const value = e.target.value;
    if (value.length <= 500) setWriteNote(value);
  };

  // 🔹 When clicking a reason tag, append it to textarea
  const handleReasonClick = (reason) => {
    setWriteNote((prev) => (prev ? `${prev} ${reason}` : reason));
  };

  // 🔹 Approve action
  const handleApprove = async () => {
    try {
      showLoader(true);
      const requestdata = {
        UserRegistrationRequestIDs:
          typeofAction === 1
            ? currentUserData
            : [currentUserData.userRegistrationRequestID],
        Comment: writeNote,
        FK_UserStatusID: 6, // ✅ Accepted
      };
      console.log("Approved:", requestdata);

      const res = await ProcessUserRegistrationRequest({
        callApi,
        showNotification,
        showLoader,
        requestdata: requestdata,
        navigate,
      });

      if (res) {
        setModaPendingRequestModalOpenAction(false);
        setWriteNote("");
      }
    } catch (error) {
      console.error("Error approving user:", error);
    } finally {
      showLoader(false);
    }
  };

  // 🔹 Decline action
  const handleDecline = async () => {
    console.log("Declined:", {
      user: currentUserData,
      note: writeNote,
    });

    try {
      showLoader(true);
      const requestdata = {
        UserRegistrationRequestID: [currentUserData.userRegistrationRequestID],
        Comment: writeNote,
        FK_UserStatusID: 7, // ✅ Rejected
      };

      const res = await ProcessUserRegistrationRequest({
        callApi,
        showNotification,
        showLoader,
        requestdata: requestdata,
        navigate,
      });

      if (res) {
        setModaPendingRequestModalOpenAction(false);
        setWriteNote("");
      }
    } catch (error) {
      console.error("Error declining user:", error);
    } finally {
      showLoader(false);
    }
  };

  const fetchApiCall = useCallback(async () => {
    showLoader(true);

    const res = await GetPredefinedReasonsByAdmin({
      callApi,
      showNotification,
      showLoader,
      navigate,
    });
    const reasons = Array.isArray(res?.reasons)
      ? res?.reasons.map((item) => item.reason)
      : [];
    setReasons(reasons);
  }, [callApi, navigate, showLoader, showNotification]);

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchApiCall(true, true);
    }
  }, [fetchApiCall]);
  // -----------------------
  // 🔹 Render
  // -----------------------
  return (
    <GlobalModal
      visible={modaPendingRequestModalOpenAction}
      width="1000px"
      centered
      modalHeader={null}
      onCancel={() => setModaPendingRequestModalOpenAction(false)}
      modalBody={
        <div className={styles.modalBodyWrapper}>
          {/* Status Header */}
          {typeofAction === 1 ? (
            <Col span={24}>
              <h5 className={styles.heading}>
                {currentUserData.length} users have requested to sign up on PAD
              </h5>
            </Col>
          ) : (
            <>
              <h5 className={styles.heading}>
                {currentUserData.fullName} has requested to sign up on PAD
              </h5>
              <Col span={24}>
                <div className={styles.detailsOfUser}>
                  <div className={styles.detailsContainer}>
                    <Row style={{ marginBottom: "20px" }}>
                      <Col span={12}>
                        <div className={styles.infoItem}>
                          <img
                            draggable={false}
                            src={UsernameIcon}
                            alt="Username"
                            className={styles.icon}
                          />
                          <span>
                            <span className={styles.InitialHeading}>
                              Username:
                            </span>{" "}
                            <span className={styles.mainTextType}>
                              {currentUserData.loginID}
                            </span>
                          </span>
                        </div>
                      </Col>
                      <Col span={12}>
                        <div className={styles.infoItem}>
                          <img
                            draggable={false}
                            src={EmployeeIdIcon}
                            alt="Employee ID"
                            className={styles.icon}
                          />
                          <span>
                            <span className={styles.InitialHeading}>
                              Employee ID:
                            </span>{" "}
                            <span className={styles.mainTextType}>
                              {currentUserData.userRegistrationRequestID}
                            </span>
                          </span>
                        </div>
                      </Col>
                    </Row>

                    <Row style={{ marginBottom: "20px" }}>
                      <Col span={12}>
                        <div className={styles.infoItem}>
                          <img
                            draggable={false}
                            src={AvatarIcon}
                            alt="First Name"
                            className={styles.icon}
                          />
                          <span className={styles.text}>
                            <span className={styles.InitialHeading}>
                              First Name:
                            </span>{" "}
                            <span className={styles.mainTextType}>
                              {currentUserData.firstName}
                            </span>
                          </span>
                        </div>
                      </Col>
                      <Col span={12}>
                        <div className={styles.infoItem}>
                          <img
                            draggable={false}
                            src={EmailIcon}
                            alt="Email"
                            className={styles.icon}
                          />
                          <span className={styles.text}>
                            <span className={styles.InitialHeading}>
                              Email ID:
                            </span>{" "}
                            <span className={styles.mainTextType}>
                              {currentUserData.email}
                            </span>
                          </span>
                        </div>
                      </Col>
                    </Row>

                    <Row>
                      <Col span={12}>
                        <div className={styles.infoItem}>
                          <img
                            draggable={false}
                            src={AvatarIcon}
                            alt="Last Name"
                            className={styles.icon}
                          />
                          <span className={styles.text}>
                            <span className={styles.InitialHeading}>
                              Last Name:
                            </span>{" "}
                            <span className={styles.mainTextType}>
                              {currentUserData.lastName}
                            </span>
                          </span>
                        </div>
                      </Col>

                      <Col span={12}>
                        <div className={styles.infoItem}>
                          <img
                            draggable={false}
                            src={DepartmentIcon}
                            alt="Department"
                            className={styles.icon}
                          />
                          <span className={styles.text}>
                            <span className={styles.InitialHeading}>
                              Department:
                            </span>{" "}
                            <span className={styles.mainTextType}>
                              {currentUserData.departmentName}
                            </span>
                          </span>
                        </div>
                      </Col>
                    </Row>
                  </div>
                </div>
              </Col>
            </>
          )}

          <Col span={24}>
            <h5 className={styles.subHeading}>
              Write a Note <span className={styles.required}>*</span>
            </h5>
          </Col>

          <Col span={24}>
            <TextArea
              value={writeNote}
              onChange={handleNoteChange}
              rows={4}
              placeholder="Add Note"
              maxLength={500}
              className={styles.textareaField}
            />
          </Col>
          <Col
            span={24}
            style={{
              marginTop: 12,
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
            }}
          >
            {reasons?.map((reason, index) => (
              <div
                key={index}
                onClick={() => handleReasonClick(reason)}
                className={styles.reasonTag}
              >
                {reason}
              </div>
            ))}
          </Col>
          <Row gutter={[10, 10]}>
            <Col span={24} className={styles.mainButtonDivClose}>
              <CustomButton
                text={typeofAction === 1 ? "Decline All" : "Decline"}
                className="Decline-dark-button"
                onClick={handleDecline}
                disabled={!writeNote}
              />
              <CustomButton
                text={typeofAction === 1 ? "Approve All" : "Approved"}
                className="Approved-dark-button"
                onClick={handleApprove}
                disabled={!writeNote}
              />
            </Col>
          </Row>
        </div>
      }
    />
  );
};

export default RequestApprovedRejeectedModal;
