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
        filterOption={(input, option) =>
          (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
        }
        onSelect={onSelect}
        disabled={disabled}
      >
        {data.map((item) => (
          <Option key={item.type} value={item.type} label={item.description}>
            <Row align="middle" justify="space-between">
              <Col>
                <Row align="middle" gutter={8}>
                  <Col>
                    <Tag className={styles.customTag}>{item.type}</Tag>
                  </Col>
                  <Col>
                    <Text className={styles.ItemsFirstName}>{item.name}</Text>
                  </Col>
                </Row>
              </Col>
              <Col flex="none">
                <div className={styles.rightSection} title={item.description}>
                  <Text className={styles.ItemsSecondaryName}>
                    {item.description}
                  </Text>
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
              </Col>
            </Row>
          </Option>
        ))}
      </Select>
    </div>
  );
};

export default InstrumentSelect;
