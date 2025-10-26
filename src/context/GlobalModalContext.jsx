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

  // Set assetTypeId when I click on addtrade approval dropdown
  const [selectedAssetTypeId, setSelectedAssetTypeId] = useState(null);

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
  const [uploadattAchmentsFiles, setUploadattAchmentsFiles] = useState([]);

  //This is For Compliance Officer View Detail for reconcile transaction modal
  const [viewDetailReconcileTransaction, setViewDetailReconcileTransaction] =
    useState(false);

  //This is For Compliance Officer View Detail for Portfolio transaction modal
  const [viewDetailPortfolioTransaction, setViewDetailPortfolioTransaction] =
    useState(false);

  //This is For the Compliant Approved Modal Open After NOte Modal on Api succes
  const [compliantApproveModal, setCompliantApproveModal] = useState(false);

  //This is For the Compliant Portfolio Approved Modal Open After NOte Modal on Api succes
  const [compliantPortfolioApproveModal, setCompliantPortfolioApproveModal] =
    useState(false);

  //This is For the NONCompliant Declined Modal Open After NOte Modal on Api succes
  const [nonCompliantDeclineModal, setNonCompliantDeclineModal] =
    useState(false);

  //This is For the NONCompliant Portfolio Declined Modal Open After NOte Modal on Api succes
  const [
    nonCompliantPortfolioDeclineModal,
    setNonCompliantPortfolioDeclineModal,
  ] = useState(false);

  // This is for View Comment When Compliant and NonCompliant modal will be open
  const [viewCommentReconcileModal, setViewCommentReconcileModal] =
    useState(false);

  // This is for View Comment When Compliant and NonCompliant modal will be open on portfolio
  const [viewCommentPortfolioModal, setViewCommentPortfolioModal] =
    useState(false);

  /**
   * Global States For Compliance Officer Modals End here
   */

  /**
   * Global States For Head Of Approval (HTA) Modals Start here
   */

  // To show Data inView Detail Modal
  const [viewDetailsHeadOfApprovalModal, setViewDetailsHeadOfApprovalModal] =
    useState(false);

  // To show Selected Data
  const [
    isSelectedViewDetailHeadOfApproval,
    setIsSelectedViewDetailHeadOfApproval,
  ] = useState(null);

  // to Show Approved Modal after Submitted When click on Head Of Approval
  const [headApprovalNoteModal, setHeadApprovalNoteModal] = useState(false);

  // to Show Decline Modal after submitted  When click on Head Of Decline
  const [headDeclineNoteModal, setHeadDeclineNoteModal] = useState(false);

  /**
   * Global States For Head Od Approval (HTA) Modals End here
   */

  /**
   * Global States For Head Of Compliance (HOC) Modals Start here
   */

  // To show View Detail Modal of HOC in Escalated Verification
  const [
    viewDetailHeadOfComplianceEscalated,
    setViewDetailHeadOfComplianceEscalated,
  ] = useState(false);

  // To show View Detail Modal of HOC in Escalated Portfolio
  const [
    viewDetailHeadOfComplianceEscalatedPortfolio,
    setViewDetailHeadOfComplianceEscalatedPortfolio,
  ] = useState(false);

  // To set Selected Data by click on View Detail Button of HOC in Escalated Verification
  const [
    isSelectedViewDetailOfHeadOfComplianceData,
    setIsSelectedViewDetailOfHeadOfComplianceData,
  ] = useState(null);

  /**
   * Global States For Head Of Compliance (HOC) Modals End here
   */

  /**
   * Global States For Admin Role Modals Start here
   */

  const [addNewBrokerModal, setAddNewBrokerModal] = useState(false);
  const [editBrokerModal, setEditBrokerModal] = useState(false);

  const [editModalData, setEditModalData] = useState(null);

  const [addBrokerConfirmationModal, setAddBrokerConfirmationModal] =
    useState(false);

  // For Edit Instrument modal
  const [editInstrumentModal, setEditInstrumentModal] = useState(false);

  //For Delete Edit Instrument Modal
  const [deleteConfirmationEditModal, setDeleteConfirmationEditModal] =
    useState(false);

  //For Delete Edit Instrument Data State
  const [deleteEditModalData, setDeleteEditModalData] = useState(null);

  // For Active Tabs In Manage Users in Admin
  const [activeManageUserTab, setActiveManageUserTab] = useState("1");

  // For manage user View Detail modal
  const [viewDetailManageUser, setViewDetailManageUser] = useState(false);

  // For manage user Roles And Policies modal
  const [rolesAndPoliciesManageUser, setRolesAndPoliciesManageUser] =
    useState(false);

  // For Edit ROle and Policies Modal
  const [editrolesAndPoliciesUser, setEditrolesAndPoliciesUser] =
    useState(false);

  // For unSaved Changes Modal
  const [unSavedChangesPoliciesModal, setUnSavedChangesPoliciesModal] =
    useState(false);

  /**
   * Global States For Admin Role Modals End here
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
    setViewDetailTransactionModal(false);
    setViewCommentTransactionModal(false);
    setSelectedViewDetailOfTransaction(null);
    setIsViewTicketTransactionModal(false);
    setIsResubmitted(false);
    setResubmitIntimation(false);
    setIsConductedTransaction(false);

    setViewDetailLineManagerModal(false);
    setIsSelectedViewDetailLineManager(false);
    setNoteGlobalModal({ visible: false, action: null });
    setApprovedGlobalModal(false);
    setDeclinedGlobalModal(false);
    setViewCommentGlobalModal(false);
    setUploadattAchmentsFiles([]);
  };

  const resetForLineManagerModal = () => {
    setViewDetailLineManagerModal(false);
    setNoteGlobalModal({ visible: false, action: null });
    setApprovedGlobalModal(false);
  };

  const resetStateForComplianceOfficer = () => {
    setViewDetailPortfolioTransaction(false);
    setCompliantApproveModal(false);
    setNonCompliantDeclineModal(false);
    setViewCommentReconcileModal(false);
    setUploadattAchmentsFiles([]);
    setViewCommentPortfolioModal(false);
    setCompliantPortfolioApproveModal(false);
    setNonCompliantPortfolioDeclineModal(false);
  };

  const resetStateForHeadOfApproval = () => {
    setViewDetailsHeadOfApprovalModal(false);
    setIsSelectedViewDetailHeadOfApproval(null);
    setHeadApprovalNoteModal(false);
    setHeadDeclineNoteModal(false);
  };

  const resetStateForHeadOfCompliance = () => {
    setViewDetailHeadOfComplianceEscalated(false);
    setIsSelectedViewDetailOfHeadOfComplianceData(null);
    setViewDetailHeadOfComplianceEscalatedPortfolio(false);
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

        selectedAssetTypeId,
        setSelectedAssetTypeId,

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
        viewDetailReconcileTransaction,
        setViewDetailReconcileTransaction,
        uploadComplianceModal,
        setUploadComplianceModal,
        viewDetailPortfolioTransaction,
        setViewDetailPortfolioTransaction,
        compliantApproveModal,
        setCompliantApproveModal,
        nonCompliantDeclineModal,
        setNonCompliantDeclineModal,
        viewCommentReconcileModal,
        setViewCommentReconcileModal,
        // uploaded files array for view
        uploadattAchmentsFiles,
        setUploadattAchmentsFiles,

        viewCommentPortfolioModal,
        setViewCommentPortfolioModal,

        compliantPortfolioApproveModal,
        setCompliantPortfolioApproveModal,

        nonCompliantPortfolioDeclineModal,
        setNonCompliantPortfolioDeclineModal,

        resetStateForComplianceOfficer,

        /**
         * Global States For Compliance Officer Modals End here
         */

        /**
         * Global States For Head Of Approval Modals Start here
         */

        // View Detail Data
        viewDetailsHeadOfApprovalModal,
        setViewDetailsHeadOfApprovalModal,

        // to set selected Data
        isSelectedViewDetailHeadOfApproval,
        setIsSelectedViewDetailHeadOfApproval,

        headApprovalNoteModal,
        setHeadApprovalNoteModal,

        headDeclineNoteModal,
        setHeadDeclineNoteModal,

        resetStateForHeadOfApproval,

        /**
         * Global States For Head Of Approval Modals End here
         */

        /**
         * Global States For Head Of Compliance Officer Modals Start here
         */
        viewDetailHeadOfComplianceEscalated,
        setViewDetailHeadOfComplianceEscalated,

        isSelectedViewDetailOfHeadOfComplianceData,
        setIsSelectedViewDetailOfHeadOfComplianceData,

        viewDetailHeadOfComplianceEscalatedPortfolio,
        setViewDetailHeadOfComplianceEscalatedPortfolio,

        resetStateForHeadOfCompliance,

        /**
         * Global States For Head Of Compliance Officer Modals End here
         */

        /**
         * Global States For Admin Role Modals Start here
         */

        addNewBrokerModal,
        setAddNewBrokerModal,

        editBrokerModal,
        setEditBrokerModal,

        editModalData,
        setEditModalData,

        addBrokerConfirmationModal,
        setAddBrokerConfirmationModal,

        // For Edit Instrument
        editInstrumentModal,
        setEditInstrumentModal,

        deleteEditModalData,
        setDeleteEditModalData,

        deleteConfirmationEditModal,
        setDeleteConfirmationEditModal,

        // For manage user
        activeManageUserTab,
        setActiveManageUserTab,
        viewDetailManageUser,
        setViewDetailManageUser,
        rolesAndPoliciesManageUser,
        setRolesAndPoliciesManageUser,
        editrolesAndPoliciesUser,
        setEditrolesAndPoliciesUser,
        unSavedChangesPoliciesModal,
        setUnSavedChangesPoliciesModal,

        /**
         * Global States For Admin Role Modals End here
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
