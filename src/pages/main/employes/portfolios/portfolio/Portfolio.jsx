import React, { useEffect, useState } from "react";
import { Collapse, Typography } from "antd";
import { CaretDownOutlined, CaretUpOutlined } from "@ant-design/icons";
import styles from "../styles.module.css"; // custom styles
import { BorderlessTable } from "../../../../../components";
import { useSearchBarContext } from "../../../../../context/SearchBarContaxt";
import EmptyState from "../../../../../components/emptyStates/empty-states";

const { Panel } = Collapse;
const { Text } = Typography;

const instrumentData = [
  {
    key: "1",
    shortName: "OGDC",
    longName: "Oil & Gas Development Company Limited",
    quantity: 4910000,
    transactions: [
      {
        transactionId: "TRX-012",
        dateTime: "2025-02-20 | 10:00 pm",
        type: "Buy",
        quantity: 100000,
        broker: "AKD Securities Limited",
        verificationTime: "2025-02-20 | 10:00 pm",
      },
      {
        transactionId: "TRX-065",
        dateTime: "2025-02-20 | 10:00 pm",
        type: "Sell",
        quantity: 400000,
        broker: "JS Global Capital Limited",
        verificationTime: "2025-02-20 | 10:00 pm",
      },
      {
        transactionId: "TRX-012",
        dateTime: "2025-02-20 | 10:00 pm",
        type: "Buy",
        quantity: 100000,
        broker: "AKD Securities Limited",
        verificationTime: "2025-02-20 | 10:00 pm",
      },
      {
        transactionId: "TRX-065",
        dateTime: "2025-02-20 | 10:00 pm",
        type: "Sell",
        quantity: 400000,
        broker: "JS Global Capital Limited",
        verificationTime: "2025-02-20 | 10:00 pm",
      },
      {
        transactionId: "TRX-012",
        dateTime: "2025-02-20 | 10:00 pm",
        type: "Buy",
        quantity: 100000,
        broker: "AKD Securities Limited",
        verificationTime: "2025-02-20 | 10:00 pm",
      },
      {
        transactionId: "TRX-065",
        dateTime: "2025-02-20 | 10:00 pm",
        type: "Sell",
        quantity: 400000,
        broker: "JS Global Capital Limited",
        verificationTime: "2025-02-20 | 10:00 pm",
      },
      {
        transactionId: "TRX-012",
        dateTime: "2025-02-20 | 10:00 pm",
        type: "Buy",
        quantity: 100000,
        broker: "AKD Securities Limited",
        verificationTime: "2025-02-20 | 10:00 pm",
      },
      {
        transactionId: "TRX-065",
        dateTime: "2025-02-20 | 10:00 pm",
        type: "Sell",
        quantity: 400000,
        broker: "JS Global Capital Limited",
        verificationTime: "2025-02-20 | 10:00 pm",
      },
      {
        transactionId: "TRX-012",
        dateTime: "2025-02-20 | 10:00 pm",
        type: "Buy",
        quantity: 100000,
        broker: "AKD Securities Limited",
        verificationTime: "2025-02-20 | 10:00 pm",
      },
      {
        transactionId: "TRX-065",
        dateTime: "2025-02-20 | 10:00 pm",
        type: "Sell",
        quantity: 400000,
        broker: "JS Global Capital Limited",
        verificationTime: "2025-02-20 | 10:00 pm",
      },
    ],
  },
  {
    key: "2",
    shortName: "OGDC",
    longName: "Oil & Gas Development Company Limited",
    quantity: 4910000,
    transactions: [
      {
        transactionId: "TRX-012",
        dateTime: "2025-02-20 | 10:00 pm",
        type: "Buy",
        quantity: 100000,
        broker: "AKD Securities Limited",
        verificationTime: "2025-02-20 | 10:00 pm",
      },
      {
        transactionId: "TRX-065",
        dateTime: "2025-02-20 | 10:00 pm",
        type: "Sell",
        quantity: 400000,
        broker: "JS Global Capital Limited",
        verificationTime: "2025-02-20 | 10:00 pm",
      },
      {
        transactionId: "TRX-012",
        dateTime: "2025-02-20 | 10:00 pm",
        type: "Buy",
        quantity: 100000,
        broker: "AKD Securities Limited",
        verificationTime: "2025-02-20 | 10:00 pm",
      },
      {
        transactionId: "TRX-065",
        dateTime: "2025-02-20 | 10:00 pm",
        type: "Sell",
        quantity: 400000,
        broker: "JS Global Capital Limited",
        verificationTime: "2025-02-20 | 10:00 pm",
      },
      {
        transactionId: "TRX-012",
        dateTime: "2025-02-20 | 10:00 pm",
        type: "Buy",
        quantity: 100000,
        broker: "AKD Securities Limited",
        verificationTime: "2025-02-20 | 10:00 pm",
      },
      {
        transactionId: "TRX-065",
        dateTime: "2025-02-20 | 10:00 pm",
        type: "Sell",
        quantity: 400000,
        broker: "JS Global Capital Limited",
        verificationTime: "2025-02-20 | 10:00 pm",
      },
      {
        transactionId: "TRX-012",
        dateTime: "2025-02-20 | 10:00 pm",
        type: "Buy",
        quantity: 100000,
        broker: "AKD Securities Limited",
        verificationTime: "2025-02-20 | 10:00 pm",
      },
      {
        transactionId: "TRX-065",
        dateTime: "2025-02-20 | 10:00 pm",
        type: "Sell",
        quantity: 400000,
        broker: "JS Global Capital Limited",
        verificationTime: "2025-02-20 | 10:00 pm",
      },
      {
        transactionId: "TRX-012",
        dateTime: "2025-02-20 | 10:00 pm",
        type: "Buy",
        quantity: 100000,
        broker: "AKD Securities Limited",
        verificationTime: "2025-02-20 | 10:00 pm",
      },
      {
        transactionId: "TRX-065",
        dateTime: "2025-02-20 | 10:00 pm",
        type: "Sell",
        quantity: 400000,
        broker: "JS Global Capital Limited",
        verificationTime: "2025-02-20 | 10:00 pm",
      },
    ],
  },
  {
    key: "3",
    shortName: "OGDC",
    longName: "Oil & Gas Development Company Limited",
    quantity: 4910000,
    transactions: [
      {
        transactionId: "TRX-012",
        dateTime: "2025-02-20 | 10:00 pm",
        type: "Buy",
        quantity: 100000,
        broker: "AKD Securities Limited",
        verificationTime: "2025-02-20 | 10:00 pm",
      },
      {
        transactionId: "TRX-065",
        dateTime: "2025-02-20 | 10:00 pm",
        type: "Sell",
        quantity: 400000,
        broker: "JS Global Capital Limited",
        verificationTime: "2025-02-20 | 10:00 pm",
      },
      {
        transactionId: "TRX-012",
        dateTime: "2025-02-20 | 10:00 pm",
        type: "Buy",
        quantity: 100000,
        broker: "AKD Securities Limited",
        verificationTime: "2025-02-20 | 10:00 pm",
      },
      {
        transactionId: "TRX-065",
        dateTime: "2025-02-20 | 10:00 pm",
        type: "Sell",
        quantity: 400000,
        broker: "JS Global Capital Limited",
        verificationTime: "2025-02-20 | 10:00 pm",
      },
      {
        transactionId: "TRX-012",
        dateTime: "2025-02-20 | 10:00 pm",
        type: "Buy",
        quantity: 100000,
        broker: "AKD Securities Limited",
        verificationTime: "2025-02-20 | 10:00 pm",
      },
      {
        transactionId: "TRX-065",
        dateTime: "2025-02-20 | 10:00 pm",
        type: "Sell",
        quantity: 400000,
        broker: "JS Global Capital Limited",
        verificationTime: "2025-02-20 | 10:00 pm",
      },
      {
        transactionId: "TRX-012",
        dateTime: "2025-02-20 | 10:00 pm",
        type: "Buy",
        quantity: 100000,
        broker: "AKD Securities Limited",
        verificationTime: "2025-02-20 | 10:00 pm",
      },
      {
        transactionId: "TRX-065",
        dateTime: "2025-02-20 | 10:00 pm",
        type: "Sell",
        quantity: 400000,
        broker: "JS Global Capital Limited",
        verificationTime: "2025-02-20 | 10:00 pm",
      },
      {
        transactionId: "TRX-012",
        dateTime: "2025-02-20 | 10:00 pm",
        type: "Buy",
        quantity: 100000,
        broker: "AKD Securities Limited",
        verificationTime: "2025-02-20 | 10:00 pm",
      },
      {
        transactionId: "TRX-065",
        dateTime: "2025-02-20 | 10:00 pm",
        type: "Sell",
        quantity: 400000,
        broker: "JS Global Capital Limited",
        verificationTime: "2025-02-20 | 10:00 pm",
      },
    ],
  },
  {
    key: "4",
    shortName: "OGDC",
    longName: "Oil & Gas Development Company Limited",
    quantity: -4910000,
    transactions: [
      {
        transactionId: "TRX-012",
        dateTime: "2025-02-20 | 10:00 pm",
        type: "Buy",
        quantity: 100000,
        broker: "AKD Securities Limited",
        verificationTime: "2025-02-20 | 10:00 pm",
      },
      {
        transactionId: "TRX-065",
        dateTime: "2025-02-20 | 10:00 pm",
        type: "Sell",
        quantity: 400000,
        broker: "JS Global Capital Limited",
        verificationTime: "2025-02-20 | 10:00 pm",
      },
      {
        transactionId: "TRX-012",
        dateTime: "2025-02-20 | 10:00 pm",
        type: "Buy",
        quantity: 100000,
        broker: "AKD Securities Limited",
        verificationTime: "2025-02-20 | 10:00 pm",
      },
      {
        transactionId: "TRX-065",
        dateTime: "2025-02-20 | 10:00 pm",
        type: "Sell",
        quantity: 400000,
        broker: "JS Global Capital Limited",
        verificationTime: "2025-02-20 | 10:00 pm",
      },
      {
        transactionId: "TRX-012",
        dateTime: "2025-02-20 | 10:00 pm",
        type: "Buy",
        quantity: 100000,
        broker: "AKD Securities Limited",
        verificationTime: "2025-02-20 | 10:00 pm",
      },
      {
        transactionId: "TRX-065",
        dateTime: "2025-02-20 | 10:00 pm",
        type: "Sell",
        quantity: 400000,
        broker: "JS Global Capital Limited",
        verificationTime: "2025-02-20 | 10:00 pm",
      },
      {
        transactionId: "TRX-012",
        dateTime: "2025-02-20 | 10:00 pm",
        type: "Buy",
        quantity: 100000,
        broker: "AKD Securities Limited",
        verificationTime: "2025-02-20 | 10:00 pm",
      },
      {
        transactionId: "TRX-065",
        dateTime: "2025-02-20 | 10:00 pm",
        type: "Sell",
        quantity: 400000,
        broker: "JS Global Capital Limited",
        verificationTime: "2025-02-20 | 10:00 pm",
      },
      {
        transactionId: "TRX-012",
        dateTime: "2025-02-20 | 10:00 pm",
        type: "Buy",
        quantity: 100000,
        broker: "AKD Securities Limited",
        verificationTime: "2025-02-20 | 10:00 pm",
      },
      {
        transactionId: "TRX-065",
        dateTime: "2025-02-20 | 10:00 pm",
        type: "Sell",
        quantity: 400000,
        broker: "JS Global Capital Limited",
        verificationTime: "2025-02-20 | 10:00 pm",
      },
    ],
  },
  // Add more instruments here...
];

