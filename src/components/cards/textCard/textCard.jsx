import React from "react";
import { Card } from "antd";
import styles from "./textCard.module.css";
import { useSidebarContext } from "../../../context/sidebarContaxt";

const TextCard = ({ title, subtitle, className }) => {
  const base = className || "smallCard";
  const { collapsed } = useSidebarContext();
  const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
      return "GOOD MORNING!";
    } else if (hour >= 12 && hour < 17) {
      return "GOOD AFTERNOON!";
    } else if (hour >= 17 && hour < 21) {
      return "GOOD EVENING!";
    } else {
      return "GOOD NIGHT!";
    }
  };
  return (
    <Card
      className={`${styles[base]} ${
        collapsed ? styles[`${base}Collapsed`] : styles[`${base}Expanded`]
      }`}
    >
      <div className={styles[`${base}Content`]}>
        <span className={styles[`${base}Title`]}>{title}</span>
        <span className={styles[`${base}Subtitle`]}>{getGreeting()}</span>
      </div>
    </Card>
  );
};

export default TextCard;
