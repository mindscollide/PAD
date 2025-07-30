import React from "react";
import { Select } from "antd";
import styles from "./CommenSearchInput.module.css";

const CommenSearchInput = ({
  label,
  name,
  value,
  options,
  onChange,
  placeholder,
  className = "",
}) => {
  const handleChange = (selectedValue) => {
    onChange({
      target: {
        name,
        value: selectedValue,
      },
    });
  };

  return (
    <div className={`${styles.wrapper} ${className}`}>
      {label && <label className={styles.label}>{label}</label>}
      <Select
        showSearch
        placeholder={placeholder || "Select"}
        value={value}
        onChange={handleChange}
        filterOption={(input, option) =>
          (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
        }
        options={options}
        className={styles.customSelect} // 👈 Apply custom styles
      />
    </div>
  );
};

export default CommenSearchInput;
