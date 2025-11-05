import React, { useCallback, useEffect, useRef, useState } from "react";
import CustomButton from "../../../../components/buttons/button";
import styles from "./PendingRequest.module.css";

// ✅ Imported icons
import UsernameIcon from "../../../../assets/img/username.png";
import EmailIcon from "../../../../assets/img/Email.png";
import EmployeeIdIcon from "../../../../assets/img/EmployeeId.png";
import DepartmentIcon from "../../../../assets/img/user-dark-icon.png";
import { Col, Row } from "antd";
import { useGlobalLoader } from "../../../../context/LoaderContext";
import { SearchPendingUserRegistrationRequests } from "../../../../api/adminApi";
import { useApi } from "../../../../context/ApiContext";
import { useNotification } from "../../../../components/NotificationProvider/NotificationProvider";
import { useNavigate } from "react-router-dom";
import { useMyAdmin } from "../../../../context/AdminContext";
import { useSearchBarContext } from "../../../../context/SearchBarContaxt";
import { buildApiRequest } from "./utils";
import EmptyState from "../../../../components/emptyStates/empty-states";

const PendingRequest = ({ currentUserData, setCurrentUserData }) => {
  const { callApi } = useApi();
  const { showLoader } = useGlobalLoader();
  const { showNotification } = useNotification();
  const hasFetched = useRef(false);
  const navigate = useNavigate();
  const {
    manageUsersPendingTabData,
    setManageUsersPendingTabData,
    resetManageUsersPendingTabDataState,
    setModaPendingRequestModalOpenAction,
    manageUsersPendingTabMqtt,
    setManageUsersPendingTabMqtt,
    setTypeofAction,
  } = useMyAdmin();

  const { pendingRequestsTabSearch, setPendingRequestsTabSearch } =
    useSearchBarContext();

  const [loadingMore, setLoadingMore] = useState(false); // 👈 to control Spin

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

        const pendingRequests = Array.isArray(res?.pendingRequests)
          ? res.pendingRequests
          : [];
        if (replace) {
          setManageUsersPendingTabData(pendingRequests);
        } else {
          setManageUsersPendingTabData((prev) => [...prev, ...pendingRequests]);
        }
      } catch (err) {
        console.error("❌ Error fetching portfolio:", err);
      } finally {
        showLoader(false);
        setLoadingMore(false);
      }
    },
    [callApi, showNotification, showLoader, navigate]
  );
  // Initial Fetch
  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      const requestData = buildApiRequest(pendingRequestsTabSearch);
      fetchApiCall(requestData, true, true);
    }
  }, [buildApiRequest, pendingRequestsTabSearch, fetchApiCall]);

  useEffect(() => {
    console.log("Component mounted");

    return () => {
      resetManageUsersPendingTabDataState();
    };
  }, []);

  const onTakeAction = async (data) => {
    try {
      // your async logic here
      await setCurrentUserData(data);
      setTypeofAction(2);
      setModaPendingRequestModalOpenAction(true);
      // Example: await an API call
      // await someAsyncFunction();
    } catch (error) {
      console.error("Error performing bulk action:", error);
    }
  };

  useEffect(() => {
    if (pendingRequestsTabSearch.filterTrigger) {
      const req = buildApiRequest(pendingRequestsTabSearch);

      fetchApiCall(req, true);
      setPendingRequestsTabSearch((prev) => ({
        ...prev,
        filterTrigger: false,
      }));
    }
  }, [pendingRequestsTabSearch.filterTrigger]);

  useEffect(() => {
    if (manageUsersPendingTabMqtt) {
      const req = buildApiRequest(pendingRequestsTabSearch);

      fetchApiCall(req, false);
      setPendingRequestsTabSearch((prev) => ({
        ...prev,
        filterTrigger: false,
      }));
      setManageUsersPendingTabMqtt(false);
    }
  }, [manageUsersPendingTabMqtt]);

  return (
    <div
      className={styles.scrollContainer}
    >
      {manageUsersPendingTabData?.length > 0 ? (
        manageUsersPendingTabData.map((data, index) => (
          <Col span={24}>
            <div key={index} className={styles.mainPendingRequestDiv}>
              {/* Left Side: User Details */}
              <div className={styles.detailsContainer}>
                <Row style={{ marginBottom: "20px" }}>
                  <Col span={16}>
                    <h4 className={styles.userName}>{data.fullName}</h4>
                  </Col>
                  <Col span={8}>
                    <div className={styles.infoItem}>
                      <img
                        draggable={false}
                        src={UsernameIcon}
                        alt="Username"
                        className={styles.icon}
                      />
                      <span className={styles.text}>
                        <span className={styles.InitialName}>Username:</span>{" "}
                        {data.loginID}
                      </span>
                    </div>
                  </Col>
                </Row>

                <Row>
                  <Col span={8}>
                    <div className={styles.infoItem}>
                      <img
                        draggable={false}
                        src={EmailIcon}
                        alt="Email"
                        className={styles.icon}
                      />
                      <span className={styles.text}>
                        <span className={styles.InitialName}>Email ID:</span>{" "}
                        {data.email}
                      </span>
                    </div>
                  </Col>

                  <Col span={8}>
                    <div className={styles.infoItem}>
                      <img
                        draggable={false}
                        src={EmployeeIdIcon}
                        alt="Employee ID"
                        className={styles.icon}
                      />
                      <span className={styles.text}>
                        <span className={styles.InitialName}>Employee ID:</span>{" "}
                        {data.userRegistrationRequestID}
                      </span>
                    </div>
                  </Col>

                  <Col span={8}>
                    <div className={styles.infoItem}>
                      <img
                        draggable={false}
                        src={DepartmentIcon}
                        alt="Department"
                        className={styles.icon}
                      />
                      <span className={styles.text}>
                        <span className={styles.InitialName}>Department:</span>{" "}
                        {data.departmentName}
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
                  onClick={() => onTakeAction(data)}
                />
              </div>
            </div>
          </Col>
        ))
      ) : (
        <div className={styles.emptyState}>
          <EmptyState type={"pending"} />
        </div>
      )}
    </div>
  );
};

export default PendingRequest;
