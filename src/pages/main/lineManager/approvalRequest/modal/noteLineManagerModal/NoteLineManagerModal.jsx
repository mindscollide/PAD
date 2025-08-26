import React, { useState } from "react";
import { Col, Row, Input, Typography } from "antd";
import { useGlobalModal } from "../../../../../../context/GlobalModalContext";
import { GlobalModal } from "../../../../../../components";
import styles from "./NoteLineManagerModal.module.css";
import CustomButton from "../../../../../../components/buttons/button";

const { TextArea } = Input;
const { Text } = Typography;
const NoteLineManagerModal = () => {
  const {
    noteGlobalModal,
    setNoteGlobalModal,
    setViewDetailLineManagerModal,
    setDeclinedGlobalModal,
  } = useGlobalModal();

  // State to get value while selecting any reason
  const [value, setValue] = useState("");

  const maxChars = 5000;

  //OnChange function which tell that the option isselected on textArea field
  const handleChange = (e) => {
    const newText = e.target.value;
    if (newText.length <= maxChars) {
      setValue(newText);
    }
  };

  //A counter show below the TextArea
  const charCount = value.length;

  //when no reasons or option is selected then button resubmit will disabled
  const isButtonDisabled = (value ?? "").toString().trim() === "";

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
    <GlobalModal
      visible={noteGlobalModal}
      width={"902px"}
      height={"620px"}
      centered={false}
      modalHeader={<></>}
      onCancel={() => setNoteGlobalModal(false)}
      modalBody={
        <>
          <div className={styles.mainDivComment}>
            <Row>
              <Col span={24}>
                <label className={styles.mainHeadingResubmit}>
                  Write a Notes
                </label>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <TextArea
                  rows={10}
                  value={value}
                  onChange={handleChange}
                  className={styles.textAreaStyle}
                  placeholder="Type"
                />
                <div className={styles.maxCharacterClass}>
                  <Text type={charCount > maxChars ? "danger" : "secondary"}>
                    {charCount}/{maxChars}
                  </Text>
                </div>
              </Col>
            </Row>

            <Row>
              <Col span={24} style={{ textAlign: "right" }}>
                <div className={styles.resubmitButtonClass}>
                  <CustomButton
                    text={"Close"}
                    className="big-light-button"
                    onClick={onClickClose}
                  />
                  <CustomButton
                    text={"Submit"}
                    className="big-dark-button"
                    disabled={isButtonDisabled}
                    onClick={onClickOpenDeclinedModal}
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

export default NoteLineManagerModal;
