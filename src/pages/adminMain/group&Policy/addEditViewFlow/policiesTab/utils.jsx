import { Checkbox, Input, Select, Spin, Tooltip } from "antd";
import { UpOutlined, DownOutlined } from "@ant-design/icons";
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

function convertCode(code) {
  const [prefix, number] = code.split("_"); // "PL", "00000001"

  // Take first 2 digits for the middle part
  const mid = number.slice(0, 2); // "00"

  // Remaining digits for the last part
  const last = number.slice(2); // "000001"

  return `${prefix}_${mid}_${last}`;
}

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

const parseApplicableValues = (str) => {
  if (!str) return [];
  return str
    .split(", ")
    .map((v) => Number(v.replace(/,/g, "").trim()))
    .filter((v) => !isNaN(v))
    .sort((a, b) => a - b);
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
              (p) => String(p.policyID) === String(record.policyID),
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
      dataIndex: "policyCode",
      key: "policyCode",
      width: 120,
      render: (policyCode) => (
        <Tooltip title={policyCode}>
          <span style={{ fontFamily: "monospace" }}>
            {convertCode(policyCode) || "PL_XX_0000"}
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
          const valueUnit = record.valueUnit?.trim?.() || "";

          // ✅ Editable Mode
          if (!viewFlag) {
            switch (dataTypeID) {
              case 1: {
                // 1. Get min and max directly from minMax string
                const [min, max] = parseMinMax(minMax); // returns [100000, 1500000]

                // 2. Parse dynamic step array
                const allowedValues = parseApplicableValues(
                  record?.applicableValues,
                );
                console.log("allowedValues", record?.policyCode);
                console.log("allowedValues", allowedValues);
                const hasValues = allowedValues.length > 0;

                // Handles stepping UP and DOWN through applicableValues
                const handleStep = (direction) => {
                  if (!hasValues) return;

                  const currentVal = Number(record?.duration);

                  // If input is empty/invalid, start at min
                  if (isNaN(currentVal)) {
                    onDurationChange?.(record, min ?? allowedValues[0]);
                    return;
                  }

                  if (direction === "up") {
                    // Find the next strictly greater value in the dynamic array
                    const nextVal = allowedValues.find((v) => v > currentVal);
                    if (
                      nextVal !== undefined &&
                      (max === null || nextVal <= max)
                    ) {
                      onDurationChange?.(record, nextVal);
                    }
                  } else if (direction === "down") {
                    // Find the previous strictly smaller value in the dynamic array
                    const prevVal = [...allowedValues]
                      .reverse()
                      .find((v) => v < currentVal);
                    if (
                      prevVal !== undefined &&
                      (min === null || prevVal >= min)
                    ) {
                      onDurationChange?.(record, prevVal);
                    }
                  }
                };

                // Intercept keyboard Up/Down arrows
                const handleKeyDown = (e) => {
                  if (e.key === "ArrowUp") {
                    e.preventDefault();
                    handleStep("up");
                  } else if (e.key === "ArrowDown") {
                    e.preventDefault();
                    handleStep("down");
                  }
                };

                // Handle direct typed input
                const handleChange = (e) => {
                  const raw = e.target.value;
                  if (raw === "") {
                    onDurationChange?.(record, "");
                    return;
                  }

                  const val = Number(raw);
                  if (isNaN(val)) return;

                  // Check against explicit min/max bounds
                  if (
                    (min !== null && val < min) ||
                    (max !== null && val > max)
                  )
                    return;

                  // Direct typing: Snap to closest applicable value if provided
                  if (hasValues) {
                    const closest = allowedValues.reduce((prev, curr) =>
                      Math.abs(curr - val) < Math.abs(prev - val) ? curr : prev,
                    );
                    onDurationChange?.(record, closest);
                  } else {
                    onDurationChange?.(record, val);
                  }
                };

                return (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <div style={{ position: "relative", display: "inline-block" }}>
                      {/* FIXED: was type="number", relying on the native
                      browser spinner - clicking those arrows fires the
                      browser's own +/-1 increment through onChange, which
                      handleChange's "snap to closest applicable value"
                      then pulls straight back to the SAME value whenever
                      the gap between steps is bigger than 1 (e.g. the
                      100,000-wide Shares steps) - 100,001 is still
                      closest to 100,000, not 200,000. Keyboard
                      ArrowUp/Down worked because handleKeyDown calls
                      handleStep directly, bypassing that. Switched off
                      type="number" (no native spinner left to misfire)
                      and added explicit up/down buttons wired to the
                      same handleStep the keyboard path already uses
                      correctly, so click and keyboard now behave
                      identically. */}
                      <Input
                        type="text"
                        inputMode="numeric"
                        value={record?.duration ?? ""}
                        placeholder="Enter number"
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        className={styles.inputDuration}
                        style={{
                          width: "150px",
                          textAlign: "center",
                          paddingRight: 22,
                        }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          right: 6,
                          top: 0,
                          bottom: 0,
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                          gap: 2,
                        }}
                      >
                        <UpOutlined
                          onClick={() => handleStep("up")}
                          style={{
                            fontSize: 10,
                            cursor: "pointer",
                            color: "#666",
                            lineHeight: 1,
                          }}
                        />
                        <DownOutlined
                          onClick={() => handleStep("down")}
                          style={{
                            fontSize: 10,
                            cursor: "pointer",
                            color: "#666",
                            lineHeight: 1,
                          }}
                        />
                      </div>
                    </div>
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
                    value={
                      record.duration === "Invalid Date"
                        ? null
                        : record.duration !== "Invalid Date"
                          ? record.duration
                          : null
                    }
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
              return (
                <span>
                  {duration ? Number(duration) : "-"} {valueUnit}
                </span>
              );

            case 2:
            case 3:
            case 4:
              return (
                <span>
                  {duration || "—"} {valueUnit}
                </span>
              );

            case 5:
              return (
                <span>
                  {duration || "—"} {valueUnit}
                </span>
              );

            case 6:
            case 7: {
              const parts = getDurationParts(duration);
              return (
                <div className={styles.userList}>
                  {parts.length > 0 ? (
                    <div className={styles.userChip}>
                      {parts[0]}
                      {parts.length > 1 && (
                        <span className={styles.moreCount}>
                          +{parts.length - 1} {valueUnit}
                        </span>
                      )}
                    </div>
                  ) : (
                    "—"
                  )}
                </div>
              );
            }

            default:
              return (
                <span>
                  {duration || "—"} {valueUnit}
                </span>
              );
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
