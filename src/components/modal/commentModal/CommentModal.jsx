import React, { useState } from "react";
import { Col, Row, Input, Typography } from "antd";
import { GlobalModal } from "../../../components";
import CustomButton from "../../../components/buttons/button";
import styles from "./CommentModal.module.css";

const { TextArea } = Input;
const { Text } = Typography;

const CommentModal = ({
  visible,
  onClose,
  onSubmit,
  predefinedReasons = [], // optional array of reasons
  centered,
  title,
  submitText = "Submit",
  maxChars = 5000,
  initialValue = "",
}) => {
  // State to get value while selecting any reason
  const [value, setValue] = useState(initialValue);

  // State to get option reason while selecting any reason
  const [selectedOption, setSelectedOption] = useState(null);

  //A counter show below the TextArea
  const charCount = value.length;

  //when no reasons or option is selected then button resubmit will disabled
  const isButtonDisabled = value.trim() === "";

  //OnChange function which tell that the option isselected on textArea field
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

  // For select options
  const handleOptionSelect = (optionText) => {
    setSelectedOption(optionText);
    setValue(optionText.reason);
  };

  return (
    <GlobalModal
      visible={visible}
      width={"902px"}
      height={"620px"}
      centered={centered}
      modalHeader={<></>}
      onCancel={onClose}
      modalBody={
        <div className={styles.mainDivComment}>
          <Row>
            <Col span={24}>
              <label className={styles.mainHeadingResubmit}>{title}</label>
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

          {/* Predefined Reasons (only if passed) */}
          {predefinedReasons.length > 0 && (
            <Row gutter={[0, 0]} style={{ margin: "20px 0" }}>
              {predefinedReasons.map((option) => (
                <Col
                  span={24}
                  key={option.predefinedReasonsID}
                  style={{ margin: "10px 0" }}
                >
                  <div
                    className={`${styles.mainDivClass} ${
                      selectedOption?.predefinedReasonsID ===
                      option.predefinedReasonsID
                        ? styles.selectedOption
                        : ""
                    }`}
                    onClick={() => handleOptionSelect(option)}
                  >
                    <div className={styles.optionClass} title={option.reason}>
                      {option.reason}
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          )}

          <Row>
            <Col span={24} style={{ textAlign: "right" }}>
              <div className={styles.buttonGroup}>
                <CustomButton
                  text={"Close"}
                  className="big-light-button"
                  onClick={onClose}
                />
                <CustomButton
                  text={submitText}
                  className="big-dark-button"
                  disabled={isButtonDisabled}
                  onClick={() => onSubmit({ value, selectedOption })}
                />
              </div>
            </Col>
          </Row>
        </div>
      }
    />
  );
};

export default CommentModal;
