import React, { useState } from "react";
import { Dropdown, Menu, Button } from "antd";
import { DownOutlined } from "@ant-design/icons";
import styles from "./ComonDropDown.module.css";

const ComonDropDown = ({
  menuItems = [],
  buttonLabel = "Dropdown",
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const menu = (
    <Menu className={styles.customMenu}>
      {menuItems.map((item) => (
        <Menu.Item
          key={item.key}
          onClick={item.onClick}
          className={styles.customMenuItem}
        >
          {item.label}
        </Menu.Item>
      ))}
    </Menu>
  );

  return (
    <Dropdown
      overlay={menu}
      trigger={["click"]}
      onOpenChange={(open) => setIsOpen(open)}
    >
      <Button className={`${styles.dropdownButton} ${styles[className] || ""}`}>
        <span>{buttonLabel}</span>
        <DownOutlined
          className={`${styles.arrowIcon} ${isOpen ? styles.open : ""}`}
        />
      </Button>
    </Dropdown>
  );
};

export default ComonDropDown;
