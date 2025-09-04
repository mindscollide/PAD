import {
  SearchApprovalRequestLineManager,
  SearchTadeApprovals,
} from "../../../api/myApprovalApi";
import { toYYMMDD } from "../../../commen/funtions/rejex";
import { mapBuySellToIds, mapStatusToIds, mapStatusToIdsForLineManager } from "../filters/utils";
import { EmployeeMyApprovalFilter } from "./EmployeeMyApprovalFilter";
import { EmployeePendingApprovalFilter } from "./EmployeePendingApprovalFilter";
import { EmployeePortfolioFilter } from "./EmployeePortfolioFilter";
import { EmployeeTransactionFilter } from "./EmployeeTransactionFilter";
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
  employeeMyApprovalSearch,
  employeeMyTransactionSearch,
  employeePortfolioSearch,
  employeePendingApprovalSearch,
  lineManagerApprovalSearch
) => {
  switch (selectedKey) {
    case "1":
      return employeeMyApprovalSearch.mainInstrumentName;
    case "2":
      return employeeMyTransactionSearch.mainInstrumentName;
    case "4":
      switch (activeTab) {
        case "portfolio":
          return employeePortfolioSearch.mainInstrumentShortName;
        case "pending":
          return employeePendingApprovalSearch.mainInstrumentName;
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
  value,
  setEmployeeMyApprovalSearch,
  setEmployeeMyTransactionSearch,
  setEmployeePortfolioSearch,
  setEmployeePendingApprovalSearch,
  setLineManagerApprovalSearch
) => {
  console.log(selectedKey, "cchechechechehc");
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
            mainInstrumentShortName: value,
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
    // Add more cases for other selectedKeys if needed

    default:
      break;
  }
};

// this is for reset main input to its initial sate when its popover opens
export const handleSearchMainInputReset = ({
  selectedKey,
  activeTab,
  setEmployeeMyApprovalSearch,
  setEmployeeMyTransactionSearch,
  setEmployeePortfolioSearch,
  setEmployeePendingApprovalSearch,
  setLineManagerApprovalSearch,
}) => {
  console.log(selectedKey, "cchechechechehc");
  switch (selectedKey) {
    case "1":
      setEmployeeMyApprovalSearch((prev) => ({
        ...prev,
        mainInstrumentName: "",
      }));
      break;

    case "2":
      setEmployeeMyTransactionSearch((prev) => ({
        ...prev,
        mainInstrumentName: "",
      }));
      break;
    case "4":
      switch (activeTab) {
        case "portfolio":
          setEmployeePortfolioSearch((prev) => ({
            ...prev,
            mainInstrumentShortName: "",
          }));
          break;
        case "pending":
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
    case "6":
      setLineManagerApprovalSearch((prev) => ({
        ...prev,
        mainInstrumentName: "",
      }));
      break;

    default:
      break;
  }
};

// this is used for open specific filter according to page
export const renderFilterContent = (
  selectedKey,
  activeTab,
  handleSearch,
  setVisible
) => {
  console.log(activeTab, "Checker Search Coming");
  console.log("SearchWithPopoverOnly selectedKey", selectedKey);
  switch (selectedKey) {
    case "1":
      return (
        <EmployeeMyApprovalFilter
          handleSearch={handleSearch}
          setVisible={setVisible}
        />
      );

    case "2":
      return (
        <EmployeeTransactionFilter
          handleSearch={handleSearch}
          setVisible={setVisible}
        />
      );
    // just cominting for for sprint 6
    // case "4":
    //   switch (activeTab) {
    //     case "portfolio":
    //       return (
    //         <EmployeePortfolioFilter
    //           handleSearch={handleSearch}
    //           setVisible={setVisible}
    //         />
    //       );
    //     case "pending":
    //       return <EmployeePendingApprovalFilter handleSearch={handleSearch} />;
    //     default:
    //       return null;
    //   }
    case "4":
      return (
        <EmployeePortfolioFilter
          handleSearch={handleSearch}
          activeTab={activeTab}
        />
      );

    case "6":
      return (
        <LineManagerApprovalFilter
          handleSearch={handleSearch}
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
        const date = toYYMMDD(employeeMyApprovalSearch.startDate);
        console.log(typeof date, "Chdhjvahvajvdas");

        const requestdata = {
          InstrumentName:
            employeeMyApprovalSearch.instrumentName ||
            employeeMyApprovalSearch.mainInstrumentName ||
            "",
          Date: date || "",
          Quantity: employeeMyApprovalSearch.quantity || 0,
          StatusIds: statusIds || [],
          TypeIds: TypeIds || [],
          PageNumber: 0,
          Length: employeeMyApprovalSearch.pageSize || 10, // Fixed page size
        };
        console.log(requestdata, "Checker APi Search");
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
        // Add case 2 logic here when needed
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
    console.log(selectedKey, "CheckSelctedKey");
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

      case "6":
        // Add case 3 logic here when needed
        const TypeIds = mapBuySellToIds(
          lineManagerApprovalSearch.type,
          addApprovalRequestData?.Equities
        );

        const statusIds = mapStatusToIdsForLineManager(lineManagerApprovalSearch.status);
        const date = toYYMMDD(lineManagerApprovalSearch.startDate);
        console.log(typeof date, "Chdhjvahvajvdas");

        const requestdata = {
          InstrumentName:
            lineManagerApprovalSearch.instrumentName ||
            lineManagerApprovalSearch.mainInstrumentName ||
            "",
          Date: date || "",
          Quantity: lineManagerApprovalSearch.quantity || 0,
          StatusIds: statusIds || [],
          TypeIds: TypeIds || [],
          PageNumber: 0,
          Length: lineManagerApprovalSearch.pageSize || 10, // Fixed page size
          RequesterName: lineManagerApprovalSearch.requesterName || "",
        };
        console.log(requestdata, "Checker APi Search");
        const data = await SearchApprovalRequestLineManager({
          callApi,
          showNotification,
          showLoader,
          requestdata,
          navigate,
        });

        setData(data);
        break;

      default:
        console.warn(`No matching case for selectedKey: ${selectedKey}`);
        break;
    }
  } finally {
    showLoader(false);
  }
};
