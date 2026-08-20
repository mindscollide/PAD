import React from "react";
import { Tooltip } from "antd";
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
import circlecheckblue from "../../../assets/img/circle-check-blue-icon.png";
import { Stepper, Step } from "react-form-stepper";

const ApprovalStepper = ({ trail }) => {
  console.log(trail, "checkTrailcheckTrail");

  // map type to actual <img>
  const getIcon = (type, altText) => {
    switch (type) {
      case "Compliant":
        return <img src={CheckIcon} alt={altText} width={50} height={50} />;
      case "Approved":
        return <img src={CheckIcon} alt={altText} width={50} height={50} />;
      case "Pending":
        return <img src={EllipsesIcon} alt={altText} width={50} height={50} />;
      case "ellipsis":
        return <img src={EllipsesIcon} alt={altText} width={50} height={50} />;
      case "cross":
        return <img src={CrossIcon} alt={altText} width={50} height={50} />;
      case "Traded":
        return <img src={Dollar} alt={altText} width={50} height={50} />;
      case "SendForApproval":
        return (
          <img src={SendForApproval} alt={altText} width={50} height={50} />
        );
      case "Resubmit":
        return <img src={Resubmitted} alt={altText} width={50} height={50} />;
      case "Not-Traded":
        return <img src={NotTraded} alt={altText} width={50} height={50} />;
      case "EscaltedOn":
        return <img src={EscaltedOn} alt={altText} width={50} height={50} />;
      case "Decline":
        return <img src={Decline} alt={altText} width={50} height={50} />;
      case "co-Compliant":
        return (
          <img src={circlecheckblue} alt={altText} width={50} height={50} />
        );
      case "co-Non-Compliant":
        return <img src={CrossIcon} alt={altText} width={50} height={50} />;
      case "co-Transaction Conducted":
        return <img src={Dollar} alt={altText} width={50} height={50} />;

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
            // react-form-stepper's own default circle shows the step's
            // plain numeric index (e.g. "4") unless something is passed
            // as children to override it - circleFontSize: "0px" above
            // was meant to hide that number but doesn't reliably suppress
            // it, so a stray step number was showing through behind the
            // custom icon (which is only overlaid via the stepCircle
            // div's negative margin inside `label`, not an actual circle
            // override). ViewDetailModal.jsx already does this correctly
            // elsewhere in the app - passing children here the same way,
            // as an empty placeholder, is enough to make the library skip
            // its own numbered circle without touching the existing
            // icon-in-label overlay/CSS.
            children={<span />}
            label={
              <div className={styles.customLabel}>
                <div className={styles.stepCircle}>
                  {getIcon(step.iconType, step.status)}
                </div>

                {/* 🔹 Top line: status + "by" + user */}
                <div className={styles.stepTitle}>
                  {step.status}{" "}
                  {step.user && (
                    <>
                      {"by"}
                      <Tooltip title={step.user}>
                        <span className={styles.stepTileStrongText}>
                          {step.user}
                        </span>
                      </Tooltip>
                    </>
                  )}
                </div>

                {/* 🔹 Bottom line: date only */}
                <div className={styles.stepDesc}>{step.date}</div>
                {/* Tracking ID (previous/next REQ in a resubmit chain) —
                driven by requesterID being set at all, not an exact
                status-text match, since callers now use wording like
                "Resubmit for Approval" as well as plain "Resubmit" */}
                {step.requesterID && (
                  <div className={styles.stepDesc}>
                    <strong>{step.requesterID}</strong>
                  </div>
                )}
              </div>
            }
          />
        ))}
      </Stepper>
    </div>
  );
};

export default ApprovalStepper;