const columns = [
  {
    title: "Transaction ID",
    dataIndex: "transactionId",
    key: "transactionId",
  },
  {
    title: "Transaction Conducted Date & Time",
    dataIndex: "dateTime",
    key: "dateTime",
  },
  {
    title: "Type",
    dataIndex: "type",
    key: "type",
    render: (text) => (
      <Text style={{ color: text === "Buy" ? "#00640A" : "#A50000" }}>
        {text}
      </Text>
    ),
  },
  {
    title: "Quantity",
    dataIndex: "quantity",
    key: "quantity",
    render: (value, record) => (
      <Text style={{ color: record.type === "Buy" ? "#00640A" : "#A50000" }}>
        {value.toLocaleString()}
      </Text>
    ),
  },
  {
    title: "Brokers",
    dataIndex: "broker",
    key: "broker",
  },
  {
    title: "Verification Date & Time",
    dataIndex: "verificationTime",
    key: "verificationTime",
  },
];

const Portfolio = ({ className }) => {
  const [activeKey, setActiveKey] = useState([]);
  const { resetEmployeePortfolioSearch } = useSearchBarContext();
  const toggleIcon = (panelKey) =>
    activeKey.includes(panelKey) ? <CaretUpOutlined /> : <CaretDownOutlined />;

  useEffect(() => {
    try {
      // Get browser navigation entries (used to detect reload)
      const navigationEntries = performance.getEntriesByType("navigation");
      if (navigationEntries.length > 0) {
        const navigationType = navigationEntries[0].type;
        if (navigationType === "reload") {
          // Check localStorage for previously saved selectedKey
          resetEmployeePortfolioSearch();
        }
      }
    } catch (error) {
      console.error(
        "❌ Error detecting page reload or restoring state:",
        error
      );
    }
  }, []);
  return (
    <>
      {instrumentData.length>0 ? (
        <Collapse
          activeKey={activeKey}
          onChange={(keys) => setActiveKey(keys)}
          accordion
          bordered={false}
          className={` ${className || ""}`.trim()} // Combine both
          style={{ background: "#fff", border: "none" }}
        >
          {instrumentData.map((instrument) => {
            const panelKey = instrument.key;
            const isPositive = instrument.quantity >= 0;
            return (
              <Panel
                className={styles.Panel} // Combine both
                header={
                  <div className={styles.panelHeader}>
                    <span className={styles.shortName}>
                      {instrument.shortName}
                    </span>
                    <span className={styles.longName}>
                      {instrument.longName}
                    </span>
                    <span
                      className={styles.quantity}
                      style={{ color: isPositive ? "#00640A" : "#A50000" }}
                    >
                      {instrument.quantity.toLocaleString()}
                    </span>
                    <span>{toggleIcon(panelKey)}</span>
                  </div>
                }
                key={panelKey}
                showArrow={false}
              >
                <BorderlessTable
                  rows={instrument.transactions}
                  columns={columns}
                  pagination={false}
                  rowKey="transactionId"
                  classNameTable="border-less-table-white"
                  scroll={{ x: "max-content", y: 450 }}
                />
              </Panel>
            );
          })}
        </Collapse>
      ) : (
        <EmptyState type="Underdevelopment" />
      )}
    </>
  );
};

export default Portfolio;

// return <EmptyState type="Underdevelopment" />;
