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
import { ComplianceReconcileFilter } from "./ComplianceReconsile";
import { EmployeeMyApprovalFilter } from "./EmployeeMyApprovalFilter";
import { EmployeePortfolioFilter } from "./EmployeePortfolioFilter";
import { EmployeeTransactionFilter } from "./EmployeeTransactionFilter";
import { HcaReconcileFilter } from "./HcaReconcileFilter";
import { HeadOfTradeEscalatedFilter } from "./HeadOfTradeEscalatedFilter";
import { LineManagerApprovalFilter } from "./LineManagerApprovalFilter";

// this is used for open specific filter according to page
export const renderFilterContent = (
  selectedKey,
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
          setVisible={setVisible}
          clear={clear}
          setClear={setClear}
          maininstrumentName={searchMain}
          setMaininstrumentName={setSearchMain}
        />
      );
    case "9":
      return (
        <ComplianceReconcileFilter
          setVisible={setVisible}
          clear={clear}
          setClear={setClear}
          maininstrumentName={searchMain}
          setMaininstrumentName={setSearchMain}
        />
      );
    case "12":
      return (
        <HeadOfTradeEscalatedFilter
          setVisible={setVisible}
          clear={clear}
          setClear={setClear}
          maininstrumentName={searchMain}
          setMaininstrumentName={setSearchMain}
        />
      );
    case "15":
      return (
        <HcaReconcileFilter
          setVisible={setVisible}
          clear={clear}
          setClear={setClear}
          maininstrumentName={searchMain}
          setMaininstrumentName={setSearchMain}
        />
      );
    // 🔧 Add more cases for keys "3" to "17" as needed below
 

    default:
      return null; // Fallback if no matching key
  }
};

// apiCallSearch.js
export const apiCallSearch = async ({
  selectedKey,
  employeeMyApprovalSearch,
  employeeMyTransactionSearch,
  assetTypeListingData,
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
          assetTypeListingData?.Equities
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
            assetTypeListingData?.Equities
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
