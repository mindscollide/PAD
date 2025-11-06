import React from "react";
import { Col, Row } from "antd";
import { useGlobalModal } from "../../../../../context/GlobalModalContext";
import { GlobalModal, ModalImgStates } from "../../../../../components";
import styles from "./UnSaveChangesModal.module.css";
import CustomButton from "../../../../../components/buttons/button";
import { useMyAdmin } from "../../../../../context/AdminContext";
import { UpdateEditRolesAndPoliciesRequest } from "../../../../../api/adminApi";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../../../../../components/NotificationProvider/NotificationProvider";
import { useGlobalLoader } from "../../../../../context/LoaderContext";
import { useApi } from "../../../../../context/ApiContext";

const UnSaveChangesModal = () => {
  const navigate = useNavigate();

  // 🔷 Context Hooks
  const { showNotification } = useNotification();
  const { showLoader } = useGlobalLoader();
  const { callApi } = useApi();
  //This is the ContextApi Global States for Resubmit Intimation modal
  const {
    unSavedChangesPoliciesModal,
    setUnSavedChangesPoliciesModal,
    setEditrolesAndPoliciesUser,
  } = useGlobalModal();

  // 🔹  Context State of View Detail Modal in which All data store
  const { storeEditRolesAndPoliciesData } = useMyAdmin();

  // 🔹  API will be hit on unSavedData
  const handleSaveChanges = async () => {
    if (!storeEditRolesAndPoliciesData) return;

    showLoader(true);

    const res = await UpdateEditRolesAndPoliciesRequest({
      callApi,
      showNotification,
      showLoader,
      requestdata: storeEditRolesAndPoliciesData,
      setEditrolesAndPoliciesUser,
      navigate,
    });

    if (res) {
      setUnSavedChangesPoliciesModal(false);
      storeEditRolesAndPoliciesData(null);
    }
  };

  return (
    <GlobalModal
      visible={unSavedChangesPoliciesModal}
      width={"815px"}
      height={"319px"}
      centered={true}
      onCancel={() => setUnSavedChangesPoliciesModal(false)}
      modalBody={
        <>
          <div className={styles.unSaveChangesModal}>
            <Row>
              <Col>
                <ModalImgStates
                  type="unSaveChanges"
                  headingClassName={styles.unSaveChangeHeading}
                />
              </Col>
            </Row>

            <Row justify="end" className={styles.footerActions}>
              {" "}
              <CustomButton
                text={"Leave Without Saving"}
                className="big-light-button"
                onClick={() => setUnSavedChangesPoliciesModal(false)}
              />
              <CustomButton
                text={"Save Changes"}
                className="big-dark-button"
                onClick={handleSaveChanges}
              />
            </Row>
          </div>
        </>
      }
    />
  );
};

export default UnSaveChangesModal;
