import React, { useState } from "react";
import { useGlobalModal } from "../../../../../../../context/GlobalModalContext";
import { CommentModal } from "../../../../../../../components";

const NotePortfolioComplianceOfficerModal = () => {
  const {
    noteGlobalModal,
    setNoteGlobalModal,
    setViewDetailPortfolioTransaction,
    viewDetailPortfolioTransaction,
  } = useGlobalModal();

  console.log(noteGlobalModal, "viewDetailReconcileTransaction");

  // 🔹 Local state upar uthao
  const [commentValue, setCommentValue] = useState("");

  //onClose button Handler
  const onClickClose = () => {
    setNoteGlobalModal({ visible: false, action: null });
    setViewDetailPortfolioTransaction(true);
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
        noteGlobalModal.action === "Portfolio-Compliant"
          ? "Portfolio-Compliant"
          : "Portfolio-Non-Compliant"
      }
      // onCancel={() => setNoteGlobalModal({ visible: false, action: null })}
      title={"Write a Notes"}
      // onSubmit={onClickOpenDeclinedModal}
    />
  );
};

export default NotePortfolioComplianceOfficerModal;
