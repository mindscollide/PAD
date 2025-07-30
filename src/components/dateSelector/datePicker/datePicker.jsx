import React from "react";
import { DatePicker } from "antd";
import classNames from "classnames";
import moment from "moment";
import styles from "./datePicker.module.css";

const CustomDatePicker = ({
  label,
  value,
  onChange,
  onClear,
  placeholder = "Select date",
  className = "",
  name,
  size = "medium", // small | medium | large
  disabled = false,
  error = "",
  required = false,
  onBlur,
  ...props
}) => {
  const sizeClass = styles[size] || "";

  // Convert "YYYY-MM-DD" to moment object
  const parseToMoment = (val) => (val ? moment(val, "YYYY-MM-DD") : null);

  // Convert moment object to "YYYY-MM-DD"
  const formatToYYYYMMDD = (date) => date?.format("YYYY-MM-DD");

  const handleChange = (date) => {
    if (!date) {
      onClear?.();
    } else {
      onChange?.(formatToYYYYMMDD(date));
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

      <DatePicker
        name={name}
        value={parseToMoment(value)}
        onChange={handleChange}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        allowClear
        format="MMM-DD-YY" // Display format
        className={classNames(styles["input"], styles[`input-${size}`], {
          [styles["input-error"]]: error,
        })}
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

export default CustomDatePicker;
