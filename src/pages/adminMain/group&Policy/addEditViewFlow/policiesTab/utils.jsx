import { Checkbox, Input, Select, Spin, Tooltip } from "antd";
import React from "react";
import { DateRangePicker, InstrumentSelect } from "../../../../../components";
const { Option } = Select;
import styles from "./policies.module.css";
import CustomDatePicker from "../../../../../components/dateSelector/datePicker/datePicker";
import { formatApiDateTime } from "../../../../../common/funtions/rejex";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

// Enable plugins
dayjs.extend(utc);
dayjs.extend(timezone);

export const policyColumns = ({
  onSelectChange,
  onDurationChange,
  selectedPolicies = [], // 👈 pass selected array
  loadingPolicyId,
}) => [
  {
    title: "Select",
    dataIndex: "policyID",
    key: "policyID",
    align: "center",
    width: 80,
    render: (_, record) => {
      const isChecked = Array.isArray(selectedPolicies)
        ? selectedPolicies.some(
            (p) => String(p.policyID) === String(record.policyID)
          )
        : false;

      return (
        <Checkbox
          checked={isChecked}
          onChange={(e) => onSelectChange(record, e.target.checked)}
          className="custom-broker-option-group-policies"
        />
      );
    },
  },
  {
    title: "",
    dataIndex: "spacer",
    render: () => null,
    width: 10,
  },
  {
    title: "Policy ID",
    dataIndex: "policyId",
    key: "policyId",
    width: 100,
    render: (policyId) => (
      <Tooltip title={policyId}>
        <span style={{ fontFamily: "monospace" }}>
          {policyId || "PL_XX_0000"}
        </span>
      </Tooltip>
    ),
  },
  {
    title: "Scenario",
    dataIndex: "scenario",
    key: "scenario",
    render: (text) => (
      <Tooltip title={text}>
        <span>
          {text?.length > 70 ? text.slice(0, 67) + "..." : text || "-"}
        </span>
      </Tooltip>
    ),
  },
  {
    title: "Duration",
    dataIndex: "duration",
    key: "duration",
    width: 200,
    render: (_, record) => {
      const {
        dataTypeID,
        minMax,
        duration,
        applicableValues,
      } = record;

      // Handle loading
      if (record.policyID === loadingPolicyId) return <Spin size="small" />;

      // Case-by-case rendering based on dataTypeID
      switch (dataTypeID) {
        case 1:{
          const matches = record.minMax.match(/\d[\d,]*/g);

          if (!matches || matches.length < 2) return [null, null];

          // Remove commas and convert to numbers
          const min = Number(matches[0].replace(/,/g, ""));
          const max = Number(matches[1].replace(/,/g, ""));

          const valueUnit = record.valueUnit ? record.valueUnit.trim() : "";
          const handleChange = (e) => {
            const val = Number(e.target.value);

            // Enforce min and max boundaries
            if ((min && val < min) || (max && val > max)) return;

            onDurationChange(record, val);
          };

          return (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Input
                type="number"
                min={min || 1}
                max={max || 100}
                step={1}
                value={Number(record.duration)}
                placeholder="Enter number"
                onChange={handleChange}
                className={styles.inputDuration}
                style={{
                  width: "150px",
                  height: "40px",
                  borderRadius: 6,
                  textAlign: "center",
                }}
              />
              {valueUnit && (
                <span
                  style={{ color: "#666", fontSize: 13, whiteSpace: "nowrap" }}
                >
                  {"(" + valueUnit + ")"}
                </span>
              )}
            </div>
          );
        }
        case 2: {
          // Date Selector
          const dateandtime =
            [record?.createdOnDate, record?.createdOnTime]
              .filter(Boolean)
              .join(" ") || "—";
          const minDateandTime = formatApiDateTime(dateandtime);
          const handleDateChange = (val) => {
            onDurationChange(record, val); // pass formatted date (YYYY-MM-DD)
          };

          const handleClearDate = () => {
            onDurationChange(record, null);
          };
          return (
            <CustomDatePicker
              size="small"
              minDate={minDateandTime}
              value={record.duration} // ✅ shows selected date if already set
              onChange={handleDateChange} // ✅ update duration on change
              onClear={handleClearDate} // ✅ clear selection
              format="YYYY-MM-DD"
              modeType="date"
            />
          );
        }

        case 3: {
          // Time Selector
          let minTimeLocal = null;

          if (minMax) {
            // Example: "08:22:18" (UTC) → convert to local time
            const utcTime = dayjs.utc(minMax, "HH:mm:ss");
            minTimeLocal = utcTime.local().format("HH:mm:ss"); // convert to local
          }
          const handleDateChange = (val) => {
            onDurationChange(record, val); // pass formatted date (YYYY-MM-DD)
          };
          return (
            <CustomDatePicker
              value={record.duration || ""}
              onChange={handleDateChange}
              modeType="time"
              minDate={minTimeLocal}
            />
          );
        }

        case 4: {
          // Date + Time
          // Parse and convert UTC -> local time using dayjs
          const minDateLocal = minMax
            ? dayjs.utc(minMax, "YYYY-MM-DD HH:mm:ss").local()
            : null;

          const handleDateChange = (val) => {
            onDurationChange(record, val); // pass formatted date (YYYY-MM-DD)
          };

          return (
            <CustomDatePicker
              value={record.duration || ""}
              onChange={handleDateChange}
              modeType="datetime"
              minDate={
                minDateLocal ? minDateLocal.format("YYYY-MM-DD HH:mm:ss") : null
              }
            />
          );
        }

        case 5: // Text Input
          return (
            <Input
              value={duration}
              placeholder="Enter value"
              onChange={(e) => onDurationChange(record, e.target.value)}
              className={styles.inputDuration}
            />
          );

        case 6: {
          // Single Select
          const handleSelectChange = (val) => {
            onDurationChange(record, val);
          };

          return (
            <Select
              value={record.duration || undefined}
              placeholder="Select"
              className={styles.select}
              onChange={handleSelectChange}
            >
              {(applicableValues?.split("|") || []).map((val) => (
                <Option key={val.trim()} value={val.trim()}>
                  {val.trim()}
                </Option>
              ))}
            </Select>
          );
        }

        case 7: {
          // Parse applicableValues → array
          const applicableValuesArray = applicableValues
            ?.split("|")
            .map((val) => val.trim())
            .filter((val) => val);

          // Convert into {label, value} objects
          const options = applicableValuesArray.map((val) => ({
            label: val,
            value: val,
          }));
          const handleMultiSelectChange = (vals) => {
            onDurationChange(record, vals);
          };
          return (
            <Select
              mode="multiple"
              placeholder="Select option(s)..."
              className={styles.multiselect}
              value={record.duration || []} // ✅ controlled value
              onChange={handleMultiSelectChange}
              options={options}
              maxTagCount="responsive"
              optionRender={(option) => (
                <Tooltip title={option.label} placement="right">
                  <div className={styles.selectOption}>
                    <input
                      type="checkbox"
                      checked={(record.duration || []).includes(option.value)}
                      readOnly
                      className={styles.selectedOption}
                    />
                    <span className={styles.optionLabel}>{option.label}</span>
                  </div>
                </Tooltip>
              )}
              maxTagPlaceholder={(omittedValues) => (
                <Tooltip
                  title={omittedValues.map(({ label }) => label).join(", ")}
                >
                  <span style={{ color: "#555", fontSize: "12px" }}>
                    +{omittedValues.length} more
                  </span>
                </Tooltip>
              )}
            />
          );
        }

        default:
          return <span>{duration || "-"}</span>;
      }
    },
  },
  {
    title: "Consequence",
    dataIndex: "consequence",
    key: "consequence",
    render: (text) => (
      <Tooltip title={text}>
        <span>
          {text?.length > 70 ? text.slice(0, 67) + "..." : text || "-"}
        </span>
      </Tooltip>
    ),
  },
];

export const buildApiRequest = (searchState = {}) => ({
  PolicyID: searchState.policyId || null,
  Scenario: searchState.scenario || "",
  Consequence: searchState.consequence || "",
  PageNumber: Number(searchState.pageNumber) || 0,
  Length: 100,
});
