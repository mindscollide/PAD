import React, { useState } from "react";
import { useGlobalModal } from "../../../../../../context/GlobalModalContext";
import { CommentModal } from "../../../../../../components";
import { useDashboardContext } from "../../../../../../context/dashboardContaxt";
import { useNotification } from "../../../../../../components/NotificationProvider/NotificationProvider";
import { useGlobalLoader } from "../../../../../../context/LoaderContext";
import { useApi } from "../../../../../../context/ApiContext";
import { useNavigate } from "react-router-dom";
import {
  AddTradeApprovalRequest,
  ResubmitApprovalRequestApi,
} from "../../../../../../api/myApprovalApi";

const ResubmitModal = () => {
  const navigate = useNavigate();

  const { showNotification } = useNotification();

  const { showLoader } = useGlobalLoader();

  const { callApi } = useApi();

  const {
    isResubmitted,
    setIsResubmitted,
    setResubmitIntimation,
    selectedViewDetail,
  } = useGlobalModal();

  console.log(
    selectedViewDetail,
    "selectedViewDetailselectedViewDetailselectedViewDetail"
  );

  // Context Api For Reasons which is coming from the API and stored in contextApi
  const { getAllPredefineReasonData } = useDashboardContext();

  // ✅ Add this state
  const [commentValue, setCommentValue] = useState("");

  //This is the Api Function I created
  const fetchResubmitRequest = async (selectedOption) => {
    showLoader(true);

    const requestData = {
      ResubmittedCommentID: selectedOption?.predefinedReasonsID || 0,
      TradeApprovalID: selectedViewDetail?.approvalID,
    };

    await ResubmitApprovalRequestApi({
      callApi,
      showNotification,
      showLoader,
      requestData,
      setIsResubmitted,
      setCommentValue,
      setResubmitIntimation,
      navigate,
    });

    console.log(requestData, "CheckRequestDatahere");
  };

  // Call an API which inside the fetchResubmitRequest Request on Resubmit Button
  const clickOnReSubmitButton = ({ selectedOption }) => {
    fetchResubmitRequest(selectedOption);
  };

  //onClose button Handler
  const onClickClose = () => {
    setIsResubmitted(false);
    setCommentValue(""); // ✅ Clear text on close
  };

  return (
    // This is the global modal of Comment in which text Area defines
    <CommentModal
      visible={isResubmitted}
      onClose={onClickClose}
      title={"Why do you want to resubmit trade request REQ-001?"}
      predefinedReasons={getAllPredefineReasonData}
      onSubmit={clickOnReSubmitButton}
      centered={true}
      width={"902px"}
      height={"620px"}
      value={commentValue} // ✅ Pass value
      setValue={setCommentValue}
    />
  );
};

export default ResubmitModal;
