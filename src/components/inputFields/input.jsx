import React from "react";
import { Input } from "antd";
import classNames from "classnames"; // Helps combine classes conditionally
import styles from "./textField.module.css";

const TextField = ({
  label, // Label text for input
  value, // Controlled input value
  onChange, // onChange event handler
  type = "text", // Input type (text/password/etc)
  placeholder, // Placeholder text
  error, // Error message string
  className = "", // Additional custom class for container
  name, // Input name attribute
  onBlur, // onBlur handler
  size = "medium", // Size: small | medium | large | extraLarge
  disabled = false, // Disable input field
  maxLength,
  required = false, // Show required asterisk
  height = 40,
  ...props // Any other passed props
}) => {
  // Use size-specific class from CSS module
  const sizeClass = styles[size] || "";

  return (
    <div
      className={classNames(
        styles["form-group"], // Base form group styling
        sizeClass, // Apply size class to wrapper
        className // Any custom class from parent
      )}
    >
      {label && (
        <label
          className={classNames(
            styles["label"], // Base label
            styles[`label-${size}`] // Label variant for the size
          )}
        >
          {label}
          {required && <span className={styles["required"]}>*</span>}
        </label>
      )}

      <Input
        style={{ height: height }}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        className={classNames(
          styles["input"], // Base input
          styles[`input-${size}`], // Input variant for size
          {
            [styles["input-error"]]: error, // Apply error border if needed
          }
        )}
        {...props}
      />

      {/* {error && (
        <div
          className={classNames(
            styles["error-text"], // Base error style
            styles[`error-text-${size}`] // Error text size variant
          )}
        >
          {error}
        </div>
      )} */}
    </div>
  );
};

export default TextField;
