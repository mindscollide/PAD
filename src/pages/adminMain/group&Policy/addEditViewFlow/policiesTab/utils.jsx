import { Checkbox, Input, Select, Spin, Tooltip } from "antd";
import React from "react";
const { Option } = Select;

export const policyColumns = ({
  onSelectChange,
  onDurationChange,
  selectedPolicies = [], // 👈 pass selected array
  loadingPolicyId,
}) => [
  {
    title: "Select",
    dataIndex: "policyID",
    key: "policyID",
    align: "center",
    width: 80,
    render: (_, record) => {
      // const isChecked = selectedPolicies.some(
      //   (p) => p.policyID === record.policyId
      // );

      return (
        <Checkbox
          // checked={isChecked}
          onChange={(e) => onSelectChange(record, e.target.checked)}
          className="custom-broker-option"
        />
      );
    },
  },
  {
    title: "",
    dataIndex: "spacer",
    render: () => null,
    width: 10,
  },
  {
    title: "Policy ID",
    dataIndex: "policyId",
    key: "policyId",
    render: (policyId) => (
      <Tooltip title={policyId}>
        <span style={{ fontFamily: "monospace" }}>
          {policyId || "PL_XX_0000"}
        </span>
      </Tooltip>
    ),
  },
  {
    title: "Scenario",
    dataIndex: "scenario",
    key: "scenario",
    render: (text) => (
      <Tooltip title={text}>
        <span>
          {text?.length > 80 ? text.slice(0, 77) + "..." : text || "-"}
        </span>
      </Tooltip>
    ),
  },
  {
    title: "Duration",
    dataIndex: "duration",
    key: "duration",
    render: (type, record) => {
      switch (type) {
        case "spinner":
          return <Spin size="small" />;
        case "dropdown":
          return (
            <Select
              value={record.durationValue}
              placeholder="Select"
              style={{ width: "100%" }}
              onChange={(value) => onDurationChange(record, value)}
            >
              <Option value="Daily">Daily</Option>
              <Option value="Weekly">Weekly</Option>
              <Option value="Monthly">Monthly</Option>
              <Option value="Yearly">Yearly</Option>
            </Select>
          );
        case "input":
          return (
            <Input
              value={record.durationValue}
              placeholder="Enter"
              onChange={(e) => onDurationChange(record, e.target.value)}
            />
          );
        default:
          return <span>{record.durationValue || "-"}</span>;
      }
    },
  },
  {
    title: "Consequence",
    dataIndex: "consequence",
    key: "consequence",
    render: (text) => (
      <Tooltip title={text}>
        <span>
          {text?.length > 50 ? text.slice(0, 47) + "..." : text || "-"}
        </span>
      </Tooltip>
    ),
  },
];

export const buildApiRequest = (searchState = {}) => ({
  PolicyID: searchState.policyID || null,
  Scenario: searchState.scenario || "",
  Duration: searchState.duration || "",
  Consequence: searchState.consequence || "",
  PageNumber: Number(searchState.pageNumber) || 0,
  Length: Number(searchState.pageSize) || 10,
});
