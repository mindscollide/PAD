import React from "react";
import { Checkbox } from "antd";
import style from "./CheckBox.module.css"; // CSS Module import

const CheckBox = ({ value, label, checked, onChange, className = "" }) => {
  return (
    <Checkbox
      value={value}
      checked={checked}
      onChange={onChange}
      className={`${style.customCheckbox} ${className}`}
    >
      {label}
    </Checkbox>
  );
};

export default CheckBox;
