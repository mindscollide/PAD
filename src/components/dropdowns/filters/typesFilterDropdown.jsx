import styles from "./filter.module.css";
import { Button, CheckBox } from "../..";
import { getTypeOptions } from "./utils";
import { Row, Col, Divider } from "antd";
import { useSidebarContext } from "../../../context/sidebarContaxt";
import { useNavigate } from "react-router-dom";
import { useGlobalLoader } from "../../../context/LoaderContext";
import { useApi } from "../../../context/ApiContext";
import { useNotification } from "../../NotificationProvider/NotificationProvider";
import { useMyApproval } from "../../../context/myApprovalContaxt";
import { useDashboardContext } from "../../../context/dashboardContaxt";
import { useTransaction } from "../../../context/myTransaction";

/**
 * Dropdown for selecting types with local state management.
 */
const TypeFilterDropdown = ({
  confirm,
  clearFilters,
  setState,
  tempSelected,
  setTempSelected,
}) => {
  const { selectedKey } = useSidebarContext();
  const { assetTypeListingData } = useDashboardContext();

  const typeOptions = getTypeOptions(assetTypeListingData);
  const toggleSelection = (type) => {
    setTempSelected((prev) =>
      prev.includes(type)
        ? prev.filter((item) => item !== type)
        : [...prev, type]
    );
  };

  const handleOk = async () => {
    switch (selectedKey) {
      // 🔹 Keys that only update state with filterTrigger = true
      case "1":
      case "2":
      case "3":
      case "4":
      case "5":
      case "6":
      case "8":
      case "9":
      case "12":
      case "15":
        setState((prev) => ({
          ...prev,
          type: tempSelected,
          pageNumber: 0,
          filterTrigger: true,
        }));
        break;

      // 🔹 Default: Update state and call API
      default:
        break;
    }

    // 🔹 Common action: always close dropdown
    confirm();
  };

  const handleReset = async () => {
    switch (selectedKey) {
      // 🔹 Cases where we just reset state
      case "1":
      case "2":
      case "3":
      case "4":
      case "5":
      case "6":
      case "8":
      case "9":
      case "12":
      case "15":
        setState((prev) => ({
          ...prev,
          type: [],
          pageNumber: 0,
          filterTrigger: true,
        }));
        break;

      // 🔹 Default: Call API, then reset state (without filterTrigger)
      default:
        break;
    }

    // 🔹 Common cleanup (runs after all cases)
    setTempSelected([]);
    clearFilters?.();
    confirm(); // close dropdown
  };

  return (
    <div className={styles.dropdownContainerForType}>
      <div className={styles.checkboxList}>
        {typeOptions.map((type, index) => (
          <>
            <CheckBox
              key={type.assetTypeID}
              value={type.label}
              label={type.label}
              checked={tempSelected.includes(type.label)}
              onChange={() => toggleSelection(type.label)}
            />
            {typeOptions.length - 1 !== index && (
              <Divider className={styles.divider} />
            )}
          </>
        ))}
      </div>

      <div className={styles.buttonGroup}>
        <Row gutter={10}>
          <Col>
            <Button
              className="small-light-button-For-Types"
              text="Reset"
              onClick={handleReset}
            />
          </Col>
          <Col>
            <Button
              className="small-dark-button-For-Types"
              text="Ok"
              onClick={handleOk}
            />
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default TypeFilterDropdown;
