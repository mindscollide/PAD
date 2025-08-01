import React, { useState } from "react";
import { Button } from "antd";
import {GlobalModal} from "../../../../../components";
import { useGlobalModal } from "./../../../../../context/GlobalModalContext";

const EquitiesApproval = () => {
  const { showModal, hideModal } = useGlobalModal();
  const [visible, setVisible] = useState(false);
  console.log("Equities Modal Is Here");

  const handleOpen = () => setVisible(true);
  const handleClose = () => setVisible(false);

  return (
    <>
      <GlobalModal
        visible={showModal()}
        onCancel={hideModal()}
        modalHeader={<h3>Custom Modal Title</h3>}
        modalBody={<p>This is custom modal body content</p>}
        modalFooter={
          <>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="primary" onClick={() => alert("Confirmed!")}>
              Confirm
            </Button>
          </>
        }
      />
    </>
  );
};

export default EquitiesApproval;
