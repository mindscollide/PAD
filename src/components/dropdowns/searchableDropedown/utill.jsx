import {
  SearchApprovalRequestLineManager,
  SearchTadeApprovals,
} from "../../../api/myApprovalApi";
import { SearchEmployeeTransactionsDetails } from "../../../api/myTransactionsApi";
import { toYYMMDD } from "../../../commen/funtions/rejex";
import {
  mapBuySellToIds,
  mapStatusToIds,
  mapStatusToIdsForLineManager,
} from "../filters/utils";
import { ComplianceReconcileFilter } from "./ComplianceReconsile";
import { EmployeeMyApprovalFilter } from "./EmployeeMyApprovalFilter";
import { EmployeePortfolioFilter } from "./EmployeePortfolioFilter";
import { EmployeeTransactionFilter } from "./EmployeeTransactionFilter";
import { HcaReconcileFilter } from "./HcaReconcileFilter";
import { HeadOfTradeEscalatedFilter } from "./HeadOfTradeEscalatedFilter";
import { LineManagerApprovalFilter } from "./LineManagerApprovalFilter";

/**
 * Renders filter content based on the selected key.
 *
 * @param {string} selectedKey - The key representing which filter component to show.
 * @param {function} handleSearch - The search handler to be passed to the components.
 * @returns {JSX.Element|null} The appropriate filter component or null if key doesn't match.
 */

// this is for value of a search by current selected key that key is side bar selected page route
export const getMainSearchInputValueByKey = (
  selectedKey,
  activeTab,
  reconcileActiveTab,
  activeTabHCO,
  employeeMyApprovalSearch,
  employeeMyTransactionSearch,
  employeePortfolioSearch,
  employeePendingApprovalSearch,
  lineManagerApprovalSearch,
  complianceOfficerReconcilePortfolioSearch,
  complianceOfficerReconcileTransactionsSearch,
  headOfComplianceApprovalEscalatedVerificationsSearch,
  headOfComplianceApprovalPortfolioSearch,
  headOfTradeEscalatedApprovalsSearch
) => {
  switch (selectedKey) {
    case "1":
      return employeeMyApprovalSearch.mainInstrumentName;
    case "2":
      return employeeMyTransactionSearch.mainInstrumentName;
    case "4":
      switch (activeTab) {
        case "portfolio":
          return employeePortfolioSearch.mainInstrumentName;
        case "pending":
          return employeePendingApprovalSearch.mainInstrumentName;
        default:
          return "";
      }
    case "9":
      switch (reconcileActiveTab) {
        case "transactions":
          return complianceOfficerReconcileTransactionsSearch.mainInstrumentName;
        case "portfolio":
          return complianceOfficerReconcilePortfolioSearch.mainInstrumentName;
        default:
          return "";
      }
    case "12":
      return headOfTradeEscalatedApprovalsSearch.mainInstrumentName;
    case "15":
      switch (activeTabHCO) {
        case "escalated":
          return headOfComplianceApprovalEscalatedVerificationsSearch.mainInstrumentName;
        case "portfolio":
          return headOfComplianceApprovalPortfolioSearch.mainInstrumentName;
        default:
          return "";
      }
    case "6":
      return lineManagerApprovalSearch.mainInstrumentName;
      break;

    // Add more cases as needed
    default:
      return "";
  }
};

