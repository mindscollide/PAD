import React from "react";
import { Card } from "antd";
import styles from "./textCard.module.css";
import { useSidebarContext } from "../../../context/sidebarContaxt";

const TextCard = ({ title, subtitle, className }) => {
  const base = className || "smallCard";
  const { collapsed } = useSidebarContext();

  return (
    <Card
      className={`${styles[base]} ${
        collapsed ? styles[`${base}Collapsed`] : styles[`${base}Expanded`]
      }`}
    >
      <div className={styles[`${base}Content`]}>
        <span className={styles[`${base}Title`]}>{title}</span>
        <span className={styles[`${base}Subtitle`]}>{subtitle}</span>
      </div>
    </Card>
  );
};

export default TextCard;
