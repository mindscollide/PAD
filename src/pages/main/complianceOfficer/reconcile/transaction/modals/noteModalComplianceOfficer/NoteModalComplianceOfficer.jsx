import React, { useState } from "react";
import { useGlobalModal } from "../../../../../../../context/GlobalModalContext";
import { CommentModal } from "../../../../../../../components";
import { useSidebarContext } from "../../../../../../../context/sidebarContaxt";
import { useReconcileContext } from "../../../../../../../context/reconsileContax";

const NoteModalComplianceOfficer = () => {
  const { selectedKey } = useSidebarContext();

  const {
    noteGlobalModal,
    setNoteGlobalModal,
    setViewDetailReconcileTransaction,
    viewDetailReconcileTransaction,
    setDeclinedGlobalModal,
  } = useGlobalModal();

  const { complianceOfficerReconcileTransactionData } = useReconcileContext();

  console.log(
    complianceOfficerReconcileTransactionData,
    "reconcileTransactionApprovalID"
  );
  console.log(selectedKey, "selectedKeyselectedKey212");
  console.log(viewDetailReconcileTransaction, "viewDetailReconcileTransaction");

  // 🔹 Local state upar uthao
  const [commentValue, setCommentValue] = useState("");

  //onClose button Handler
  const onClickClose = () => {
    setNoteGlobalModal({ visible: false, action: null });
    setViewDetailReconcileTransaction(true);
    setCommentValue("");
  };

  return (
    // This is the global modal of Comment in which text Area defines
    <CommentModal
      visible={noteGlobalModal.visible}
      onClose={onClickClose}
      value={commentValue} // pass controlled value
      setValue={setCommentValue}
      width={"902px"}
      height={"620px"}
      centered={false}
      submitText={
        noteGlobalModal.action === "Compliant" ? "Compliant" : "Non-Compliant"
      }
      // onCancel={() => setNoteGlobalModal({ visible: false, action: null })}
      title={"Write a Notes"}
      // onSubmit={onClickOpenDeclinedModal}
    />
  );
};

export default NoteModalComplianceOfficer;
