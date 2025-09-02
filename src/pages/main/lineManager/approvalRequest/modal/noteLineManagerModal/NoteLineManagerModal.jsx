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

  //onClose button Handler
  const onClickClose = () => {
    setNoteGlobalModal(false);
    setViewDetailLineManagerModal(true);
  };

  //submit click to open Declined Modal
  const onClickOpenDeclinedModal = () => {
    setNoteGlobalModal(false);
    setDeclinedGlobalModal(true);
  };

  return (
    // This is the global modal of Comment in which text Area defines
    <CommentModal
      visible={noteGlobalModal}
      onClose={onClickClose}
      width={"902px"}
      height={"620px"}
      centered={false}
      onCancel={() => setNoteGlobalModal(false)}
      title={"Write a Notes"}
      onSubmit={onClickOpenDeclinedModal}
    />
  );
};

export default NoteLineManagerModal;
