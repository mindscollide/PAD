import React, { useState } from "react";
import { Card, Typography, Row, Col } from "antd";
import styles from "./boxCard.module.css";

// Utility functions and mappings
import { navigateToPage, typeColorMap } from "./utils";
import {
  formatNumberWithCommas,
  convertSingleDigittoDoubble,
} from "../../../commen/funtions/rejex";
import { useNavigate } from "react-router-dom";
import { useSidebarContext } from "../../../context/sidebarContaxt";
import EmptyState from "../../emptyStates/empty-states";
import urgent from "../../../assets/img/urgent-red.png";
import AnimatedCount from "./animatedCount";
import { Button } from "../..";
const { Text } = Typography;

/**
 * ==============================
 *  BoxCard Component
 * ==============================
 *
 * A reusable **statistical card UI** that:
 * - Displays one or more "stat boxes" (label + count).
 * - Supports multiple layout styles (`up`, `down`, `left`).
 * - Dynamically colors boxes based on `type` via `typeColorMap`.
 * - Optionally renders a header button to navigate to other routes.
 * - Handles empty data by showing an `EmptyState` or default fallback (for "portfolio").
 *
 * Example usage:
 * ```jsx
 * <BoxCard
 *   title="Approvals"
 *   boxes={[
 *     { label: "Pending", count: 12, type: "warning" },
 *     { label: "Approved", count: 40, type: "success" },
 *   ]}
 *   mainClassName="dashboardCard"
 *   buttonTitle="View All"
 *   locationStyle="down"
 *   userRole="admin"
 *   route="approvals"
 * />
 * ```
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.title - Card title (appears in the header).
 * @param {Array<{label: string, count: number, type: string}>} props.boxes - Data boxes with label, count, and type.
 * @param {string} [props.mainClassName=""] - Base CSS module class for styling variations.
 * @param {string} [props.buttonTitle=""] - Optional text for the header button.
 * @param {string} [props.buttonClassName=""] - CSS class for button styling.
 * @param {"up"|"down"|"left"} [props.locationStyle="down"] - Layout for placing count relative to label.
 * @param {string} [props.userRole=""] - User role (passed for route navigation logic).
 * @param {string} props.route - Route key (used for navigation and empty states).
 * @param {boolean} [props.warningFlag=false] - If true, applies warning styling and logic to the first box.
 *
 * @returns {JSX.Element} Rendered BoxCard component.
 */
