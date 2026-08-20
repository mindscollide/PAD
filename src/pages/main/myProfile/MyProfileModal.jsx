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

  // Fields that genuinely may be null (no edit UI exists yet for
  // phone/address, no upload mechanism for a picture, and no
  // manager/CO configured for some accounts) - show "—", not "unknown" or
  // an error, per 2026-08-19_my_profile_and_notification_settings.md.
  const display = (value) => (value ? value : "—");

  return (
    <GlobalModal
      visible={myProfileModalOpen}
      width={"600px"}
      centered={true}
      onCancel={handleClose}
      modalBody={
        <div className={styles.mainContainer}>
          <Row>
            <Col span={24}>
              <h3 className={styles.heading}>My Profile</h3>
            </Col>
          </Row>

          <Row className={styles.avatarRow}>
            <Col span={24} className={styles.avatarCol}>
              <Avatar
                size={80}
                icon={<UserOutlined />}
                src={profile?.profilePictureURL || undefined}
              />
              <div className={styles.fullName}>{display(profile?.fullName)}</div>
            </Col>
          </Row>

          <Row gutter={[12, 12]} className={styles.detailsRow}>
            <Col span={12}>
              <div className={styles.detailBox}>
                <label className={styles.label}>Employee ID</label>
                <label className={styles.value}>
                  {display(profile?.employeeID)}
                </label>
              </div>
            </Col>
            <Col span={12}>
              <div className={styles.detailBox}>
                <label className={styles.label}>Email</label>
                <label className={styles.value}>{display(profile?.email)}</label>
              </div>
            </Col>
            <Col span={12}>
              <div className={styles.detailBox}>
                <label className={styles.label}>Phone</label>
                <label className={styles.value}>{display(profile?.phone)}</label>
              </div>
            </Col>
            <Col span={12}>
              <div className={styles.detailBox}>
                <label className={styles.label}>Address</label>
                <label className={styles.value}>
                  {display(profile?.address)}
                </label>
              </div>
            </Col>
            <Col span={24}>
              <div className={styles.detailBox}>
                <label className={styles.label}>Department Name</label>
                <label className={styles.value}>
                  {display(profile?.departmentName)}
                </label>
              </div>
            </Col>
            <Col span={12}>
              <div className={styles.detailBox}>
                <label className={styles.label}>Line Manager Name</label>
                <label className={styles.value}>
                  {display(profile?.lineManagerName)}
                </label>
              </div>
            </Col>
            <Col span={12}>
              <div className={styles.detailBox}>
                <label className={styles.label}>Line Manager Email</label>
                <label className={styles.value}>
                  {display(profile?.lineManagerEmail)}
                </label>
              </div>
            </Col>
            <Col span={12}>
              <div className={styles.detailBox}>
                <label className={styles.label}>Compliance Officer Name</label>
                <label className={styles.value}>
                  {display(profile?.complianceOfficerName)}
                </label>
              </div>
            </Col>
            <Col span={12}>
              <div className={styles.detailBox}>
                <label className={styles.label}>Compliance Officer Email</label>
                <label className={styles.value}>
                  {display(profile?.complianceOfficerEmail)}
                </label>
              </div>
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
