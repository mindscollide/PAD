import {
  SearchApprovalRequestLineManager,
  SearchTadeApprovals,
} from "../../../api/myApprovalApi";
import { SearchEmployeeTransactionsDetails } from "../../../api/myTransactionsApi";
import { toYYMMDD } from "../../../common/funtions/rejex";
import {
  mapBuySellToIds,
  mapStatusToIds,
  mapStatusToIdsForLineManager,
} from "../filters/utils";
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
  pageTabesForAdminGropusAndPolicy
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
      } else if (currentPath === "/PAD/reports/transaction_report") {
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
      return (
        <AdminUsersTabFilter
          setVisible={setVisible}
          clear={clear}
          setClear={setClear}
          maininstrumentName={searchMain}
          setMaininstrumentName={setSearchMain}
        />
      );

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
