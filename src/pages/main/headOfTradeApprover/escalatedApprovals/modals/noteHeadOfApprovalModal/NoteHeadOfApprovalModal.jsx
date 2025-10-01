import React, { useState } from "react";
import { useGlobalModal } from "../../../../../../context/GlobalModalContext";
import { CommentModal } from "../../../../../../components";

const NoteHeadOfApprovalModal = () => {
  const {
    noteGlobalModal,
    setNoteGlobalModal,
    setViewDetailsHeadOfApprovalModal,
    setDeclinedGlobalModal,
  } = useGlobalModal();

  // 🔹 Local state upar uthao
  const [commentValue, setCommentValue] = useState("");

  //onClose button Handler
  const onClickClose = () => {
    setNoteGlobalModal({ visible: false, action: null });
    setViewDetailsHeadOfApprovalModal(true);
    setCommentValue("");
  };

  //submit click to open Declined Modal
  const onClickOpenDeclinedModal = () => {
    setNoteGlobalModal({ visible: false, action: null });
    setDeclinedGlobalModal(true);
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
        noteGlobalModal.action === "HTA-Approve" ? "HTA-Approve" : "HTA-Decline"
      }
      onCancel={() => setNoteGlobalModal({ visible: false, action: null })}
      title={"Write a Notes"}
      onSubmit={onClickOpenDeclinedModal}
    />
  );
};

export default NoteHeadOfApprovalModal;
