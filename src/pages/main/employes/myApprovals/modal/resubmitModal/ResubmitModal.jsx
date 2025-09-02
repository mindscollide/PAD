import React, { useState } from "react";
import { useGlobalModal } from "../../../../../../context/GlobalModalContext";
import { CommentModal } from "../../../../../../components";
import { useDashboardContext } from "../../../../../../context/dashboardContaxt";
import { useNotification } from "../../../../../../components/NotificationProvider/NotificationProvider";
import { useGlobalLoader } from "../../../../../../context/LoaderContext";
import { useApi } from "../../../../../../context/ApiContext";
import { useNavigate } from "react-router-dom";
import { AddTradeApprovalRequest } from "../../../../../../api/myApprovalApi";

const ResubmitModal = () => {
  const navigate = useNavigate();

  const { showNotification } = useNotification();

  const { showLoader } = useGlobalLoader();

  const { callApi } = useApi();

  const { isResubmitted, setIsResubmitted, setResubmitIntimation } =
    useGlobalModal();

  // Context Api For Reasons which is coming from the API and stored in contextApi
  const { getAllPredefineReasonData } = useDashboardContext();

  //This is the Api Function I created
  const fetchResubmitRequest = async (value, selectedOption) => {
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
  const clickOnReSubmitButton = ({ value, selectedOption }) => {
    fetchResubmitRequest(value, selectedOption);
  };

  //onClose button Handler
  const onClickClose = () => {
    setIsResubmitted(false);
  };

  return (
    // This is the global modal of Comment in which text Area defines
    <CommentModal
      visible={isResubmitted}
      onClose={onClickClose}
      title={"Why do you want to resubmit trade request REQ-001?"}
      predefinedReasons={getAllPredefineReasonData}
      onSubmit={clickOnReSubmitButton}
      onCancel={() => setIsResubmitted(false)}
      centered={true}
      width={"902px"}
      height={"620px"}
    />
  );
};

export default ResubmitModal;
