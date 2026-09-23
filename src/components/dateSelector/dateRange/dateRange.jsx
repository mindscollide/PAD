import React, { useMemo } from "react";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import classNames from "classnames";
import styles from "./dateRange.module.css";

const { RangePicker } = DatePicker;

const DateRangePicker = ({
  label,
  value,
  onChange,
  onClear,
  placeholder = "Select date",
  className = "",
  name,
  size = "medium",
  disabled = false,
  error = "",
  required = false,
  onBlur,
  ...props
}) => {
  const sizeClass = styles[size] || "";

  // Convert ["YYYY-MM-DD", "YYYY-MM-DD"] to [dayjs, dayjs]
  const parseToDayjsRange = (val) => {
    if (!Array.isArray(val) || val.length !== 2) return null;
    const [start, end] = val;
    return [
      start ? dayjs(start, "YYYY-MM-DD") : null,
      end ? dayjs(end, "YYYY-MM-DD") : null,
    ];
  };

  // FIXED (API_Changes/2026-09-23_admin_tat_request_approvals_fe_date_picker_
  // issues.md #1): parseToDayjsRange used to run fresh on every render,
  // handing RangePicker a brand-new dayjs array reference each time even
  // when start/end hadn't changed. AntD treats a changed `value` reference
  // as an external update and resets its open calendar panel to it, so any
  // unrelated re-render while the popup was open undid next/previous-month
  // navigation. Memoizing on the underlying date strings keeps the array
  // reference stable across renders that don't actually change the dates.
  const valueStart = Array.isArray(value) ? value[0] : value;
  const valueEnd = Array.isArray(value) ? value[1] : value;
  const parsedValue = useMemo(
    () => parseToDayjsRange(value),
    [valueStart, valueEnd] // eslint-disable-line react-hooks/exhaustive-deps
  );

  // Convert [dayjs, dayjs] to ["YYYY-MM-DD", "YYYY-MM-DD"]
  const handleChange = (dates) => {
    if (!dates) {
      onClear?.();
    } else {
      const formatted = dates.map((d) => (d ? d.format("YYYY-MM-DD") : null));
      onChange?.(formatted);
    }
  };

  return (
    <div className={classNames(styles["form-group"], sizeClass, className)}>
      {label && (
        <label className={classNames(styles["label"], styles[`label-${size}`])}>
          {label}
          {required && <span className={styles["required"]}>*</span>}
        </label>
      )}

      <RangePicker
        name={name}
        value={parsedValue}
        onChange={handleChange}
        onBlur={onBlur}
        placeholder={
          Array.isArray(placeholder) ? placeholder : [placeholder, placeholder]
        }
        disabled={disabled}
        format="MMM-DD-YY" // Display format only
        className={classNames(
          styles["range-picker"],
          styles[`range-picker-${size}`]
        )}
        {...props}
      />

      {error && (
        <div
          className={classNames(
            styles["error-text"],
            styles[`error-text-${size}`]
          )}
        >
          {error}
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;
