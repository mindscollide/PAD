import React from "react";
import { DatePicker, TimePicker } from "antd";
import classNames from "classnames";
import styles from "./datePicker.module.css";
import dayjs from "dayjs";

const CustomDatePicker = ({
  label,
  value, // string or null
  onChange,
  onClear,
  placeholder = "Select",
  className = "",
  name,
  size = "medium", // small | medium | large
  disabled = false,
  error = "",
  required = false,
  onBlur,
  format, // optional custom display format
  minDate, // min date (string or dayjs)
  modeType = "date", // 🔹 "date" | "time" | "datetime"
  ...props
}) => {
  const sizeClass = styles[size] || "";

  // ✅ normalize value to dayjs object depending on modeType
  const parseToDayjs = (val) => {
    if (!val) return null;
    if (modeType === "time") return dayjs(val, "HH:mm");
    if (modeType === "datetime") return dayjs(val, "YYYY-MM-DD HH:mm");
    return dayjs(val, "YYYY-MM-DD");
  };

  // ✅ format dayjs -> string for callback
  const handleChange = (date) => {
    if (!date) {
      onClear?.();
    } else {
      const formatString =
        modeType === "time"
          ? "HH:mm"
          : modeType === "datetime"
          ? "YYYY-MM-DD HH:mm"
          : "YYYY-MM-DD";
      onChange?.(date.format(formatString));
    }
  };

  // ✅ Disable all dates before minDate (only applies to date/datetime)
  const disabledDate = (current) => {
    if (!minDate || modeType === "time") return false;
    const min = dayjs(minDate, "YYYY-MM-DD");
    return current && current.isBefore(min, "day");
  };

  // ✅ Pick correct format
  const displayFormat =
    format ||
    (modeType === "time"
      ? "HH:mm"
      : modeType === "datetime"
      ? "YYYY-MM-DD HH:mm"
      : "MMM-DD-YY");

  return (
    <div className={classNames(styles["form-group"], sizeClass, className)}>
      {label && (
        <label className={classNames(styles["label"], styles[`label-${size}`])}>
          {label}
          {required && <span className={styles["required"]}>*</span>}
        </label>
      )}

      {modeType === "time" ? (
        // ⏰ Time Only Picker
        <TimePicker
          name={name}
          value={parseToDayjs(value)}
          onChange={handleChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          allowClear
          format={displayFormat}
          className={classNames(styles["input"], styles[`input-${size}`], {
            [styles["input-error"]]: error,
          })}
          {...props}
        />
      ) : (
        // 📅 Date or DateTime Picker
        <DatePicker
          name={name}
          value={parseToDayjs(value)}
          onChange={handleChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          allowClear
          format={displayFormat}
          showTime={modeType === "datetime"} // enable time for datetime
          disabledDate={disabledDate}
          className={classNames(styles["input"], styles[`input-${size}`], {
            [styles["input-error"]]: error,
          })}
          {...props}
        />
      )}

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

export default CustomDatePicker;
