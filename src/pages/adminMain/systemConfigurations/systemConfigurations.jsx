/**
 * @file SystemConfigurations.jsx
 * @description
 * Displays and manages all system configuration settings fetched from the API.
 * Users can modify configuration values (text or number) and save or discard changes.
 * Integrates with global contexts for API calls, loader management, and notifications.
 */

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Col, Input, Row } from "antd";
import { useNavigate } from "react-router-dom";

// 🔹 Contexts
import { useGlobalLoader } from "../../../context/LoaderContext";
import { useApi } from "../../../context/ApiContext";
import { useSearchBarContext } from "../../../context/SearchBarContaxt";
import { useNotification } from "../../../components/NotificationProvider/NotificationProvider";

// 🔹 Components
import { BorderlessTable, Button, PageLayout } from "../../../components";
import CustomDatePicker from "../../../components/dateSelector/datePicker/datePicker";
import Intimationmodal from "./modal/intimationmodal";

// 🔹 API
import {
  GetAllSystemConfigurations,
  UpdateSystemConfiguration,
} from "../../../api/adminApi";

// 🔹 Styles
import style from "./system_Configurations.module.css";

const SystemConfigurations = () => {
  // ------------------------------------------------
  // 🔹 Hooks & Contexts
  // ------------------------------------------------
  const navigate = useNavigate();
  const hasFetched = useRef(false);

  const { showNotification } = useNotification();
  const { showLoader } = useGlobalLoader();
  const { callApi } = useApi();

  // ------------------------------------------------
  // 🔹 Local State
  // ------------------------------------------------
  const [apiData, setApiData] = useState([]); // Raw data from API
  const [data, setData] = useState([]); // Rendered data (modifiable)
  const [formValues, setFormValues] = useState({}); // Input field values
  const [typeOfModal, setTypeOfModal] = useState(false); // Modal type toggle
  const [openModal, setOpenModal] = useState(false); // Modal visibility toggle

  // ------------------------------------------------
  // 🔹 Handlers
  // ------------------------------------------------

  /**
   * Handles input changes for both text and numeric fields.
   * @param {number} id - Configuration ID.
   * @param {string|number} value - Updated configuration value.
   */
  const handleChange = (id, value) => {
    setFormValues((prev) => {
      const updated = [...prev];
      const index = updated.findIndex((item) => item.configurationID === id);

      if (index !== -1) {
        updated[index] = { ...updated[index], configValue: value };
      } else {
        updated.push({ configurationID: id, configValue: value });
      }

      return updated;
    });
  };

  /**
   * Handles cancel action by opening confirmation modal.
   */
  const handleCancel = () => {
    if (typeOfModal) {
      setTypeOfModal(false);
    }
    setOpenModal(true);
  };

  /**
   * Executes action when "Yes" is clicked inside the confirmation modal.
   * Resets form values to the last fetched API state.
   */
  const onClickYesSubmit = () => {
    if (!typeOfModal) {
      // Reset form fields to their initial API values
      const resetValues = apiData.map((item) => ({
        configurationID: item.configurationID,
        configValue: item.configValue || "",
      }));
      setFormValues(resetValues);

      setData(apiData);
    } else {
      // If modal type is something else, you can handle differently if needed
      UpdateSystemConfiguration;
      setData(apiData);
    }

    // Close modal and reset modal type
    setTypeOfModal(false);
    setOpenModal(false);
  };
  const onClickCloseSubmit = () => {
    if (typeOfModal) {
      // 🔹 Convert formValues into updated data format
      const updatedData = data.map((item) => {
        const matchedValue = formValues.find(
          (val) => val.configurationID === item.configurationID
        );

        return matchedValue
          ? { ...item, configValue: matchedValue.configValue }
          : item;
      });

      // 🔹 Save updated values to both states
      setData(updatedData);
      setApiData(updatedData);
      setOpenModal(false);
    } else {
      setOpenModal(false);
    }
  };
  /**
   * Handles saving of updated configuration values.
   * Logs updated data and shows success notification.
   */
  const handleSave = async () => {
    // Check if any field is empty (null, undefined, or empty string)
    const hasEmptyFields = formValues.some(
      (item) =>
        item.configValue === "" ||
        item.configValue === null ||
        item.configValue === undefined
    );

    if (hasEmptyFields) {
      showNotification({
        type: "warning",
        title: "Please fill in all configuration values before saving.",
      });

      return;
    } else {
      // 🔹 Transform keys to match API structure
      const requestdata = formValues.map((item) => ({
        ConfigurationID: item.configurationID,
        ConfigValue: item.configValue,
      }));
      const res = await UpdateSystemConfiguration({
        callApi,
        showNotification,
        showLoader,
        requestdata,
        navigate,
      });
      if (res) {
        setTypeOfModal(true);
        setOpenModal(true);
      }
      console.log("Updated Configurations:", formValues);
    }
  };

  // ------------------------------------------------
  // 🔹 API Fetching
  // ------------------------------------------------

  /**
   * Fetches all system configurations from the backend API,
   * parses min/max values if applicable, and initializes form states.
   */
  const fetchApiCall = useCallback(async () => {
    showLoader(true);

    try {
      const res = await GetAllSystemConfigurations({
        callApi,
        showNotification,
        showLoader,
        navigate,
      });

      const systemConfigurations = Array.isArray(res?.systemConfigurations)
        ? res.systemConfigurations.map((item) => {
            let minValue = null;
            let maxValue = null;

            // Parse "minMax" if valid (e.g., "1,100")
            if (item.minMax && typeof item.minMax === "string") {
              const [min, max] = item.minMax
                .split(",")
                .map((v) => Number(v.trim()));
              if (!isNaN(min)) minValue = min;
              if (!isNaN(max)) maxValue = max;
            }

            return { ...item, minValue, maxValue };
          })
        : [];
      console.log("Updated Configurations:", systemConfigurations);

      setApiData(systemConfigurations);
      setData(systemConfigurations);

      // Initialize form values from API data
      const initialValues = systemConfigurations.map((item) => ({
        configurationID: item.configurationID,
        configValue: item.configValue || "",
      }));
      setFormValues(initialValues);
    } catch (error) {
      showNotification("Failed to fetch system configurations", "error");
    } finally {
      showLoader(false);
    }
  }, [callApi, navigate, showLoader, showNotification]);

  // ------------------------------------------------
  // 🔹 Effects
  // ------------------------------------------------
  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchApiCall();
    }
  }, [fetchApiCall]);

  // ------------------------------------------------
  // 🔹 Render
  // ------------------------------------------------
  return (
    <>
      <PageLayout background="white">
        <div className="px-4 md:px-6 lg:px-8">
          {/* 🔹 Page Header */}
          <Row justify="space-between" align="middle" className="mb-4">
            <Col>
              <h2 className={style.heading}>System Configurations</h2>
            </Col>
          </Row>

          {/* 🔹 Configuration List */}
          <Row>
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                paddingRight: 10,
                paddingLeft: 10,
                maxHeight: 514,
              }}
            >
              {data.map((item) => (
                <Row
                  key={item.configurationID}
                  gutter={16}
                  align="middle"
                  className={style.row}
                >
                  {/* Configuration Label */}
                  <Col span={16}>
                    <strong>{item.configlabel}</strong>
                  </Col>

                  {/* Configuration Input */}
                  <Col span={8} className={style.column}>
                    {item.valueUnit === "text" ? (
                      <Input
                        value={
                          formValues.find(
                            (f) => f.configurationID === item.configurationID
                          )?.configValue || ""
                        }
                        onChange={(e) =>
                          handleChange(item.configurationID, e.target.value)
                        }
                        placeholder="Enter value"
                        className={style.textField}
                      />
                    ) : (
                      <>
                        <span
                          style={{
                            fontSize: "14px",
                            fontWeight: 500,
                            color: "#333",
                            minWidth: "70px",
                            display: "inline-block",
                            textTransform: "capitalize",
                            marginTop: "20px",
                          }}
                        >
                          {item.valueUnit}
                        </span>
                        <Input
                          type="number"
                          min={item.minValue ?? 1}
                          max={item.maxValue ?? 100}
                          value={
                            formValues.find(
                              (f) => f.configurationID === item.configurationID
                            )?.configValue || ""
                          }
                          onChange={(e) => {
                            const value = e.target.value;
                            if (
                              value === "" ||
                              (Number(value) >= (item.minValue ?? 1) &&
                                Number(value) <= (item.maxValue ?? 100))
                            ) {
                              handleChange(item.configurationID, value);
                            }
                          }}
                          placeholder="Enter number"
                          className={style.inputDuration}
                          style={{
                            width: "150px",
                            textAlign: "center",
                            color: "#1f1f1f",
                            borderRadius: "6px",
                          }}
                        />
                      </>
                    )}
                  </Col>
                </Row>
              ))}
            </div>
          </Row>

          {/* 🔹 Action Buttons */}
          <Row justify="end" gutter={12} style={{ marginTop: "24px" }}>
            <Col>
              <Button
                type="text"
                className="small-light-button"
                text="Cancel"
                id="cancel-changes-system-configurations"
                onClick={handleCancel}
              />
            </Col>
            <Col>
              <Button
                type="text"
                className="small-dark-button"
                text="Save Changes"
                id="save-changes-system-configurations"
                onClick={handleSave}
              />
            </Col>
          </Row>
        </div>
      </PageLayout>

      {/* 🔹 Discard Confirmation Modal */}
      {openModal && (
        <Intimationmodal
          flag={typeOfModal}
          openModal={openModal}
          setOpenModal={setOpenModal}
          onClickYesSubmit={onClickYesSubmit}
          onClickCloseSubmit={onClickCloseSubmit}
        />
      )}
    </>
  );
};

export default SystemConfigurations;
