import React, { useState } from "react";
import { Col, Row, Tag, Input, Typography } from "antd";
import { useGlobalModal } from "../../../../../../context/GlobalModalContext";
import { GlobalModal } from "../../../../../../components";
import styles from "./ResubmitModal.module.css";
import CustomButton from "../../../../../../components/buttons/button";

const { TextArea } = Input;
const { Text } = Typography;
const ResubmitModal = () => {
  const { isResubmitted, setIsResubmitted, setResubmitIntimation } =
    useGlobalModal();

  const [value, setValue] = useState("");
  const [selectedOption, setSelectedOption] = useState(null);
  const maxChars = 5000;

  const handleChange = (e) => {
    const newText = e.target.value;

    if (newText.length <= maxChars) {
      setValue(newText);

      // If user deleted everything, unselect the option
      if (newText.trim() === "") {
        setSelectedOption(null);
      }
    }
  };

  const charCount = value.length;

  const handleOptionSelect = (optionText) => {
    setSelectedOption(optionText);
    setValue(optionText); // set textArea value to option text
  };

  const options = [
    "Transaction was not conducted after approval",
    "Incorrect trade details submitted",
    "Incorrect details were submitted in the  previous request previous request previous request",
  ];

  const isButtonDisabled = value.trim() === "";

  const onClickClose = () => {
    setIsResubmitted(false);
  };

  const onClickResubmit = () => {
    setIsResubmitted(false);
    setResubmitIntimation(true);
  };

  return (
    <GlobalModal
      visible={isResubmitted}
      width={"902px"}
      centered={true}
      height={"620px"}
      modalHeader={<></>}
      onCancel={() => setIsResubmitted(false)}
      modalBody={
        <>
          <div className={styles.mainDivComment}>
            <Row>
              <Col span={24}>
                <label className={styles.mainHeadingResubmit}>
                  Why do you want to resubmit trade request REQ-001?
                </label>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <TextArea
                  rows={8}
                  value={value}
                  onChange={handleChange}
                  className={styles.textAreaStyle}
                  placeholder="Enter a reason"
                />
                <div className={styles.maxCharacterClass}>
                  <Text type={charCount > maxChars ? "danger" : "secondary"}>
                    {charCount}/{maxChars}
                  </Text>
                </div>
              </Col>
            </Row>

            <Row gutter={[0, 0]} style={{ margin: "20px 0" }}>
              {options.map((option, index) => (
                <Col span={24} key={index} style={{ margin: "10px 0" }}>
                  <div
                    className={`${styles.mainDivClass} ${
                      selectedOption === option ? styles.selectedOption : ""
                    }`}
                    onClick={() => handleOptionSelect(option)}
                  >
                    <div className={styles.optionClass}>{option}</div>
                  </div>
                </Col>
              ))}
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
                    text={"Resubmit"}
                    className="big-dark-button"
                    disabled={isButtonDisabled}
                    onClick={onClickResubmit}
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

export default ResubmitModal;
