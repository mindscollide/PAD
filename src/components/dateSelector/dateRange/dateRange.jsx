import React from "react";
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
    return [start ? dayjs(start, "YYYY-MM-DD") : null, end ? dayjs(end, "YYYY-MM-DD") : null];
  };

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
        value={parseToDayjsRange(value)}
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