const BoxCard = ({
  title,
  boxes = [],
  mainClassName = "",
  buttonTitle = "",
  buttonId = "",
  buttonClassName = "",
  locationStyle = "down",
  userRole = "",
  route,
  warningFlag = false,
}) => {
  const base = mainClassName || "smallShareHomeCard"; // fallback class name if none provided
  const navigate = useNavigate();
  const { setSelectedKey } = useSidebarContext();
  const [sortedInfo, setSortedInfo] = useState({});

  // Normalize boxes input (always an array)
  const normalizedBoxes = Array.isArray(boxes) ? boxes : boxes ? [boxes] : [];

  /**
   * Handles button click → navigates to the correct route
   * using helper `navigateToPage` (handles role-based logic).
   */
  const handleClick = () => {
    navigateToPage(userRole, route, setSelectedKey, navigate);
  };

  return (
    <Card
      className={`${styles[mainClassName]} ${
        warningFlag ? styles.warning : ""
      }`}
      style={{ padding: "10px 20px" }}
    >
      {/* ========================
          Header Section
      ========================= */}
      <div className={styles[`${base}cardHeader`]}>
        <span className={styles[`${base}cardTitle`]}>{title}</span>

        {buttonTitle && (
          <div className={styles[`${base}buttonContainer`]}>
            <Button
              type="primary"
              id={buttonId}
              text={buttonTitle}
              className={buttonClassName}
              onClick={handleClick}
            />
          </div>
        )}
      </div>

      {/* ========================
          Content Section
      ========================= */}
      {normalizedBoxes.length > 0 ? (
        <Row className={styles[`${base}statBoxMain`]} gutter={[16, 16]}>
          {normalizedBoxes.map((box, index) => {
            // Resolve colors & alignment based on `type`
            const { bgColor, textLableColor, textCountColor, textAlign } =
              typeColorMap[box.type?.toLowerCase().replace(/\s+/g, "_")] || {
                bgColor: "#f0f0f0",
                textLableColor: "#000",
                textCountColor: "#000",
                textAlign: "center",
              };

            // Split label into first word + remaining text (used in "left" layout)
            const [firstWord, ...rest] = box.label.split(" ");
            const secondPart = rest.join(" ");

            // Responsive column span per box
            const totalCols = 24;
            const span =
              normalizedBoxes.length > 0
                ? Math.floor(totalCols / normalizedBoxes.length)
                : 24;

            return warningFlag && index === 1 ? (
              // 🔴 Case 1: warning + first box
              <Col span={24} key={index}>
                <div className={styles.warningBox}>
                  <div className={styles.urgentErrorHeader}>
                    {/* Left Heading */}
                    <Text className={styles.urgentErrorTitle}>
                      {" "}
                      Action Required!
                    </Text>

                    {/* Right Close Icon */}
                    <span
                      style={{
                        fontSize: "20px",
                        fontWeight: "bold",
                        cursor: "pointer",
                      }}
                      onClick={() => console.log("Close clicked")} // replace with close action
                    >
                      ✕
                    </span>
                  </div>

                  {/* Bottom Section */}
                  <div
                    style={{
                      backgroundColor: "#FFF1E7",
                      display: "flex",
                      alignItems: "center",
                      padding: "16px",
                      borderBottomLeftRadius: "8px",
                      borderBottomRightRadius: "8px",
                    }}
                  >
                    {/* Clock Icon */}
                    <img
                      src={urgent}
                      alt="urgent"
                      className={styles.urgentImg}
                    />

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        lineHeight: "1.2",
                      }}
                    >
                      {/* Bold Title */}
                      <Text className={styles.urgentText}>URGENT</Text>

                      {/* Subtext (dynamic count) */}
                      <Text className={styles.urgentDescription}>
                        {convertSingleDigittoDoubble(
                          formatNumberWithCommas(box.count)
                        )}{" "}
                        Approvals Required Before Deadline
                      </Text>
                    </div>
                  </div>
                </div>
              </Col>
            ) : (
              !warningFlag && (
                // 🟢 Case 2: all other boxes
                <Col span={span} key={index}>
                  <div
                    className={styles[`${base}statBox`]}
                    style={{ backgroundColor: bgColor, textAlign }}
                  >
                    {locationStyle === "down" ? (
                      // Label on top, count below
                      <>
                        <Text
                          className={styles[`${base}label`]}
                          style={{ color: textLableColor }}
                        >
                          {box.label}
                        </Text>
                        <AnimatedCount
                          className={styles[`${base}count`]}
                          style={{ color: textCountColor }}
                          value={convertSingleDigittoDoubble(
                            formatNumberWithCommas(box.count)
                          )}
                        />
                      </>
                    ) : locationStyle === "up" ? (
                      // Count on top, label below
                      <>
                        <div className={styles.countWrapper}>
                          <AnimatedCount
                            className={styles[`${base}count`]}
                            style={{ color: textCountColor }}
                            value={convertSingleDigittoDoubble(
                              formatNumberWithCommas(box.count)
                            )}
                          />
                        </div>

                        <Text
                          className={styles[`${base}label`]}
                          style={{ color: textLableColor }}
                        >
                          {box.label}
                        </Text>
                      </>
                    ) : (
                      // Left-aligned style: count on left, label split on right
                      <Row
                        gutter={[16, 16]}
                        align="middle"
                        justify="space-between"
                      >
                        <Col>
                          <AnimatedCount
                            className={styles[`${base}count`]}
                            style={{ color: textCountColor }}
                            value={convertSingleDigittoDoubble(
                              formatNumberWithCommas(box.count)
                            )}
                          />
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
                              <span style={{ display: "block" }}>
                                {secondPart}
                              </span>
                            </Text>
                          </Row>
                        </Col>
                      </Row>
                    )}
                  </div>
                </Col>
              )
            );
          })}
        </Row>
      ) : route === "portfolio" ? (
        // Special fallback for portfolio route
        <Row className={styles[`${base}statBoxMain`]} gutter={[16, 16]}>
          <Col span={24}>
            <div
              className={styles[`${base}statBox`]}
              style={{
                backgroundColor: "#C5FFC7",
                textAlign: "left",
              }}
            >
              <Text
                className={styles[`${base}label`]}
                style={{ color: "#30426A" }}
              >
                No. of Shares
              </Text>
              <AnimatedCount
                className={styles[`${base}count`]}
                style={{ color: "#00640A" }}
                value={convertSingleDigittoDoubble(formatNumberWithCommas(0))}
              />
            </div>
          </Col>
        </Row>
      ) : (
        // Generic empty state for other routes
        <EmptyState style={{ display: "contents" }} type={route} />
      )}
    </Card>
  );
};

export default BoxCard;
