/**
 * Builds Ant Design Table column definitions for employee portfolio transactions.
 *
 * Features:
 * - Transaction ID: formatted with optional uploaded icon (2px spacing).
 * - Transaction Conducted Date & Time: formatted via `formatApiDateTime`.
 * - Type: Buy/Sell with conditional color coding.
 * - Quantity: Number with Buy/Sell color coding.
 * - Brokers: Supports single, multiple, or "Multiple Brokers".
 *   - Matches broker IDs against provided `brokerOptions`.
 *   - Falls back to showing raw ID(s) if not found.
 *   - Automatically wraps text for long broker names.
 * - Verification Date & Time: formatted via `formatApiDateTime`.
 *
 * @param {Object} deps - External dependencies
 * @param {Function} deps.formatCode - Formats transaction IDs
 * @param {Function} deps.formatApiDateTime - Formats date/time values
 * @param {string} deps.UploadIcon - Path/URL for uploaded portfolio icon
 * @param {Array} deps.brokerOptions - Available brokers [{ brokerID: number, brokerName: string, label: string }]
 * @param {React.ElementType} deps.Text - Typography/Text component (e.g., from Ant Design)
 * @param {React.ElementType} [deps.Tag] - Optional Tag component (e.g., from Ant Design) for broker display
 * @returns {Array} Column definitions for Ant Design Table
 */
export function getEmployeePortfolioColumns({
  formatCode,
  formatApiDateTime,
  UploadIcon,
  brokerOptions = [],
  Text,
  Tag,
}) {
  /**
   * Resolve broker IDs into human-readable names.
   *
   * @param {string|string[]} brokerIds - Broker ID(s) or "Multiple Brokers"
   * @returns {string|JSX.Element[]} Broker name(s) or placeholder.
   */
  const getBrokerNames = (brokerIds) => {
    if (!brokerIds) return "—";

    // Handle "Multiple Brokers"
    if (brokerIds === "Multiple Brokers") {
      return "Multiple Brokers";
    }

    // Handle array of broker IDs
    if (Array.isArray(brokerIds)) {
      return brokerIds.map((id, index) => {
        const broker = brokerOptions.find(
          (b) => String(b.brokerID) === String(id)
        );
        const name = broker?.brokerName || broker?.label || String(id);

        // Use Tag component if provided, else fallback to plain text
        return Tag ? (
          <Tag key={id} style={{ marginRight: 4, whiteSpace: "normal" }}>
            {name}
          </Tag>
        ) : (
          <span
            key={id}
            style={{
              display: "inline-block",
              marginRight: 4,
              whiteSpace: "normal",
            }}
          >
            {name}
          </span>
        );
      });
    }

    // Handle single broker ID
    const broker = brokerOptions.find(
      (b) => String(b.brokerID) === String(brokerIds)
    );
    return broker?.brokerName || broker?.label || String(brokerIds);
  };

  return [
    {
      title: "Transaction ID",
      dataIndex: "tradeApprovalId",
      key: "tradeApprovalId",
      width: "15%",
      render: (text, record) => (
        <span className="font-medium flex items-center" title={text || "N/A"}>
          {formatCode?.(text) || "—"}
          {record?.uploadPortFolioTranaction && (
            <img
              draggable={false}
              src={UploadIcon}
              alt="Uploaded Portfolio"
              style={{ width: 16, height: 16, marginLeft: "2px" }}
            />
          )}
        </span>
      ),
    },
    {
      title: "Transaction Conducted Date & Time",
      dataIndex: "verificationConductedDate",
      key: "verificationConductedDate",
      width: "20%",
      render: (_, record) => {
        const rawValue = `${record?.verificationConductedDate || ""} ${
          record?.verificationConductedTime || ""
        }`.trim();
        return formatApiDateTime?.(rawValue || "—") || "—";
      },
    },
    {
      title: "Type",
      dataIndex: "tradeType",
      key: "tradeType",
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
      width: 150,
      render: (value, record) => (
        <Text
          style={{ color: record.tradeType === "Buy" ? "#00640A" : "#A50000" }}
        >
          {value?.toLocaleString?.() || "—"}
        </Text>
      ),
    },
    {
      title: "Brokers",
      dataIndex: "brokers",
      key: "brokers",
      width: "30%",
      render: (brokerIds) => (
        <div
          style={{
            whiteSpace: "normal", // ✅ allows wrapping
            wordBreak: "break-word", // ✅ breaks long words
            maxWidth: "100%", // prevents overflow
          }}
        >
          {getBrokerNames(brokerIds)}
        </div>
      ),
    },
    {
      title: "Verification Date & Time",
      dataIndex: "verificationConductedDate",
      key: "verificationConductedDate",
      render: (_, record) => {
        const rawValue = `${record?.verificationConductedDate || ""} ${
          record?.verificationConductedTime || ""
        }`.trim();
        return formatApiDateTime?.(rawValue || "—") || "—";
      },
    },
  ];
}
