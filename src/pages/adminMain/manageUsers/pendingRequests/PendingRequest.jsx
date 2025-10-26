import React from "react";
import CustomButton from "../../../../components/buttons/button";
import styles from "./PendingRequest.module.css";

// ✅ Imported icons
import UsernameIcon from "../../../../assets/img/username.png";
import EmailIcon from "../../../../assets/img/Email.png";
import EmployeeIdIcon from "../../../../assets/img/EmployeeId.png";
import DepartmentIcon from "../../../../assets/img/user-dark-icon.png"; // Add this if you have it
import { Col, Row } from "antd";

const PendingRequest = ({
  PendingRequestUsername,
  EmailId,
  EmployeeID,
  DepartmentName,
  username,
  onTakeAction,
}) => {
  return (
    <div className={styles.mainPendingRequestDiv}>
      {/* Left Side: User Details */}
      <div className={styles.detailsContainer}>
        <Row style={{ marginBottom: "20px" }}>
          <Col span={16}>
            {/* Name */}
            <h4 className={styles.userName}>{PendingRequestUsername}</h4>
          </Col>
          <Col span={8}>
            <div className={styles.infoItem}>
              <img src={UsernameIcon} alt="Username" className={styles.icon} />
              <span className={styles.text}>
                <span className={styles.InitialName}>Username:</span> {username}
              </span>
            </div>
          </Col>
        </Row>

        <Row>
          <Col span={8}>
            {/* Email*/}
            <div className={styles.infoItem}>
              <img src={EmailIcon} alt="Email" className={styles.icon} />
              <span className={styles.text}>
                {" "}
                <span className={styles.InitialName}>Email ID:</span> {EmailId}
              </span>
            </div>
          </Col>
          <Col span={8}>
            {/*  Employee ID */}
            <div className={styles.infoRow}>
              <div className={styles.infoItem}>
                <img
                  src={EmployeeIdIcon}
                  alt="Employee ID"
                  className={styles.icon}
                />
                <span className={styles.text}>
                  <span className={styles.InitialName}>Employee ID:</span>{" "}
                  {EmployeeID}
                </span>
              </div>
            </div>
          </Col>

          <Col span={8}>
            <div className={styles.infoItem}>
              <img
                src={DepartmentIcon}
                alt="Department"
                className={styles.icon}
              />
              <span className={styles.text}>
                {" "}
                <span className={styles.InitialName}>Department:</span>{" "}
                {DepartmentName}
              </span>
            </div>
          </Col>
        </Row>
      </div>

      {/* Right Side: Action Button */}
      <div className={styles.actionSection}>
        <CustomButton
          text="Take Action"
          className="takeAction-small-dark-button"
          onClick={onTakeAction}
        />
      </div>
    </div>
  );
};

export default PendingRequest;