// this is for set value of a search by current selected key that key is side bar selected page route
export const handleMainInstrumentChange = (
  selectedKey,
  activeTab,
  reconcileActiveTab,
  activeTabHCO,
  value,
  setEmployeeMyApprovalSearch,
  setEmployeeMyTransactionSearch,
  setEmployeePortfolioSearch,
  setEmployeePendingApprovalSearch,
  setLineManagerApprovalSearch,
  setComplianceOfficerReconcilePortfolioSearch,
  setComplianceOfficerReconcileTransactionsSearch,
  setHeadOfComplianceApprovalEscalatedVerificationsSearch,
  setHeadOfComplianceApprovalPortfolioSearch,
  setHeadOfTradeEscalatedApprovalsSearch
) => {
  switch (selectedKey) {
    case "1":
      setEmployeeMyApprovalSearch((prev) => ({
        ...prev,
        mainInstrumentName: value,
      }));
      break;

    case "2":
      setEmployeeMyTransactionSearch((prev) => ({
        ...prev,
        mainInstrumentName: value,
      }));
      break;

    case "4":
      switch (activeTab) {
        case "portfolio":
          setEmployeePortfolioSearch((prev) => ({
            ...prev,
            mainInstrumentName: value,
          }));
          break;
        case "pending":
          setEmployeePendingApprovalSearch((prev) => ({
            ...prev,
            mainInstrumentName: value,
          }));
          break;
        default:
          setEmployeePortfolioSearch((prev) => ({
            ...prev,
            mainInstrumentShortName: value,
          }));
      }

      break;

    case "6":
      setLineManagerApprovalSearch((prev) => ({
        ...prev,
        mainInstrumentName: value,
      }));
      break;

    case "9":
      switch (reconcileActiveTab) {
        case "transactions":
          setComplianceOfficerReconcileTransactionsSearch((prev) => ({
            ...prev,
            mainInstrumentName: value,
          }));
          break;
        case "portfolio":
          setComplianceOfficerReconcilePortfolioSearch((prev) => ({
            ...prev,
            mainInstrumentName: value,
          }));
          break;
        default:
          setComplianceOfficerReconcileTransactionsSearch((prev) => ({
            ...prev,
            mainInstrumentShortName: value,
          }));
      }

      break;

    case "12":
      setHeadOfTradeEscalatedApprovalsSearch((prev) => ({
        ...prev,
        mainInstrumentName: value,
      }));
      break;

    case "15":
      switch (activeTabHCO) {
        case "escalated":
          setHeadOfComplianceApprovalEscalatedVerificationsSearch((prev) => ({
            ...prev,
            mainInstrumentName: value,
          }));
          break;
        case "portfolio":
          setHeadOfComplianceApprovalPortfolioSearch((prev) => ({
            ...prev,
            mainInstrumentName: value,
          }));
          break;
        default:
          setEmployeePortfolioSearch((prev) => ({
            ...prev,
            mainInstrumentShortName: value,
          }));
      }

      break;

    // Add more cases for other selectedKeys if needed

    default:
      break;
  }
};

