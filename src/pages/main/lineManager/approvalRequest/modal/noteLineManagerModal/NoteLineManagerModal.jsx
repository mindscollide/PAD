import React, { useState } from "react";
import { useGlobalModal } from "../../../../../../context/GlobalModalContext";
import { CommentModal } from "../../../../../../components";
import { useDashboardContext } from "../../../../../../context/dashboardContaxt";

const NoteLineManagerModal = () => {
  const {
    noteGlobalModal,
    setNoteGlobalModal,
    setViewDetailLineManagerModal,
    setDeclinedGlobalModal,
  } = useGlobalModal();

  // Context Api For Reasons which is coming from the API and stored in contextApi
  const { getAllPredefineReasonData } = useDashboardContext();

  // 🔹 Local state upar uthao
  const [commentValue, setCommentValue] = useState("");

  //onClose button Handler
  const onClickClose = () => {
    setNoteGlobalModal({ visible: false, action: null });
    setViewDetailLineManagerModal(true);
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
      predefinedReasons={
        noteGlobalModal.action === "Approve"
          ? getAllPredefineReasonData?.reasonForLMAndHTA?.approved || []
          : getAllPredefineReasonData?.reasonForLMAndHTA?.decline || []
      }
      setValue={setCommentValue}
      width={"902px"}
      height={"620px"}
      centered={true}
      submitText={noteGlobalModal.action === "Approve" ? "Approve" : "Decline"}
      onCancel={() => setNoteGlobalModal({ visible: false, action: null })}
      onSubmit={onClickOpenDeclinedModal}
    />
  );
};

export default NoteLineManagerModal;
