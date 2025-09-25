import React, { createContext, useContext, useState } from "react";

const ModalContext = createContext();

export const GlobalModalProvider = ({ children }) => {
  /**
   * Global States For Employee Modals Start here
   */

  //To Show Add Approval Modal
  const [isEquitiesModalVisible, setIsEquitiesModalVisible] = useState(false);

  // To Show Submit Modal on AddApproval Submit Button
  const [isSubmit, setIsSubmit] = useState(false);

  // To Show Restricted Modal on AddApproval Submit Button
  const [isTradeRequestRestricted, setIsTradeRequestRestricted] =
    useState(false);

  // To Show View Modal on ViewDetail Button on add approval listing
  const [isViewDetail, setIsViewDetail] = useState(false);

  // To show Selected Row Data in View Detail Modal
  const [selectedViewDetail, setSelectedViewDetail] = useState(null);

  // To Show View Comments Modal while Declined Modal in View Detail on approval
  const [isViewComments, setIsViewComments] = useState(false);

  // To Show Resubmit Modal while Click on Resubmitted
  const [isResubmitted, setIsResubmitted] = useState(false);

  // To Show Resubmitted intimation Modal
  const [resubmitIntimation, setResubmitIntimation] = useState(false);

  // To show Conduct Transaction Modal
  const [isConductedTransaction, setIsConductedTransaction] = useState(false);

  // To show view Detail Modal on Transaction
  const [viewDetailTransactionModal, setViewDetailTransactionModal] =
    useState(false);

  // To show Selected Row Data in View Detail Modal
  const [selectedViewDetailOfTransaction, setSelectedViewDetailOfTransaction] =
    useState(null);

  // To  show view Comment Modal on Transaction
  const [viewCommentTransactionModal, setViewCommentTransactionModal] =
    useState(false);

  // To  show view Ticket Modal on Transaction View Detail Modal
  const [isViewTicketTransactionModal, setIsViewTicketTransactionModal] =
    useState(false);

  /**
   * Global States For Employee Modals End here
   */

  /**
   * Global States For Line Manager Modals Start here
   */

  // To show view Detail Line Manager Modal
  const [viewDetailLineManagerModal, setViewDetailLineManagerModal] =
    useState(false);

  // To show Selected Status which is coming static just a rough state to show or test modals
  const [isSelectedViewDetailLineManager, setIsSelectedViewDetailLineManager] =
    useState(null);

  // To Show Global States of Notes modals in LM
  const [noteGlobalModal, setNoteGlobalModal] = useState({
    visible: false,
    action: null,
  });

  //To Show Global State of Approved Modal in LM
  const [approvedGlobalModal, setApprovedGlobalModal] = useState(false);

  //To Show Global State of Declined Modal in LM
  const [declinedGlobalModal, setDeclinedGlobalModal] = useState(false);

  //To show Global State of View Comment Modal in LM
  const [viewCommentGlobalModal, setViewCommentGlobalModal] = useState(false);

  /**
   * Global States For Line Manager Modals End here
   */

  /**
   * Global States For Compliance Officer Modals Start here
   */
  //This is For Head Of COmpliance Modal for upload
  const [uploadComplianceModal, setUploadComplianceModal] = useState(false);

  /**
   * Global States For Compliance Officer Modals End here
   */

  //  Main resetDashboardContext  reset State to call in dashboard
  // The reset function — inline resetting all states
  const resetModalContextState = () => {
    setIsEquitiesModalVisible(false);
    setIsSubmit(false);
    setIsTradeRequestRestricted(false);
    setIsViewDetail(false);
    setSelectedViewDetail(null);
    setIsViewComments(false);
    setIsResubmitted(false);
    setResubmitIntimation(false);
    setIsConductedTransaction(false);

    setViewDetailLineManagerModal(false);
    setIsSelectedViewDetailLineManager(false);
    setNoteGlobalModal({ visible: false, action: null });
    setApprovedGlobalModal(false);
    setDeclinedGlobalModal(false);
    setViewCommentGlobalModal(false);
  };

  const resetForLineManagerModal = () => {
    setViewDetailLineManagerModal(false);
    setNoteGlobalModal({ visible: false, action: null });
    setApprovedGlobalModal(false);
  };

  return (
    <ModalContext.Provider
      value={{
        isEquitiesModalVisible,
        setIsEquitiesModalVisible,
        isTradeRequestRestricted,
        setIsTradeRequestRestricted,
        isSubmit,
        setIsSubmit,
        isViewDetail,
        setIsViewDetail,
        selectedViewDetail,
        setSelectedViewDetail,
        isViewComments,
        setIsViewComments,
        isResubmitted,
        setIsResubmitted,
        resubmitIntimation,
        setResubmitIntimation,
        isConductedTransaction,
        setIsConductedTransaction,
        viewDetailTransactionModal,
        setViewDetailTransactionModal,
        selectedViewDetailOfTransaction,
        setSelectedViewDetailOfTransaction,
        viewCommentTransactionModal,
        setViewCommentTransactionModal,
        isViewTicketTransactionModal,
        setIsViewTicketTransactionModal,

        /**
         * Global States For Line Manager Modals
         */

        viewDetailLineManagerModal,
        setViewDetailLineManagerModal,
        isSelectedViewDetailLineManager,
        setIsSelectedViewDetailLineManager,
        noteGlobalModal,
        setNoteGlobalModal,
        approvedGlobalModal,
        setApprovedGlobalModal,
        declinedGlobalModal,
        setDeclinedGlobalModal,
        viewCommentGlobalModal,
        setViewCommentGlobalModal,
        resetForLineManagerModal,

        /**
         * Global States For Line Manager Modals End Here
         */

        /**
         * Global States For Compliance Officer Modals Start here
         */

        uploadComplianceModal,
        setUploadComplianceModal,

        /**
         * Global States For Compliance Officer Modals End here
         */

        resetModalContextState,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
};

// ✅ Correct Hook
export const useGlobalModal = () => useContext(ModalContext);
