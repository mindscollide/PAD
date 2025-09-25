import React, { useState } from "react";
import { useGlobalModal } from "../../../../../../context/GlobalModalContext";
import { CommentModal } from "../../../../../../components";

const NoteLineManagerModal = () => {
  const {
    noteGlobalModal,
    setNoteGlobalModal,
    setViewDetailLineManagerModal,
    setDeclinedGlobalModal,
  } = useGlobalModal();

  console.log(noteGlobalModal, "CheckCHeckNoteModal");

  //onClose button Handler
  const onClickClose = () => {
    setNoteGlobalModal({ visible: false, action: null });
    setViewDetailLineManagerModal(true);
  };

  //submit click to open Declined Modal
  const onClickOpenDeclinedModal = () => {
    setNoteGlobalModal({ visible: false, action: null });
    setDeclinedGlobalModal(true);
  };

  return (
    // This is the global modal of Comment in which text Area defines
    <CommentModal
      visible={noteGlobalModal.visible}
      onClose={onClickClose}
      width={"902px"}
      height={"620px"}
      centered={false}
      submitText={noteGlobalModal.action === "Approve" ? "Approve" : "Decline"}
      onCancel={() => setNoteGlobalModal({ visible: false, action: null })}
      title={"Write a Notes"}
      onSubmit={onClickOpenDeclinedModal}
    />
  );
};

export default NoteLineManagerModal;
