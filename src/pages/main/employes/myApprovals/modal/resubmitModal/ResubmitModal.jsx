import React, { useState } from "react";
import { Col, Row, Tag, Input, Typography } from "antd";
import { useGlobalModal } from "../../../../../../context/GlobalModalContext";
import { GlobalModal } from "../../../../../../components";
import styles from "./ResubmitModal.module.css";
import CustomButton from "../../../../../../components/buttons/button";
import { useDashboardContext } from "../../../../../../context/dashboardContaxt";
import { useNotification } from "../../../../../../components/NotificationProvider/NotificationProvider";
import { useGlobalLoader } from "../../../../../../context/LoaderContext";
import { useApi } from "../../../../../../context/ApiContext";
import { useNavigate } from "react-router-dom";
import { AddTradeApprovalRequest } from "../../../../../../api/myApprovalApi";

const { TextArea } = Input;
const { Text } = Typography;
const ResubmitModal = () => {
  const navigate = useNavigate();

  const { showNotification } = useNotification();

  const { showLoader } = useGlobalLoader();

  const { callApi } = useApi();

  const { isResubmitted, setIsResubmitted, setResubmitIntimation } =
    useGlobalModal();

  // Context Api For Reasons which is coming from the API and stored in contextApi
  const { getAllPredefineReasonData } = useDashboardContext();

  // State to get value while selecting any reason
  const [value, setValue] = useState("");

  // State to get option reason while selecting any reason
  const [selectedOption, setSelectedOption] = useState(null);
  const maxChars = 5000;

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

  //A counter show below the TextArea
  const charCount = value.length;

  //Show the selected option their value and text
  const handleOptionSelect = (optionText) => {
    setSelectedOption(optionText);
    setValue(optionText.reason);
  };

  //when no reasons or option is selected then button resubmit will disabled
  const isButtonDisabled = (value ?? "").toString().trim() === "";

  //This is the Api Function I created
  const fetchResubmitRequest = async () => {
    showLoader(true);

    const requestdata = {
      TradeApprovalID: 1,
      InstrumentID: 0,
      AssetTypeID: 0,
      ApprovalTypeID: 0,
      Quantity: 0,
      ApprovalStatusID: 0,
      Comments: value?.trim() || "",
      BrokerIds: [],
      ResubmittedCommentID: selectedOption?.predefinedReasonsID || 0,
      ListOfTradeApprovalActionableBundle: [
        {
          instrumentID: 0,
          instrumentShortName: "",
          Entity: { EntityID: 0, EntityTypeID: 0 },
        },
      ],
    };

    await AddTradeApprovalRequest({
      callApi,
      showNotification,
      showLoader,
      requestdata,
      setIsResubmitted,
      setResubmitIntimation,
      navigate,
    });
  };

  // Call an API which inside the fetchResubmitRequest Request on Resubmit Button
  const clickOnReSubmitButton = () => {
    fetchResubmitRequest();
  };

  //onClose button Handler
  const onClickClose = () => {
    setIsResubmitted(false);
  };

  return (
    <GlobalModal
      visible={isResubmitted}
      width={"902px"}
      height={"620px"}
      centered={true}
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
              {getAllPredefineReasonData.map((option) => (
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
                    onClick={clickOnReSubmitButton}
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
