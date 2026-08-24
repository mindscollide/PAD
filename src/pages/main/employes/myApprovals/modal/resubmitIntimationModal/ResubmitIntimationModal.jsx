import React from "react";
import { Col, Row } from "antd";
import { useGlobalModal } from "../../../../../../context/GlobalModalContext";
import { useSearchBarContext } from "../../../../../../context/SearchBarContaxt"; // ADDED
import { GlobalModal, ModalImgStates } from "../../../../../../components";
import styles from "./ResubmitIntimationModal.module.css";
import CustomButton from "../../../../../../components/buttons/button";

const ResubmitIntimationModal = () => {
  const { resubmitIntimation, setResubmitIntimation } = useGlobalModal();
  const { setEmployeeMyApprovalSearch } = useSearchBarContext(); // ADDED

  // CHANGED: previously only hid the modal, leaving the "My Approvals"
  // table's refresh entirely up to the EMPLOYEE_NEW_TRADE_APPROVAL_REQUEST_
  // RESUBMITTED MQTT push arriving on its own - no guarantee it lands
  // before/near this moment. ResubmitApprovalRequestApi also never returns
  // the new row to patch locally with. Triggering the same filterTrigger
  // refetch Approval.jsx already runs on every other search/filter change
  // makes the update immediate and independent of MQTT timing - the MQTT
  // patch (once it does arrive) just becomes a no-op dedupe against an
  // already-fresh list, same as any other client also viewing this list.
  const onClickCloseResubmit = () => {
    setResubmitIntimation(false);
    setEmployeeMyApprovalSearch((prev) => ({
      ...prev,
      pageNumber: 1,
      filterTrigger: true,
    }));
  };

  return (
    <GlobalModal
      visible={resubmitIntimation}
      width={"935px"}
      height={"495px"}
      centered={true}
      onCancel={onClickCloseResubmit} // CHANGED: was setResubmitIntimation(false) directly, bypassing the refetch above when closed via the X/backdrop instead of the Close button
      modalBody={
        <>
          <div className={styles.SubmittedCenteralized}>
            <Row>
              <Col>
                <ModalImgStates type="Resubmitted" />
              </Col>
            </Row>

            <Row className={styles.mainButtonDiv}>
              <Col>
                <CustomButton
                  text={"Close"}
                  className="big-light-button"
                  onClick={onClickCloseResubmit}
                />
              </Col>
            </Row>
          </div>
        </>
      }
    />
  );
};

export default ResubmitIntimationModal;
