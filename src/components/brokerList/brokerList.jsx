import React from "react";
import { Row, Col, Tag } from "antd";
import styles from "./brokerList.module.css"; // create css module for BrokerList
import { useDashboardContext } from "../../context/dashboardContaxt";

const BrokerList = ({ statusData, viewDetailsData, variant }) => {
  const { employeeBasedBrokersData } = useDashboardContext();

  // Map variant to class name
  const getVariantClass = () => {
    if (statusData?.label === "Traded") {
      return styles.backgroundColorOfInstrumentDetailTradednoradius;
    }
    switch (variant) {
      case "Blue":
        return styles.backgroundColorOfInstrumentDetailTradednoradius;
      case "Orange":
        return styles.backgrounColorOfBrokerDetail;
      default:
        return styles.backgrounColorOfBrokerDetail;
    }
  };

  return (
    <Row style={{ marginTop: "3px" }}>
      <Col span={24}>
        <div className={getVariantClass()}>
          <label className={styles.viewDetailMainLabels}>Brokers</label>
          <div className={styles.tagContainer}>
            {viewDetailsData?.details?.[0]?.brokers?.map((brokerId) => {
              const broker = employeeBasedBrokersData?.find(
                (b) => String(b.brokerID) === String(brokerId)
              );

              return (
                broker && (
                  <Tag key={broker.brokerID} className={styles.tagClasses}>
                    {broker.brokerName}
                  </Tag>
                )
              );
            })}
          </div>
        </div>
      </Col>
    </Row>
  );
};

export default BrokerList;
