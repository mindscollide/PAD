import React from "react";
import { Card, Typography, Row, Col } from "antd";
import styles from "./boxCard.module.css";

// Utility functions and mappings
import { navigateToPage, typeColorMap } from "./utill";
import { Button } from "../..";
import {
  formatNumberWithCommas,
  convertSingleDigittoDoubble,
} from "../../../commen/funtions/rejex";
import { useNavigate } from "react-router-dom";
import { useSidebarContext } from "../../../context/sidebarContaxt";

const { Text } = Typography;

/**
 * BoxCard Component
 *
 * Renders a card UI displaying statistical data boxes with a button.
 * Box colors and layout change dynamically based on box `type` and `locationStyle`.
 *
 * @param {Object} props - Component props
 * @param {string} props.title - Title displayed at the top of the card
 * @param {Array} props.boxes - Array of data boxes with `label`, `count`, and `type`
 * @param {string} props.mainClassName - Base class name for styling (used for variations)
 * @param {string} props.buttonTitle - Text displayed on the action button (optional)
 * @param {string} props.buttonClassName - Additional styling class for the button
 * @param {"up"|"down"|"left"} props.locationStyle - Determines where the count appears relative to the label
 * @param {string} props.userRole - User role used for route-based navigation logic
 * @param {string} props.route - Route identifier (e.g., 'approvals') used to determine navigation target
 *
 * @returns {JSX.Element} A card displaying statistical boxes with optional action button
 */
const BoxCard = ({
  title,
  boxes = [],
  mainClassName = "",
  buttonTitle = "",
  buttonClassName = "",
  locationStyle = "down",
  userRole = "",
  route,
}) => {
  const base = mainClassName || "smallShareHomeCard"; // fallback class name
  const navigate = useNavigate();
  const { setSelectedKey } = useSidebarContext();
const normalizedBoxes = Array.isArray(boxes) ? boxes : boxes ? [boxes] : [];
  // Handles button click, navigates based on role and route
  const handleClick = () => {
    navigateToPage(userRole, route, setSelectedKey, navigate);
  };

  return (
    <Card className={styles[mainClassName]}>
      {/* Header */}
      <div className={styles[`${base}cardHeader`]}>
        <span className={styles[`${base}cardTitle`]}>{title}</span>

        {buttonTitle && (
          <div className={styles[`${base}buttonContainer`]}>
            <Button
              type="primary"
              text={buttonTitle}
              className={buttonClassName}
              onClick={handleClick}
            />
          </div>
        )}
      </div>

      {/* Content boxes */}
      <Row className={styles[`${base}statBoxMain`]} gutter={[16, 16]}>
        {normalizedBoxes.map((box, index) => {
          // Get styles from typeColorMap or fallback
          const { bgColor, textLableColor, textCountColor, textAlign } =
            typeColorMap[box.type?.toLowerCase()] || {
              bgColor: "#f0f0f0",
              textColor: "#000",
              textAlign: "center",
            };

          // Label split for multi-line styling (left layout)
          const [firstWord, ...rest] = box.label.split(" ");
          const secondPart = rest.join(" ");

          // Dynamic column span based on box count
          const totalCols = 24;
          const span =
            normalizedBoxes.length > 0 ? Math.floor(totalCols / normalizedBoxes.length) : 24;

          return (
            <Col span={span} key={index}>
              <div
                className={styles[`${base}statBox`]}
                style={{ backgroundColor: bgColor, textAlign }}
              >
                {/* Different Layouts: Down / Up / Left */}
                {locationStyle === "down" ? (
                  <>
                    <Text
                      className={styles[`${base}label`]}
                      style={{ color: textLableColor }}
                    >
                      {box.label}
                    </Text>
                    <Text
                      className={styles[`${base}count`]}
                      style={{ color: textCountColor }}
                    >
                      {convertSingleDigittoDoubble(formatNumberWithCommas(box.count))}
                    </Text>
                  </>
                ) : locationStyle === "up" ? (
                  <>
                    <Text
                      className={styles[`${base}count`]}
                      style={{ color: textCountColor }}
                    >
                      {convertSingleDigittoDoubble(formatNumberWithCommas(box.count))}
                    </Text>
                    <Text
                      className={styles[`${base}label`]}
                      style={{ color: textLableColor }}
                    >
                      {box.label}
                    </Text>
                  </>
                ) : (
                  // Left-aligned (count on left, label on right in two lines)
                  <Row gutter={[16, 16]} align="middle" justify="space-between">
                    <Col>
                      <Text
                        className={styles[`${base}count`]}
                        style={{ color: textCountColor }}
                      >
                        {convertSingleDigittoDoubble(formatNumberWithCommas(box.count))}
                      </Text>
                    </Col>
                    <Col>
                      <Row>
                        <Text
                          className={styles[`${base}label`]}
                          style={{ color: textLableColor }}
                        >
                          <span
                            style={{ fontWeight: "bold", display: "block" }}
                          >
                            {firstWord}
                          </span>
                        </Text>
                      </Row>
                      <Row>
                        <Text
                          className={styles[`${base}label`]}
                          style={{ color: textLableColor }}
                        >
                          <span style={{ display: "block" }}>{secondPart}</span>
                        </Text>
                      </Row>
                    </Col>
                  </Row>
                )}
              </div>
            </Col>
          );
        })}
      </Row>
    </Card>
  );
};

export default BoxCard;
