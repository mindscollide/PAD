// src/components/TextField/TextField.jsx
import React from "react";
import { Input } from "antd";
import classNames from "classnames"; // Utility to conditionally join CSS classes
import styles from "./textField.module.css";

/**
 * 🔹 Reusable TextField Component
 *
 * A customizable input field built on top of Ant Design's Input.
 * Supports labels, error states, size variants, and more.
 *
 * @component
 * @param {Object} props - React props
 * @param {string} [props.label] - Label text shown above the input
 * @param {string|number} [props.value] - Controlled input value
 * @param {function} props.onChange - Callback when input value changes
 * @param {string} [props.type="text"] - Input type (e.g., "text", "password", "email")
 * @param {string} [props.placeholder] - Placeholder text for the input
 * @param {string} [props.error] - Error message (currently unused, but ready if needed)
 * @param {string} [props.className] - Additional custom CSS class for wrapper
 * @param {string} [props.name] - Input name attribute
 * @param {function} [props.onBlur] - Callback when input loses focus
 * @param {"small"|"medium"|"large"|"extraLarge"} [props.size="medium"] - Input size variant
 * @param {boolean} [props.disabled=false] - Disable the input field
 * @param {number} [props.maxLength] - Maximum input length
 * @param {boolean} [props.required=false] - Adds a red asterisk (*) on label if true
 * @param {number} [props.height=40] - Custom input height in px
 * @param {function} [props.onPressEnter] - Handler when Enter key is pressed
 * @param {boolean} [props.autoFocus] - Automatically focus input on mount
 * @param {Object} [props.props] - Additional props spread to AntD Input
 *
 * @example
 * <TextField
 *   label="Username"
 *   name="username"
 *   value={formValues.username}
 *   onChange={(e) => setFormValues({ ...formValues, username: e.target.value })}
 *   placeholder="Enter your username"
 *   required
 *   autoFocus
 * />
 */
const TextField = ({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  error,
  className = "",
  name,
  onBlur,
  size = "medium",
  disabled = false,
  maxLength,
  required = false,
  height = 40,
  onPressEnter,
  autoFocus,
  autoComplete,
  ...props
}) => {
  // ✅ Pick size-specific class from CSS module
  const sizeClass = styles[size] || "";

  return (
    <div
      className={classNames(
        styles["form-group"], // Base wrapper class
        sizeClass, // Size variant (small, medium, large, extraLarge)
        className // Any custom classes from parent
      )}
    >
      {/* 🔹 Label (optional) */}
      {label && (
        <label
          className={classNames(
            styles["label"], // Base label
            styles[`label-${size}`] // Label variant for input size
          )}
          htmlFor={name}
        >
          {label}
          {required && <span className={styles["required"]}>*</span>}
        </label>
      )}

      {/* 🔹 Input field (AntD) */}
      <Input
        style={{ height }} // Inline style height
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        onPressEnter={onPressEnter}
        autoFocus={autoFocus}
        autoComplete={autoComplete}
        className={classNames(
          styles["input"], // Base input
          styles[`input-${size}`], // Size variant
          {
            [styles["input-error"]]: error, // Add error border if error exists
          }
        )}
        {...props}
      />

      {/* 🔹 Error message (uncomment if you want inline errors) */}
      {/* {error && (
        <div
          className={classNames(
            styles["error-text"],
            styles[`error-text-${size}`]
          )}
        >
          {error}
        </div>
      )} */}
    </div>
  );
};

export default TextField;
