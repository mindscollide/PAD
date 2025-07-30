import React from "react";
import { Button } from "antd";
import style from "./button.module.css";

const CustomButton = ({
  id,
  text,
  icon,
  onClick,
  className = "",
  disabled = false,
  type = "default",
  size = "middle",
  loading = false,
  htmlType = "button",
  position,
}) => {
  // please make shoure when ever disable function use on dark please apply light icon img their
  // icon={<img src={disabled?pdflightIcon:pdfDarkIcon} alt="PDF Icon" />}
  // we have make basic that white icon is light icon becasue its apply on dark and dark icon is black or other icon excpt white becaus its apply on white button or light button
  // and on dis able alway apply light icon
  return (
    <Button
      id={id}
      type={type}
      size={size}
      className={`custom-btn ${style[className] || ""}`}
      disabled={disabled}
      onClick={onClick}
      loading={loading}
      htmlType={htmlType}
      icon={position ? "" : icon}
    >
      {text}
      {/* Add this span if you want to ensure icon appears after text */}
      {position && icon && <span className="ant-btn-icon">{icon}</span>}
    </Button>
  );
};

export default CustomButton;
