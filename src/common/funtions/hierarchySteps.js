import CheckIcon from "../../assets/img/Check.png";
import CrossIcon from "../../assets/img/Cross.png";
import EllipsesIcon from "../../assets/img/Ellipses.png";
import EscaltedOn from "../../assets/img/EscaltedOn.png";
import { formatApiDateTime } from "./rejex";

const ICON_BY_TYPE = {
  Escalated: EscaltedOn,
  Compliant: CheckIcon,
  NonCompliant: CrossIcon,
  Pending: EllipsesIcon,
};

/**
 * Maps the backend's ready-made `hierarchySteps[]`
 * (API_Changes/2026-11-13_co_reconcile_view_details_escalation_and_marked_compliant_by.md)
 * into stepper items. Titles are final from the backend ("Escalated on You",
 * "Marked Compliant by Ali Mamdani", "Awaiting for action by ..."); date/time
 * are a UTC yyyyMMdd + HHmmss pair (null for a pending step).
 *
 * @param {Array} hierarchySteps - [{stepType, iconType, title, userID, userName, date, time}]
 * @returns {Array} [{key, iconSrc, title, dateTime, isResolved}]
 */
export const mapHierarchySteps = (hierarchySteps = []) =>
  (Array.isArray(hierarchySteps) ? hierarchySteps : []).map((step, index) => ({
    key: `${index}-${step?.stepType || "step"}`,
    iconSrc: ICON_BY_TYPE[step?.iconType] || EllipsesIcon,
    title: step?.title || "",
    dateTime:
      step?.date && step?.time
        ? formatApiDateTime(`${step.date} ${step.time}`)
        : "",
    isResolved:
      step?.iconType === "Compliant" || step?.iconType === "NonCompliant",
  }));
