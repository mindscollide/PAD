// DonutChart.jsx
import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import styles from "./donutChart.module.css";

ChartJS.register(ArcElement, Tooltip, Legend);

// 🔹 Status → Color Mapping
const statusColorMap = {
  Pending: "#717171",
  Approved: "#00640A",
  Declined: "#A50000",
  Traded: "#30426A",
  "Not-Traded": "#424242",
  Resubmitted: "#F67F29",
  Resubmit: "#F67F29",
  Compliant: "#00640A",
  "Non-Compliant": "#A50000",
};

const DonutChart = ({ labels, counts, percentages, totalCount }) => {
  const backgroundColors = labels.map(
    (label) => statusColorMap[label] || "#999999"
  );

  const data = {
    labels,
    datasets: [
      {
        data: percentages, // donut values
        backgroundColor: backgroundColors,
        borderWidth: 1,
      },
    ],
  };

  const options = {
    cutout: "75%",
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (tooltipItem) => {
            const label = tooltipItem.label;
            const percent = tooltipItem.raw;
            const count = counts[tooltipItem.dataIndex];
            return `${label}: ${count} (${percent}%)`;
          },
        },
      },
    },
  };

  return (
    <div className={styles.donutMainDiv}>
      <Doughnut data={data} options={options} />

      {/* Center total number */}
      <div className={styles.centerCountNumDonut}>
        {totalCount}
        <div
          style={{
            fontSize: "17px",
            fontWeight: 600,
            color: "#424242",
            fontFamily: "Switzer Variable",
          }}
        >
          Total Requests
        </div>
      </div>
    </div>
  );
};

export default DonutChart;
