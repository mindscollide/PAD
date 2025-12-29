import {
  SearchApprovalRequestLineManager,
  SearchTadeApprovals,
} from "../../../api/myApprovalApi";
import { SearchEmployeeTransactionsDetails } from "../../../api/myTransactionsApi";
import { AdminBrokersListFiletr } from "./AdminBrokersListFilter";
import { AdminInstrumentsListFilter } from "./AdminInstrumentsListFilter";
import { AdminPoliciesAndGroupUsersTabFilter } from "./AdminPoliciesAndGroupUsersTabFilter";
import { AdminPoliciesFilter } from "./AdminPoliciesFilter";
import { AdminUsersTabFilter } from "./AdminMnageUsersTabFilter";
import { ComplianceReconcileFilter } from "./ComplianceReconsile";
import { EmployeeMyApprovalFilter } from "./EmployeeMyApprovalFilter";
import { EmployeePortfolioFilter } from "./EmployeePortfolioFilter";
import { EmployeeTransactionFilter } from "./EmployeeTransactionFilter";
import { HcaReconcileFilter } from "./HcaReconcileFilter";
import { HeadOfTradeEscalatedFilter } from "./HeadOfTradeEscalatedFilter";
import { LineManagerApprovalFilter } from "./LineManagerApprovalFilter";
import { EmployeeHistoryFilter } from "./EmployeeHistoryFilter";
import { LineManagerMyAction } from "./LineManagerMyActionFilter";
import { EmployeeTransactionReportFilter } from "./EmployeeTransactionReportFilter";
import { EmployeeMyTradeApprovalsReportsFilter } from "./EmployeeMyTradeApprovalsreports";
import { LineManagerMyTradeApprovalsReports } from "./LineManagerMyTradeApprovalsReports";
import { CODateWiseTransactionReportFilter } from "./CODateWiseTransactionReportFilter";
import { AdminSessionWiseActivityFilter } from "./AdminSessionWiseActivity";
import { COMyAction } from "./COMyAction";
import { LMPendigRequestReportSearchFilter } from "./LMPendigRequestReportSearchFilter";
import { COOverdueVerifications } from "./COOverdueVerifications";
import { COTransactionReportViewDetailsFilter } from "./COTransactionReportViewDetailsFilter";
import { HCOTradeUploadedViaPortfolioFilter } from "./HCOTradeUploadedViaPortfolioFilter";

