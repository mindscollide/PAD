import React, { useCallback, useEffect, useRef, useState } from "react";
import { Col, Row } from "antd";

// 🔹 Components & Contexts
import { GlobalModal } from "../../../../../components";
import { useGlobalModal } from "../../../../../context/GlobalModalContext";

// 🔹 Styles
import styles from "./ViewDetailsOfRejectedRequestModal.module.css";
import CustomButton from "../../../../../components/buttons/button";
import { useMyAdmin } from "../../../../../context/AdminContext";
import Profile2 from "../../../../../assets/img/Profile2.png";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../../../../../components/NotificationProvider/NotificationProvider";
import { useGlobalLoader } from "../../../../../context/LoaderContext";
import { useApi } from "../../../../../context/ApiContext";
import { GetUserRegistrationHistoryByLoginID } from "../../../../../api/adminApi";
import { formatApiDateTime } from "../../../../../common/funtions/rejex";

const ViewDetailsOfRejectedRequestModal = () => {
  // 🔷 Context Hooks
  const navigate = useNavigate();
  const hasFetched = useRef(false);

  // 🔹 Context Hooks
  const { showNotification } = useNotification();
  const { showLoader } = useGlobalLoader();
  const { callApi } = useApi();
  const { viewDetailRejectedModal, setViewDetailRejectedModal } =
    useGlobalModal();

  // 🔹  Context State of View Detail Modal in which All data store
  const {
    manageUsersViewDetailModalData,
    currentID,
    setCurrentID,
    resetIDofUserRejectedViewDetails,
  } = useMyAdmin();
  const [detailsData, setDetailsData] = useState([]);

  const fetchApiCall = useCallback(
    async (requestdata) => {
      if (!requestdata || typeof requestdata !== "object") return;

      try {
        showLoader(true);

        const res = await GetUserRegistrationHistoryByLoginID({
          callApi,
          showNotification,
          showLoader,
          requestdata,
          navigate,
        });

        // ✅ Fix: Corrected typo and safely extract reasons
        console.log("reasonsArray", res);
        const reasonsArray = Array.isArray(res?.registrationHistory) ? res : [];
        console.log("reasonsArray", reasonsArray);
        // 🔹 Set to state (if you have `setReasons`)
        setDetailsData(reasonsArray);
      } catch (error) {
        console.error("Error fetching registration history:", error);
        showNotification("error", "Failed to fetch registration history");
      } finally {
        showLoader(false);
      }
    },
    [callApi, navigate, showLoader, showNotification]
  );

  useEffect(() => {
    if (!hasFetched.current) {
      if (currentID) {
        hasFetched.current = true;
        const requestdata = {
          LoginID: currentID,
        };
        fetchApiCall(requestdata);
      }
    }
  }, [fetchApiCall, currentID]);

  useEffect(() => {
    // 🔹 Mount logic (runs when component loads)
    console.log("Component mounted");

    return () => {
      // 🔹 Unmount logic (runs when component is removed)
      console.log("Component unmounted");

      // Example cleanup:
      // setDetailsData([]);
      // setCurrentID(-1);
      // setViewDetailRejectedModal(false);
    };
  }, []);
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
                  Review Notes ({detailsData?.employeeName})
                </h5>
              </Col>
            </Row>

            <div className={styles.reviewNotesChildContainer}>
              {detailsData?.registrationHistory?.length > 0 && (
                <div
                  className={
                    detailsData.registrationHistory.length === 1
                      ? styles.singleItemContainer
                      : styles.lineConnector /* only set lineConnector when >1 */
                  }
                >
                  {detailsData.registrationHistory.map((item, index) => (
                    <div
                      key={index}
                      className={
                        index === detailsData.registrationHistory.length - 1
                          ? styles.lastItem
                          : styles.itemWithConnector
                      }
                    >
                      <Row>
                        <Col span={24} className={styles.headerImgText}>
                          <img src={Profile2} width="30" height="30" />
                          <span className={styles.RejectedHeading}>
                            Rejected by:{" "}
                          </span>
                          <span className={styles.fullNameHeadingText}>
                            {item.adminFullName}
                          </span>
                        </Col>
                      </Row>

                      <div className={styles.insideColoredDiv}>
                        <Row>
                          <Col span={12} className={styles.requestedDateText}>
                            Request Date:{" "}
                            {formatApiDateTime(
                              `${item?.requestedDate || ""} ${
                                item?.requestedTime || ""
                              }`
                            ) || "—"}
                          </Col>
                          <Col span={12} className={styles.requestedDateText}>
                            Rejected Date:{" "}
                            {formatApiDateTime(
                              `${item?.rejectedDate || ""} ${
                                item?.rejectedTime || ""
                              }`
                            ) || "—"}
                          </Col>
                        </Row>

                        <Row>
                          <Col span={24} className={styles.subMainText}>
                            {item.comments}
                          </Col>
                        </Row>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <Row>
            <Col span={24} className={styles.mainButtonSpan}>
              <CustomButton
                text={"Close"}
                className="big-light-button"
                onClick={() => {
                  setViewDetailRejectedModal(false);
                  setDetailsData([]);
                  setCurrentID(-1);
                }}
              />
            </Col>
          </Row>
        </>
      }
    />
  );
};

export default ViewDetailsOfRejectedRequestModal;
