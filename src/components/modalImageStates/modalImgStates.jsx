import React from "react";
import styles from "./modalImgStates.module.css";
import ApprovalsIcon from "../../assets/img/approval-icon.png";
import Restricted from "../../assets/img/Restricted.png";
import DelcinedImg from "../../assets/img/DelcinedImg.png";
import ApprovedImg from "../../assets/img/ApprovedImg.png";
import AddBroker from "../../assets/img/AddBroker.png";

const config = {
  Submitted: {
    heading: "Submitted",
    subheading:
      "Your transaction conduct request has been submitted successfully",
    image: ApprovalsIcon,
  },

  PortfolioSubmitted: {
    heading: "Portfolio submitted",
    subheading: "Your portfolio has been added and sent for verification",
    image: ApprovalsIcon,
  },

  EquitiesSubmitted: {
    heading: "Submitted",
    subheading: "Your approval request has been submitted successfully",
    image: ApprovalsIcon,
  },

  Resubmitted: {
    heading: "Resubmitted",
    subheading: "Your approval request has been resubmitted successfully",
    image: ApprovalsIcon,
  },
  TradeRestricted: {
    heading: "Trade Request Restricted",
    subheading: (
      <>
        Your request to buy shares of PSO cannot be processed due to <br />
        the violation of policy
      </>
    ),
    image: Restricted,
  },
  Approved: {
    heading: "Approved",
    subheading:
      "You have approved this transaction. The requester will be notified.",
    image: ApprovedImg,
  },
  Compliant: {
    heading: "Compliant",
    subheading:
      "You have marked this transaction as Compliant. The requester will be notified.",
    image: ApprovedImg,
  },

  NonCompliant: {
    heading: "Non-Compliant",
    subheading: "You have marked this transaction as Non-Compliant.",
    image: DelcinedImg,
  },
  Declined: {
    heading: "Declined",
    subheading: "You have declined this request.",
    image: DelcinedImg,
  },
  addBroker: {
    heading: "Great!",
    subheading: "The broker has been added successfully.",
    image: AddBroker,
  },

  unSaveChanges: {
    heading: "Unsaved Changes",
    subheading: (
      <>
        You have unsaved changes. Are you sure you want to leave without saving?{" "}
        <br />
        All unsaved changes will be lost.
      </>
    ),
    image: null,
  },
};

const ModalImgStates = ({
  type = "Submitted",
  style = {},
  headingClassName = "",
  subheadingClassName = "",
  containerClassName = "",
}) => {
  const state = config[type];

  if (!state) return null;

  const { heading, subheading, image } = state;

  return (
    <div className={`${styles.container} ${containerClassName}`} style={style}>
      {image && <img draggable={false} src={image} alt={type} />}
      <div className={`${styles.heading} ${headingClassName}`}>{heading}</div>
      <div className={`${styles.subheading} ${subheadingClassName}`}>
        {subheading}
      </div>
    </div>
  );
};

export default ModalImgStates;
