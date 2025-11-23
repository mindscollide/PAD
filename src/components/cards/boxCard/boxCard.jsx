import React, { useState } from "react";
import { Card, Typography, Row, Col, Progress } from "antd";
import styles from "./boxCard.module.css";

// Utility functions and mappings
import { navigateToPage, typeColorMap } from "./utils";
import {
  formatNumberWithCommas,
  convertSingleDigittoDoubble,
} from "../../../common/funtions/rejex";
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
  reportsFlag = false,
  showProgress = false,
  percentageText,
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
  changeTextSize = false,
  setUrgentAlert,
}) => {
  const base = mainClassName || "smallShareHomeCard"; // fallback class name if none provided
  const navigate = useNavigate();
  const { setSelectedKey } = useSidebarContext();
  const [sortedInfo, setSortedInfo] = useState({});
  const roles = JSON.parse(sessionStorage.getItem("user_assigned_roles"));
  // Prevent multiple fetches on mount
  const userRoleIDs = roles.map((r) => r.roleID);
  // Normalize boxes input (always an array)
  let normalizedBoxes = Array.isArray(boxes) ? boxes : boxes ? [boxes] : [];
  console.log("normalizedBoxes", normalizedBoxes);
  console.log("normalizedBoxes", boxes);

  /**
   * Handles button click → navigates to the correct route
   * using helper `navigateToPage` (handles role-based logic).
   */
  const handleClick = () => {
    navigateToPage(userRole, route, setSelectedKey, navigate);
  };

  const handleClosedWarning = () => {
    if (userRoleIDs.includes(3)) {
      const urgent_flag = JSON.parse(sessionStorage.getItem("urgent_flag"));
      if (urgent_flag) {
        sessionStorage.setItem("urgent_flag", false);
        setUrgentAlert(false);
      }
    }
  };
  // Handle card click
  const handleCardClick = () => {
    console.log("routerouteroute",route)
    // You can switch route based on props or conditions
    navigate(route);
  };
  return (
    <Card
      className={`${styles[mainClassName]} ${
        warningFlag ? styles.warning : ""
      }`}
      style={{ padding: "10px 20px" }}
      onClick={reportsFlag ? handleCardClick : undefined}
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
              typeColorMap[box.type?.toLowerCase().replace(/[\s-]+/g, "_")] || {
                bgColor: "#f0f0f0",
                textLableColor: "#000",
                textCountColor: "#000",
                textAlign: "center",
              };
            // Split label into first word + remaining text (used in "left" layout)
            const [firstWord, ...rest] = box.label.split(" ");
            const secondPart = rest.join(" ");

            // Responsive column span per box
            const itemsToRender = showProgress
              ? normalizedBoxes.slice(0, normalizedBoxes.length - 1)
              : normalizedBoxes;
            const totalCols = 24;
            const span =
              itemsToRender.length > 0
                ? Math.floor(totalCols / itemsToRender.length)
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
                      onClick={() => handleClosedWarning()} // replace with close action
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
                      draggable={false}
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
              !warningFlag &&
                (showProgress && index === normalizedBoxes.length - 1 ? (
                  (() => {
                    return (
                      <>
                        <Text
                          span={24}
                          key={index}
                          className={styles.percentageText}
                        >
                          {box.count}% {percentageText}
                        </Text>

                        <Col span={24} key={index}>
                          <Progress
                            percent={box.count}
                            type="line"
                            strokeColor="#00640A"
                          />
                        </Col>
                      </>
                    );
                  })()
                ) : (
                  // 🟢 Case 2: all other boxes
                  <Col span={span} key={index}>
                    <div
                      className={styles[`${base}statBox`]}
                      style={{
                        backgroundColor: bgColor,
                        textAlign,
                        height:
                          showProgress &&
                          index !== normalizedBoxes.length - 1 &&
                          "167px",
                      }}
                    >
                      {locationStyle === "down" ? (
                        // Label on top, count below
                        <>
                          <Text
                            className={styles[`${base}label`]}
                            style={{
                              color: textLableColor,
                              textAlign: "right",
                            }}
                          >
                            {box.label}
                          </Text>
                          <AnimatedCount
                            className={styles[`${base}count`]}
                            style={{ color: textCountColor }}
                            flag={true}
                            value={convertSingleDigittoDoubble(
                              formatNumberWithCommas(box.count)
                            )}
                          />
                        </>
                      ) : locationStyle === "up" ? (
                        <>
                          {showProgress ? (
                            index !== normalizedBoxes.length - 1 && (
                              // Case 1: showProgress = false → NOT last → show count + label
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
                                  className={
                                    styles[
                                      `${base}${
                                        changeTextSize ? "label2" : "label"
                                      }`
                                    ]
                                  }
                                  style={{ color: textLableColor }}
                                >
                                  {box.label}
                                </Text>
                              </>
                            )
                          ) : (
                            // Case 3: showProgress = true → ALWAYS show count + label
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
                                className={
                                  styles[
                                    `${base}${
                                      changeTextSize ? "label2" : "label"
                                    }`
                                  ]
                                }
                                style={{ color: textLableColor }}
                              >
                                {box.label}
                              </Text>
                            </>
                          )}
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
                                  style={{
                                    fontWeight: "bold",
                                    display: "block",
                                  }}
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
                ))
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
