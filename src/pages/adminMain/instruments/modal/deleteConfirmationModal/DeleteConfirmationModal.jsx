import React from "react";
import { Col, Row } from "antd";
import { useGlobalModal } from "../../../../../context/GlobalModalContext";
import { GlobalModal, ModalImgStates } from "../../../../../components";
import styles from "./DeleteConfirmationModal.module.css";
import CustomButton from "../../../../../components/buttons/button";
import { DeleteUpcomingInstrumentCosingPeriodRequest } from "../../../../../api/adminApi";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../../../../../components/NotificationProvider/NotificationProvider";
import { useGlobalLoader } from "../../../../../context/LoaderContext";
import { useApi } from "../../../../../context/ApiContext";
import { useMyAdmin } from "../../../../../context/AdminContext";

const DeleteConfirmationModal = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { showLoader } = useGlobalLoader();
  const { callApi } = useApi();
  const { setAdminIntrumentsMqtt } = useMyAdmin();

  //This is the ContextApi Global States for Resubmit Intimation modal
  const {
    deleteConfirmationEditModal,
    setDeleteConfirmationEditModal,
    deleteEditModalData,
  } = useGlobalModal();

  // 🔷 Api Call For Edit Button API is getUpcomingClosingPeriodInstrumentRequest
  const deleteInstrumentUpcomingClosingPeriod = async () => {
    showLoader(true);
    const payload = {
      InstrumentID: deleteEditModalData?.instrumentHistoryID,
    };

    const deleted = await DeleteUpcomingInstrumentCosingPeriodRequest({
      callApi,
      showNotification,
      showLoader,
      requestdata: payload,
      setDeleteConfirmationEditModal,
      navigate,
    });

    // Reload the Instruments list behind the modals so the removed closing
    // period disappears without a browser refresh (not relying on MQTT).
    if (deleted) setAdminIntrumentsMqtt(true);
  };

  return (
    <GlobalModal
      visible={deleteConfirmationEditModal}
      width={"635px"}
      height={"235px"}
      centered={true}
      onCancel={() => setDeleteConfirmationEditModal(false)}
      modalBody={
        <>
          <div className={styles.SubmittedCenteralized}>
            <Row>
              <Col>
                <ModalImgStates type="editDelete" />
              </Col>
            </Row>

            <Row>
              <Col>
                <div className={styles.mainButtonDiv}>
                  <CustomButton
                    text={"Proceed"}
                    className="big-dark-button"
                    onClick={deleteInstrumentUpcomingClosingPeriod}
                  />
                  <CustomButton
                    text={"Close"}
                    className="big-light-button"
                    onClick={() => setDeleteConfirmationEditModal(false)}
                  />
                </div>
              </Col>
            </Row>
          </div>
        </>
      }
    />
  );
};

export default DeleteConfirmationModal;
