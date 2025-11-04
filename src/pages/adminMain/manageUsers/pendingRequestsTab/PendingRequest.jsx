import React, { useCallback, useEffect, useRef, useState } from "react";
import CustomButton from "../../../../components/buttons/button";
import styles from "./PendingRequest.module.css";

// ✅ Imported icons
import UsernameIcon from "../../../../assets/img/username.png";
import EmailIcon from "../../../../assets/img/Email.png";
import EmployeeIdIcon from "../../../../assets/img/EmployeeId.png";
import DepartmentIcon from "../../../../assets/img/user-dark-icon.png"; // Add this if you have it
import { Col, Row } from "antd";
import { buildApiRequest } from "../../../main/headOfComplianceOffice/escalatedVerifications/escalatedVerification/util";
import { useGlobalLoader } from "../../../../context/LoaderContext";
import { SearchPendingUserRegistrationRequests } from "../../../../api/adminApi";
import { useApi } from "../../../../context/ApiContext";
import { useNotification } from "../../../../components/NotificationProvider/NotificationProvider";
import { useNavigate } from "react-router-dom";
import { useMyAdmin } from "../../../../context/AdminContext";
import { useSearchBarContext } from "../../../../context/SearchBarContaxt";

const PendingRequest = ({
  PendingRequestUsername,
  EmailId,
  EmployeeID,
  DepartmentName,
  username,
  onTakeAction,
}) => {
  const { callApi } = useApi();
  const { showLoader } = useGlobalLoader();
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  const [hasMore, setHasMore] = useState(true); // ✅ track if more data exists
  const [loadingMore, setLoadingMore] = useState(false);

  const didFetchRef = useRef(false);
  const listRef = useRef(null); // ✅ scroll container ref
  const {
    manageUsersPendingTabData,
    setManageUsersPendingTabData,
    resetManageUsersPendingTabDataState,
  } = useMyAdmin();

  const { pendingRequestsTabSearch, setPendingRequestsTabSearch } =
    useSearchBarContext();

  const fetchApiCall = useCallback(
    async (requestData, replace = false) => {
      if (!requestData || typeof requestData !== "object") return;

      if (!replace) setLoadingMore(true);
      else showLoader(true);

      try {
        const res = await SearchPendingUserRegistrationRequests({
          callApi,
          showNotification,
          showLoader,
          requestdata: requestData,
          navigate,
        });

        const instruments = Array.isArray(res?.instruments)
          ? res.instruments
          : [];
        if (replace) {
          setManageUsersPendingTabData(instruments);
        } else {
          setManageUsersPendingTabData((prev) => [...prev, ...instruments]);
        }

        // ✅ Save totalRecords from API
        const total = Number(res?.totalRecords || 0);

        // ✅ Disable scrolling if we've loaded everything
        setHasMore(requestData.PageNumber + instruments.length < total);
      } catch (err) {
        console.error("❌ Error fetching portfolio:", err);
      } finally {
        showLoader(false);
        setLoadingMore(false);
      }
    },
    [callApi, showNotification, showLoader, navigate]
  );

  // ✅ initial load
  useEffect(() => {
    if (didFetchRef.current) return;
    didFetchRef.current = true;

    const req = buildApiRequest(pendingRequestsTabSearch);

    fetchApiCall(req, true);
  }, [fetchApiCall]);

  useEffect(() => {
    console.log("Component mounted");

    return () => {
      resetManageUsersPendingTabDataState();
    };
  }, []);

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
