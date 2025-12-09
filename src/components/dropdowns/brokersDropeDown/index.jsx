import React from "react";
import { Select, Row, Col, Typography, Button, Tooltip } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import styles from "./brokersDropedown.module.css";

const { Option } = Select;
const { Text } = Typography;

/**
 * BrokersSelect Component
 *
 * A dropdown select component for choosing brokers.
 * Only displays brokers with brokerStatusID === 1 (active brokers).
 * Truncates long broker names and PSX codes, showing full values in a tooltip.
 *
 * @param {Object[]} data - Array of broker objects
 * @param {function} onSelect - Callback function triggered when a broker is selected
 * @param {function} onAdd - Callback function triggered when the add (+) button is clicked
 * @param {number|string} value - Selected broker ID
 * @param {boolean} disabled - Disables the select dropdown if true
 * @param {function} onClear - Callback when clearing the selected value
 *
 * Broker object structure:
 * {
 *   brokerID: number,
 *   brokerName: string,
 *   psxCode: string,
 *   brokerStatusID: number,
 *   brokerStatus: string
 * }
 */
const BrokersSelect = ({ data, onSelect, onAdd, value, disabled, onClear }) => {
  // Filter only active brokers (brokerStatusID === 1)
  const activeBrokers = data.filter((item) => item.brokerStatusID === 1);

  /**
   * Truncates text to a maximum length and adds ellipsis if necessary.
   *
   * @param {string} text - Text to truncate
   * @param {number} maxLength - Maximum length of the text
   * @returns {string} - Truncated text
   */
  const truncateText = (text, maxLength) =>
    text.length > maxLength ? text.slice(0, maxLength) + "…" : text;

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
        {activeBrokers.map((item) => (
          <Option
            key={item.brokerID}
            value={item.brokerID}
            label={item.brokerName}
          >
            <Row
              align="middle"
              justify="space-between"
              className={styles.inlineRow}
            >
              {/* Broker Name */}
              <Col>
                <Row
                  align="middle"
                  gutter={8}
                  className={styles.inlineRowContent}
                >
                  <Col>
                    <Tooltip title={item.brokerName}>
                      <Text className={styles.ItemsFirstName}>
                        {truncateText(item.brokerName, 20)}
                      </Text>
                    </Tooltip>
                  </Col>
                </Row>
              </Col>

              {/* PSX Code + Add Button */}
              <Col flex="none" className={styles.rightSectionContainer}>
                <div className={styles.rightSection}>
                  <Tooltip title={item.psxCode}>
                    <Text className={styles.ItemsSecondaryName}>
                      {truncateText(item.psxCode, 8)}
                    </Text>
                  </Tooltip>
                </div>
                <Button
                  icon={<PlusOutlined style={{ color: "#fff" }} />}
                  size="large"
                  className={styles.PlusIconChanges}
                  type="text"
                  onClick={(e) => {
                    onSelect?.(item.brokerID);
                  }}
                />
              </Col>
            </Row>
          </Option>
        ))}
      </Select>
    </div>
  );
};

export default BrokersSelect;
