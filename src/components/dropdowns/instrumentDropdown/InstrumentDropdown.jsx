// components/InstrumentSelect.jsx

import React from "react";
import { Select, Row, Col, Typography, Button, Tag } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import styles from "./InstrumentDropdown.module.css";

const { Option } = Select;
const { Text } = Typography;

const InstrumentSelect = ({
  data,
  onSelect,
  onAdd,
  value,
  disabled,
  onClear,
}) => {
  return (
    <div>
      <Select
        showSearch
        placeholder="Select"
        className={styles.borderRadiusForselect}
        optionLabelProp="label"
        value={value}
        onClear={onClear}
        allowClear
        filterOption={(input, option) => {
          const item = data.find((d) => d.id === option.value);
          if (!item) return false;
          const search = input.toLowerCase();
          return (
            item.description?.toLowerCase().includes(search) ||
            item.name?.toLowerCase().includes(search)
          );
        }}
        onSelect={onSelect}
        disabled={disabled}
      >
        {data.map((item) => (
          <Option key={item.id} value={item.id} label={item.description}>
            <div
              className={styles.inlineRow}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div
                className={styles.inlineRowContent}
                style={{ display: "flex", alignItems: "center", gap: 8 }}
              >
                <Tag className={styles.customTag}>{item.shortCode}</Tag>
                <Text className={styles.ItemsFirstName}>{item.name}</Text>
              </div>

              <div
                className={styles.rightSectionContainer}
                style={{ display: "flex", alignItems: "center", flexShrink: 0 }}
              >
                <div className={styles.rightSection} title={item.description}>
                  <Text className={styles.ItemsSecondaryName}>
                    {item.description}
                  </Text>
                </div>
                <Button
                  icon={<PlusOutlined style={{ color: "#fff" }} />}
                  size="large"
                  className={styles.PlusIconChanges}
                  type="text"
                  onClick={(e) => {
                    onAdd?.(item);
                  }}
                />
              </div>
            </div>
          </Option>
        ))}
      </Select>
    </div>
  );
};

export default InstrumentSelect;