// this is used for open specific filter according to page
export const renderFilterContent = (
  currentPath,
  selectedKey,
  setVisible,
  searchMain,
  setSearchMain,
  clear,
  setClear,
  openNewFormForAdminGropusAndPolicy,
  pageTabesForAdminGropusAndPolicy,
  coTransactionSummaryReportViewDetailsFlag
) => {
  switch (selectedKey) {
    case "1": // Employee → My Approval
      return (
        <EmployeeMyApprovalFilter
          setVisible={setVisible}
          clear={clear}
          setClear={setClear}
          maininstrumentName={searchMain}
          setMaininstrumentName={setSearchMain}
        />
      );

    case "2": // Employee → My Transaction
      return (
        <EmployeeTransactionFilter
          setVisible={setVisible}
          clear={clear}
          setClear={setClear}
          maininstrumentName={searchMain}
          setMaininstrumentName={setSearchMain}
        />
      );

    case "3": // Employee → My History
      return (
        <EmployeeHistoryFilter
          setVisible={setVisible}
          clear={clear}
          setClear={setClear}
          maininstrumentName={searchMain}
          setMaininstrumentName={setSearchMain}
        />
      );

    case "4": // Employee → Portfolio / Pending
      return (
        <EmployeePortfolioFilter
          setVisible={setVisible}
          clear={clear}
          setClear={setClear}
          maininstrumentName={searchMain}
          setMaininstrumentName={setSearchMain}
        />
      );

    case "5": // Employee → Report
      if (currentPath === "/PAD/reports/my-trade-approvals") {
        return (
          <EmployeeMyTradeApprovalsReportsFilter
            setVisible={setVisible}
            clear={clear}
            setClear={setClear}
            maininstrumentName={searchMain}
            setMaininstrumentName={setSearchMain}
          />
        );
      } else if (currentPath === "/PAD/reports/my-transactions") {
        return (
          <EmployeeTransactionReportFilter
            setVisible={setVisible}
            clear={clear}
            setClear={setClear}
            maininstrumentName={searchMain}
            setMaininstrumentName={setSearchMain}
          />
        );
      }

      return null;

    case "6": // Line Manager Approval
      return (
        <LineManagerApprovalFilter
          setVisible={setVisible}
          clear={clear}
          setClear={setClear}
          maininstrumentName={searchMain}
          setMaininstrumentName={setSearchMain}
        />
      );

    case "7": // LineManager → My Actions
      return (
        <LineManagerMyAction
          setVisible={setVisible}
          clear={clear}
          setClear={setClear}
          maininstrumentName={searchMain}
          setMaininstrumentName={setSearchMain}
        />
      );

    case "8": // LineManager → reports pending approvals
      if (currentPath === "/PAD/lm-reports/lm-pending-request") {
        return (
          <LMPendigRequestReportSearchFilter
            setVisible={setVisible}
            clear={clear}
            setClear={setClear}
            maininstrumentName={searchMain}
            setMaininstrumentName={setSearchMain}
          />
        );
      } else if (currentPath === "/PAD/lm-reports/lm-tradeapproval-request") {
        return (
          <LineManagerMyTradeApprovalsReports
            setVisible={setVisible}
            clear={clear}
            setClear={setClear}
            maininstrumentName={searchMain}
            setMaininstrumentName={setSearchMain}
          />
        );
      }
      return null;

    case "9": // Compliance Officer → Reconcile
      return (
        <ComplianceReconcileFilter
          setVisible={setVisible}
          clear={clear}
          setClear={setClear}
          maininstrumentName={searchMain}
          setMaininstrumentName={setSearchMain}
        />
      );

    case "10": // Compliance Officer → Reconcile
      return (
        <COMyAction
          setVisible={setVisible}
          clear={clear}
          setClear={setClear}
          maininstrumentName={searchMain}
          setMaininstrumentName={setSearchMain}
        />
      );

    case "11": // Compliance officer → reports pending approvals
      if (currentPath === "/PAD/co-reports/co-date-wise-transaction-report") {
        return (
          <CODateWiseTransactionReportFilter
            setVisible={setVisible}
            clear={clear}
            setClear={setClear}
            maininstrumentName={searchMain}
            setMaininstrumentName={setSearchMain}
          />
        );
      } else if (currentPath === "/PAD/co-reports/co-overdue-verifications") {
        return (
          <COOverdueVerifications
            setVisible={setVisible}
            clear={clear}
            setClear={setClear}
            maininstrumentName={searchMain}
            setMaininstrumentName={setSearchMain}
          />
        );
      } else if (coTransactionSummaryReportViewDetailsFlag) {
        return (
          <COTransactionReportViewDetailsFilter
            setVisible={setVisible}
            clear={clear}
            setClear={setClear}
            maininstrumentName={searchMain}
            setMaininstrumentName={setSearchMain}
          />
        );
      }
      return null;

    case "12": // HTA Escalated
      return (
        <HeadOfTradeEscalatedFilter
          setVisible={setVisible}
          clear={clear}
          setClear={setClear}
          maininstrumentName={searchMain}
          setMaininstrumentName={setSearchMain}
        />
      );

    case "14": // HTA → reports pending approvals
      if (currentPath === "/PAD/hta-reports/hta-trade-approval-requests") {
        return (
          <LineManagerMyTradeApprovalsReports
            setVisible={setVisible}
            clear={clear}
            setClear={setClear}
            maininstrumentName={searchMain}
            setMaininstrumentName={setSearchMain}
          />
        );
      }
      return null;

    case "15": // HCA Escalated
      return (
        <HcaReconcileFilter
          setVisible={setVisible}
          clear={clear}
          setClear={setClear}
          maininstrumentName={searchMain}
          setMaininstrumentName={setSearchMain}
        />
      );

    case "17":
      if (currentPath === "/PAD/hca-reports/hca-overdue-verifications") {
        return (
          <COOverdueVerifications
            setVisible={setVisible}
            clear={clear}
            setClear={setClear}
            maininstrumentName={searchMain}
            setMaininstrumentName={setSearchMain}
          />
        );
      } else if (currentPath === "/PAD/hca-reports/hca-upload-portfolio") {
        return (
          <HCOTradeUploadedViaPortfolioFilter
            setVisible={setVisible}
            clear={clear}
            setClear={setClear}
            maininstrumentName={searchMain}
            setMaininstrumentName={setSearchMain}
          />
        );
      } else if (
        currentPath === "/PAD/hca-reports/hca-date-wise-transaction-report"
      ) {
        return (
          <CODateWiseTransactionReportFilter
            setVisible={setVisible}
            clear={clear}
            setClear={setClear}
            maininstrumentName={searchMain}
            setMaininstrumentName={setSearchMain}
          />
        );
      }
      break;

    case "18": // Admin Instrument List
      return (
        <AdminInstrumentsListFilter
          setVisible={setVisible}
          clear={clear}
          setClear={setClear}
          maininstrumentName={searchMain}
          setMaininstrumentName={setSearchMain}
        />
      );

    case "19": // Admin Brokers List
      return (
        <AdminBrokersListFiletr
          setVisible={setVisible}
          clear={clear}
          setClear={setClear}
          maininstrumentName={searchMain}
          setMaininstrumentName={setSearchMain}
        />
      );

    case "21": // Admin Manage User
      if (currentPath === "/PAD/admin-users/session-wise-activity") {
        return (
          <AdminSessionWiseActivityFilter
            setVisible={setVisible}
            clear={clear}
            setClear={setClear}
            maininstrumentName={searchMain}
            setMaininstrumentName={setSearchMain}
          />
        );
      } else {
        return (
          <AdminUsersTabFilter
            setVisible={setVisible}
            clear={clear}
            setClear={setClear}
            maininstrumentName={searchMain}
            setMaininstrumentName={setSearchMain}
          />
        );
      }

    case "20": // groupe listing create edit and view
      console.log("AdminPoliciesFilter");

      if (
        openNewFormForAdminGropusAndPolicy &&
        pageTabesForAdminGropusAndPolicy === 1
      ) {
        return (
          <AdminPoliciesFilter
            setVisible={setVisible}
            clear={clear}
            setClear={setClear}
            maininstrumentName={searchMain}
            setMaininstrumentName={setSearchMain}
          />
        );
      } else if (
        openNewFormForAdminGropusAndPolicy &&
        pageTabesForAdminGropusAndPolicy === 2
      ) {
        return (
          <AdminPoliciesAndGroupUsersTabFilter
            setVisible={setVisible}
            clear={clear}
            setClear={setClear}
            maininstrumentName={searchMain}
            setMaininstrumentName={setSearchMain}
          />
        );
      }

    // 🔧 Add more cases for keys "3" to "17" as needed below

    default:
      return null; // Fallback if no matching key
  }
};