// this is for reset main input to its initial sate when its popover opens
export const handleSearchMainInputReset = ({
  selectedKey,
  activeTab,
  reconcileActiveTab,
  activeTabHCO,
  setEmployeeMyApprovalSearch,
  setEmployeeMyTransactionSearch,
  setEmployeePortfolioSearch,
  setEmployeePendingApprovalSearch,
  setLineManagerApprovalSearch,
  setComplianceOfficerReconcilePortfolioSearch,
  setComplianceOfficerReconcileTransactionsSearch,
  setHeadOfComplianceApprovalEscalatedVerificationsSearch,
  setHeadOfComplianceApprovalPortfolioSearch,
  setHeadOfTradeEscalatedApprovalsSearch,
}) => {
  switch (selectedKey) {
    case "1":
      // setEmployeeMyApprovalSearch((prev) => ({
      //   ...prev,
      //   mainInstrumentName: "",
      // }));
      break;

    case "2":
      // setEmployeeMyTransactionSearch((prev) => ({
      //   ...prev,
      //   mainInstrumentName: "",
      // }));
      break;

    case "4":
      // switch (activeTab) {
      //   case "portfolio":
      //     setComplianceOfficerReconcileTransactionsSearch((prev) => ({
      //       ...prev,
      //       mainInstrumentName: "",
      //     }));
      //     break;
      //   case "pending":
      //     setComplianceOfficerReconcilePortfolioSearch((prev) => ({
      //       ...prev,
      //       mainInstrumentName: "",
      //     }));
      //     break;
      //   default:
      //     setComplianceOfficerReconcileTransactionsSearch((prev) => ({
      //       ...prev,
      //       mainInstrumentShortName: "",
      //     }));
      // }

      break;

    case "6":
      setLineManagerApprovalSearch((prev) => ({
        ...prev,
        mainInstrumentName: "",
      }));
      break;

    case "9":
      switch (reconcileActiveTab) {
        case "transactions":
          setEmployeePortfolioSearch((prev) => ({
            ...prev,
            mainInstrumentName: "",
          }));
          break;
        case "portfolio":
          setEmployeePendingApprovalSearch((prev) => ({
            ...prev,
            mainInstrumentName: "",
          }));
          break;
        default:
          setEmployeePortfolioSearch((prev) => ({
            ...prev,
            mainInstrumentShortName: "",
          }));
      }

      break;

    case "12":
      setHeadOfTradeEscalatedApprovalsSearch((prev) => ({
        ...prev,
        mainInstrumentName: "",
      }));
      break;

    case "15":
      switch (activeTabHCO) {
        case "escalated":
          setHeadOfComplianceApprovalEscalatedVerificationsSearch((prev) => ({
            ...prev,
            mainInstrumentName: "",
          }));
          break;
        case "portfolio":
          setHeadOfComplianceApprovalPortfolioSearch((prev) => ({
            ...prev,
            mainInstrumentName: "",
          }));
          break;
        default:
          setHeadOfComplianceApprovalPortfolioSearch((prev) => ({
            ...prev,
            mainInstrumentShortName: "",
          }));
      }

      break;

    default:
      break;
  }
};

// this is used for open specific filter according to page
export const renderFilterContent = (
  selectedKey,
  activeTab,
  reconcileActiveTab,
  activeTabHCO,
  handleSearch,
  visible,
  setVisible,
  searchMain,
  setSearchMain,
  clear,
  setClear
) => {
  switch (selectedKey) {
    case "1":
      return (
        <EmployeeMyApprovalFilter
          setVisible={setVisible}
          clear={clear}
          setClear={setClear}
          maininstrumentName={searchMain}
          setMaininstrumentName={setSearchMain}
        />
      );

    case "2":
      return (
        <EmployeeTransactionFilter
          setVisible={setVisible}
          clear={clear}
          setClear={setClear}
          maininstrumentName={searchMain}
          setMaininstrumentName={setSearchMain}
        />
      );
    case "4":
      return (
        <EmployeePortfolioFilter
          activeTab={activeTab}
          setVisible={setVisible}
          clear={clear}
          setClear={setClear}
          maininstrumentName={searchMain}
          setMaininstrumentName={setSearchMain}
        />
      );

    case "6":
      return (
        <LineManagerApprovalFilter
          handleSearch={handleSearch}
          setVisible={setVisible}
        />
      );
    case "9":
      return (
        <ComplianceReconcileFilter
          handleSearch={handleSearch}
          activeTab={reconcileActiveTab}
          setVisible={setVisible}
        />
      );
    case "12":
      return (
        <HeadOfTradeEscalatedFilter
          handleSearch={handleSearch}
          setVisible={setVisible}
        />
      );
    case "15":
      return (
        <HcaReconcileFilter
          handleSearch={handleSearch}
          activeTab={activeTabHCO}
          setVisible={setVisible}
        />
      );
    // 🔧 Add more cases for keys "3" to "17" as needed below
    // case "3":
    //   return <SomeOtherFilterComponent handleSearch={handleSearch} />;
    // case "4":
    //   return <AnotherFilterComponent handleSearch={handleSearch} />;

    default:
      return null; // Fallback if no matching key
  }
};

