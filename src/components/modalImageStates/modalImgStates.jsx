import React from "react";
import styles from "./modalImgStates.module.css";
import ApprovalsIcon from "../../assets/img/approval-icon.png";

const config = {
  Submitted: {
    heading: "Submitted",
    subheading:
      "Your transaction conduct request has been submitted successfully",
    image: ApprovalsIcon,
  },
  Resubmitted: {
    heading: "Resubmitted",
    subheading: "Your request has been successfully resubmitted.",
    image: ApprovalsIcon,
  },
};

const ModalImgStates = ({ type = "Submitted", style }) => {
  const { heading, subheading, image } = config[type] || {};

  if (!heading || !subheading || !image) return null; // fallback if type is not valid

  return (
    <div className={styles.container} style={style}>
      <img src={image} alt={type} />
      <div className={styles.heading}>{heading}</div>
      <div className={styles.subheading}>{subheading}</div>
    </div>
  );
};

export default ModalImgStates;
