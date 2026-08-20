import React, { useEffect, useState } from "react";
import { Row, Col, Avatar } from "antd";
import { UserOutlined } from "@ant-design/icons";
import styles from "./MyProfileModal.module.css";
import { GlobalModal } from "../../../components";
import CustomButton from "../../../components/buttons/button";
import { useDashboardContext } from "../../../context/dashboardContaxt";
import { useNotification } from "../../../components/NotificationProvider/NotificationProvider";
import { useGlobalLoader } from "../../../context/LoaderContext";
import { useApi } from "../../../context/ApiContext";
import { useNavigate } from "react-router-dom";
import { GetMyProfileRequest } from "../../../api/dashboardApi";

/**
 * MyProfileModal
 * ---------------
 * Read-only display of the logged-in user's profile, per SRS "My Profile":
 * Profile picture, Full name, Employee ID, Phone, Address, Email,
 * Department name, Line manager name/email, Compliance officer name/email.
 * On click "Close", closes the modal and returns to the previous screen.
 */

// Fields that genuinely may be null (no edit UI exists yet for
// phone/address, no upload mechanism for a picture, and no
// manager/CO configured for some accounts) - show "—", not "unknown" or
// an error, per 2026-08-19_my_profile_and_notification_settings.md.
const display = (value) => value || "—";

const MyProfileModal = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { showLoader } = useGlobalLoader();
  const { callApi } = useApi();

  const { myProfileModalOpen, setMyProfileModalOpen } = useDashboardContext();

  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!myProfileModalOpen) return;

    const fetchProfile = async () => {
      showLoader(true);
      const res = await GetMyProfileRequest({
        callApi,
        showNotification,
        showLoader,
        navigate,
      });
      setProfile(res);
      showLoader(false);
    };

    fetchProfile();
  }, [myProfileModalOpen]);

  const handleClose = () => {
    setMyProfileModalOpen(false);
    setProfile(null);
  };

  return (
    <GlobalModal
      visible={myProfileModalOpen}
      width={"700px"}
      centered={true}
      onCancel={handleClose}
      modalBody={
        <div className={styles.mainContainer}>
          <span className={styles.heading}>My Profile</span>

          <Row className={styles.avatarRow}>
            <Col span={6} className={styles.avatarCol}>
              <Avatar
                size={80}
                icon={<UserOutlined />}
                src={profile?.profilePictureURL || undefined}
              />
            </Col>

            <Col span={18}>
              <Row className={styles.boxMargin}>
                <div className={styles.detailBox}>
                  <div>
                    <span className={styles.label}>Full Name: </span>
                    <span className={styles.value}>
                      {display(profile?.fullName)}
                    </span>
                  </div>

                  <div>
                    <span className={styles.label}>Employee ID: </span>
                    <span className={styles.value}>
                      {display(profile?.employeeID)}
                    </span>
                  </div>

                  <div>
                    <span className={styles.label}>Phone: </span>
                    <span className={styles.value}>
                      {display(profile?.phone)}
                    </span>
                  </div>

                  <div>
                    <span className={styles.label}>Address: </span>
                    <span className={styles.value}>
                      {display(profile?.address)}
                    </span>
                  </div>

                  <div>
                    <span className={styles.label}>Email: </span>
                    <span className={styles.value}>
                      {display(profile?.email)}
                    </span>
                  </div>

                  <div>
                    <span className={styles.label}>Department: </span>
                    <span className={styles.value}>
                      {display(profile?.departmentName)}
                    </span>
                  </div>
                </div>
              </Row>

              <Row className={styles.boxMargin}>
                <div className={styles.lineManagerHeading}>Line Manager</div>
              </Row>

              <Row className={styles.boxMargin}>
                <Col span={24}>
                  <div className={`${styles.infoBox} ${styles.lineManagerBg}`}>
                    <div className={styles.infoBoxCol}>
                      <div className={styles.lmLabel}>Name:</div>
                      <div className={styles.value}>
                        {display(profile?.lineManagerName)}
                      </div>
                    </div>

                    <div className={styles.infoBoxCol}>
                      <div className={styles.lmLabel}>Email:</div>
                      <div className={styles.value}>
                        {display(profile?.lineManagerEmail)}
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>

              <Row className={styles.boxMargin}>
                <div className={styles.ComplianceOfficerHeading}>
                  Compliance Officer
                </div>
              </Row>

              <Row className={styles.boxMargin}>
                <Col span={24}>
                  <div className={`${styles.infoBox} ${styles.complianceBg}`}>
                    <div className={styles.infoBoxCol}>
                      <div className={styles.lmLabel}>Name:</div>
                      <div className={styles.value}>
                        {display(profile?.complianceOfficerName)}
                      </div>
                    </div>

                    <div className={styles.infoBoxCol}>
                      <div className={styles.lmLabel}>Email:</div>
                      <div className={styles.value}>
                        {display(profile?.complianceOfficerEmail)}
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
            </Col>
          </Row>
        </div>
      }
      modalFooter={
        <div className={styles.mainButtonDiv}>
          <CustomButton
            text={"Close"}
            className="big-light-button"
            onClick={handleClose}
          />
        </div>
      }
    />
  );
};

export default MyProfileModal;
