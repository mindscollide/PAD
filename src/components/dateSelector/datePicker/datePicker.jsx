import React from "react";
import { DatePicker } from "antd";
import classNames from "classnames";
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
  format,
  ...props
}) => {
  const sizeClass = styles[size] || "";

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
        value={value} 
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        allowClear
        format={format}
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
