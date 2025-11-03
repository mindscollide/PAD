import { Checkbox, Input, Select, Spin, Tooltip } from "antd";
import React from "react";
import { DateRangePicker, InstrumentSelect } from "../../../../../components";
const { Option } = Select;
import styles from "./policies.module.css";
import CustomDatePicker from "../../../../../components/dateSelector/datePicker/datePicker";
import {
  convertUTCToLocalTime,
  formatApiDateTime,
  toYYMMDD,
} from "../../../../../common/funtions/rejex";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

// Enable plugins
dayjs.extend(utc);
dayjs.extend(timezone);
// Helper to normalize duration into array of strings
const getDurationParts = (duration) => {
  try {
    if (!duration && duration !== 0) return [];
    if (Array.isArray(duration)) {
      return duration.map((s) => String(s).trim()).filter(Boolean);
    }
    if (typeof duration === "object") {
      const val =
        duration.value ||
        duration.name ||
        duration.title ||
        JSON.stringify(duration);
      return String(val)
        .split(/[,+|;]+/)
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return String(duration)
      .split(/[,+|;]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  } catch (error) {
    console.error("Error parsing duration:", error);
    return [];
  }
};

// ✅ Safe formatter for numeric min-max strings
const parseMinMax = (minMaxStr) => {
  try {
    const matches = minMaxStr?.match(/\d[\d,]*/g);
    if (!matches || matches.length < 2) return [null, null];
    return [
      Number(matches[0].replace(/,/g, "")),
      Number(matches[1].replace(/,/g, "")),
    ];
  } catch (error) {
    console.error("Error parsing minMax:", error);
    return [null, null];
  }
};

export const policyColumns = ({
  onSelectChange,
  onDurationChange,
  viewFlag,
  selectedPolicies = [],
  loadingPolicyId,
}) => {
  const columns = [
    // 🟢 Checkbox (only in edit mode)
    !viewFlag && {
      title: "Select",
      dataIndex: "policyID",
      key: "policyID",
      align: "center",
      width: 80,
      render: (_, record = {}) => {
        const isChecked = Array.isArray(selectedPolicies)
          ? selectedPolicies.some(
              (p) => String(p.policyID) === String(record.policyID)
            )
          : false;

        return (
          <Checkbox
            checked={isChecked}
            onChange={(e) =>
              onSelectChange?.(record, e?.target?.checked ?? false)
            }
            className="custom-broker-option-group-policies"
          />
        );
      },
    },

    !viewFlag && {
      title: "",
      dataIndex: "spacer",
      width: 10,
      render: () => null,
    },

    // 🧩 Policy ID
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

    // 🧩 Scenario
    {
      title: "Scenario",
      dataIndex: "scenario",
      key: "scenario",
      render: (text) => (
        <Tooltip title={text}>
          <span>
            {text ? (text.length > 70 ? text.slice(0, 67) + "..." : text) : "—"}
          </span>
        </Tooltip>
      ),
    },

    // 🧩 Duration (editable or view-only)
    {
      title: "Duration",
      dataIndex: "duration",
      key: "duration",
      width: 220,
      render: (_, record = {}) => {
        const { dataTypeID, minMax, duration, applicableValues } = record;

        if (!dataTypeID) return <span>—</span>;

        try {
          if (record.policyID === loadingPolicyId) return <Spin size="small" />;

          // ✅ Editable Mode
          if (!viewFlag) {
            switch (dataTypeID) {
              case 1: {
                const [min, max] = parseMinMax(minMax);
                const valueUnit = record.valueUnit?.trim?.() || "";

                const handleChange = (e) => {
                  const val = Number(e.target.value);
                  if (isNaN(val)) return;
                  if ((min && val < min) || (max && val > max)) return;
                  onDurationChange?.(record, val);
                };

                return (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <Input
                      type="number"
                      min={min || 1}
                      max={max || 100}
                      value={Number(record.duration) || ""}
                      placeholder="Enter number"
                      onChange={handleChange}
                      className={styles.inputDuration}
                      style={{ width: "150px", textAlign: "center" }}
                    />
                    {valueUnit && (
                      <span style={{ color: "#666", fontSize: 13 }}>
                        {"(" + valueUnit + ")"}
                      </span>
                    )}
                  </div>
                );
              }

              case 2:
              case 3:
              case 4: {
                // Reuse CustomDatePicker safely
                const handleChange = (val) => onDurationChange?.(record, val);
                return (
                  <CustomDatePicker
                    value={record.duration || ""}
                    onChange={handleChange}
                    modeType={
                      dataTypeID === 2
                        ? "date"
                        : dataTypeID === 3
                        ? "time"
                        : "datetime"
                    }
                    minDate={minMax || null}
                  />
                );
              }

              case 5:
                return (
                  <Input
                    value={duration || ""}
                    placeholder="Enter text"
                    onChange={(e) => onDurationChange?.(record, e.target.value)}
                    className={styles.inputDuration}
                  />
                );

              case 6:
              case 7: {
                const values =
                  applicableValues
                    ?.split("|")
                    .map((v) => v.trim())
                    .filter(Boolean) || [];
                const multiple = dataTypeID === 7;
                return (
                  <Select
                    mode={multiple ? "multiple" : undefined}
                    placeholder="Select option(s)"
                    value={record.duration || (multiple ? [] : undefined)}
                    onChange={(val) => onDurationChange?.(record, val)}
                    className={multiple ? styles.multiselect : styles.select}
                    {...(multiple && {
                      maxTagCount: "responsive", // ✅ Automatically collapse tags into “+N…”
                      maxTagPlaceholder: (omittedValues) =>
                        `+${omittedValues.length} more`, // optional customization
                    })}
                  >
                    {values.map((val) => (
                      <Option key={val} value={val}>
                        {val}
                      </Option>
                    ))}
                  </Select>
                );
              }

              default:
                return <span>—</span>;
            }
          }

          // ✅ View Mode
          switch (dataTypeID) {
            case 1:
              return <span>{Number(duration) || "-"} Number</span>;

            case 2:
            case 3:
            case 4:
              return <span>{duration || "—"}</span>;

            case 5:
              return <span>{duration || "—"}</span>;

            case 6:
            case 7: {
              const parts = getDurationParts(duration);
              return (
                <div className={styles.userList}>
                  <div className={styles.userChip}>
                    {parts[0] || "—"}
                    {parts.length > 1 && (
                      <span className={styles.moreCount}>
                        +{parts.length - 1}
                      </span>
                    )}
                  </div>
                </div>
              );
            }

            default:
              return <span>{duration || "—"}</span>;
          }
        } catch (error) {
          console.error("Error rendering duration cell:", error, record);
          return <span style={{ color: "red" }}>Invalid Data</span>;
        }
      },
    },

    // 🧩 Consequence
    {
      title: "Consequence",
      dataIndex: "consequence",
      key: "consequence",
      render: (text) => (
        <Tooltip title={text}>
          <span>
            {text ? (text.length > 70 ? text.slice(0, 67) + "..." : text) : "—"}
          </span>
        </Tooltip>
      ),
    },
  ];

  return columns.filter(Boolean);
};

export const buildApiRequest = (searchState = {}) => ({
  PolicyID: searchState.policyId || null,
  Scenario: searchState.scenario || "",
  Consequence: searchState.consequence || "",
});