// apiCallSearch.js
export const apiCallSearch = async ({
  selectedKey,
  employeeMyApprovalSearch,
  employeeMyTransactionSearch,
  addApprovalRequestData,
  callApi,
  showNotification,
  showLoader,
  navigate,
  setData,
}) => {
  showLoader(true);

  try {
    switch (selectedKey) {
      case "1": {
        const TypeIds = mapBuySellToIds(
          employeeMyApprovalSearch.type,
          addApprovalRequestData?.Equities
        );

        const statusIds = mapStatusToIds(employeeMyApprovalSearch.status);

        const requestdata = {
          InstrumentName:
            employeeMyApprovalSearch.instrumentName ||
            employeeMyApprovalSearch.mainInstrumentName ||
            "",
          Date: toYYMMDD(employeeMyApprovalSearch.startDate) || "",
          Quantity: employeeMyApprovalSearch.quantity || 0,
          StatusIds: statusIds || [],
          TypeIds: TypeIds || [],
          PageNumber: 0,
          Length: employeeMyApprovalSearch.pageSize || 10, // Fixed page size
        };
        const data = await SearchTadeApprovals({
          callApi,
          showNotification,
          showLoader,
          requestdata,
          navigate,
        });

        setData(data);
        break;
      }

      case "2":
        {
          // Add case 2 logic here when needed
          const TypeIds = mapBuySellToIds(
            employeeMyTransactionSearch.type,
            addApprovalRequestData?.Equities
          );

          const statusIds = mapStatusToIds(employeeMyTransactionSearch.status);

          const requestdata = {
            InstrumentName:
              employeeMyTransactionSearch.instrumentName ||
              employeeMyTransactionSearch.mainInstrumentName ||
              "",
            Quantity: employeeMyTransactionSearch.quantity || 0,
            StartDate: employeeMyTransactionSearch.startDate
              ? toYYMMDD(employeeMyTransactionSearch.startDate)
              : "",
            EndDate: employeeMyTransactionSearch.endDate
              ? toYYMMDD(employeeMyTransactionSearch.endDate)
              : "",
            BrokerIDs: employeeMyTransactionSearch.brokerIDs || [],
            StatusIds: statusIds || [],
            TypeIds: TypeIds || [],
            PageNumber: 0,
            Length: employeeMyTransactionSearch.pageSize || 10, // Fixed page size
          };
          const data = await SearchEmployeeTransactionsDetails({
            callApi,
            showNotification,
            showLoader,
            requestdata,
            navigate,
          });

          setData(data);
        }
        break;

      case "3":
        // Add case 3 logic here when needed
        break;

      case "6":
        // Add case 3 logic here when needed
        break;

      default:
        console.warn(`No matching case for selectedKey: ${selectedKey}`);
        break;
    }
  } finally {
    showLoader(false);
  }
};

export const apiCallSearchForLineManager = async ({
  selectedKey,
  lineManagerApprovalSearch,
  addApprovalRequestData,
  callApi,
  showNotification,
  showLoader,
  navigate,
  setData,
}) => {
  showLoader(true);

  try {
    switch (selectedKey) {
      case "1": {
        break;
      }

      case "2":
        // Add case 2 logic here when needed
        break;

      case "3":
        // Add case 3 logic here when needed
        break;

      case "6": {
        const {
          type,
          status,
          startDate,
          instrumentName = "",
          mainInstrumentName = "",
          quantity = 0,
          pageSize = 10,
          requesterName = "",
        } = lineManagerApprovalSearch;

        const requestdata = {
          InstrumentName: instrumentName || mainInstrumentName,
          Date: toYYMMDD(startDate) || "",
          Quantity: quantity,
          StatusIds: mapStatusToIdsForLineManager(status) || [],
          TypeIds:
            mapBuySellToIds(type, addApprovalRequestData?.Equities) || [],
          PageNumber: 0,
          Length: pageSize,
          RequesterName: requesterName,
        };

        const data = await SearchApprovalRequestLineManager({
          callApi,
          showNotification,
          showLoader,
          requestdata,
          navigate,
        });

        setData(data);
        break;
      }

      default:
        console.warn(`No matching case for selectedKey: ${selectedKey}`);
        break;
    }
  } finally {
    showLoader(false);
  }
};
