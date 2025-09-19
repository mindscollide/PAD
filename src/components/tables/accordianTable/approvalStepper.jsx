import React from "react";
import styles from "./ApprovalStepper.module.css";
import CheckIcon from "../../../assets/img/Check.png";
import EllipsesIcon from "../../../assets/img/Ellipses.png";
import CrossIcon from "../../../assets/img/Cross.png";
import Dollar from "../../../assets/img/Dollar.png";
import SendForApproval from "../../../assets/img/SendForApproval.png";
import Resubmitted from "../../../assets/img/Resubmitted.png";
import NotTraded from "../../../assets/img/NotTraded.png";
import EscaltedOn from "../../../assets/img/EscaltedOn.png";
import Decline from "../../../assets/img/Cross.png";
import { Stepper, Step } from "react-form-stepper";

const ApprovalStepper = ({ trail }) => {
  // map type to actual <img>
  const getIcon = (type, altText) => {
    switch (type) {
      case "check":
        return <img src={CheckIcon} alt={altText} width={50} height={50} />;
      case "ellipsis":
        return <img src={EllipsesIcon} alt={altText} width={50} height={50} />;
      case "cross":
        return <img src={CrossIcon} alt={altText} width={50} height={50} />;
      case "Dollar":
        return <img src={Dollar} alt={altText} width={50} height={50} />;
      case "Approval":
        return (
          <img src={SendForApproval} alt={altText} width={50} height={50} />
        );
      case "Resubmitted":
        return <img src={Resubmitted} alt={altText} width={50} height={50} />;
      case "NotTraded":
        return <img src={NotTraded} alt={altText} width={50} height={50} />;
      case "EscaltedOn":
        return <img src={EscaltedOn} alt={altText} width={50} height={50} />;
      case "Decline":
        return <img src={Decline} alt={altText} width={50} height={50} />;
      default:
        return null;
    }
  };

  return (
    <div className={styles.stepperContainer}>
      <Stepper
        activeStep={trail.length - 1} // highlight the last step as active
        connectorStyleConfig={{
          activeColor: "#00640A", // green line for completed steps
          completedColor: "#00640A",
          disabledColor: "#424242", // gray line for upcoming steps
          size: 1,
        }}
        styleConfig={{
          size: "2em", // step circle size
          circleFontSize: "0px", // hide default numbers
          labelFontSize: "14px",
          borderRadius: "50%",
        }}
      >
        {trail.map((step, index) => (
          <Step
            key={index}
            label={
              <div className={styles.customLabel}>
                <div className={styles.stepCircle}>
                  {getIcon(step.iconType, step.status)}
                </div>
                <div className={styles.stepTitle}>{step.user}</div>
                <div className={styles.stepDesc}>
                  {step.date} | {step.status}
                </div>
              </div>
            }
          />
        ))}
      </Stepper>
    </div>
  );
};

export default ApprovalStepper;
