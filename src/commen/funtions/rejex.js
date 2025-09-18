// allow only number

export const allowOnlyNumbers = (value) => {
  // Handle null, undefined, NaN, empty string
  if (value === null || value === undefined || value === "" || isNaN(value)) {
    return false;
  }

  // Convert value to string and test against digits-only regex
  return /^\d+$/.test(String(value));
};

// Comma Separator for numbers
export const formatNumberWithCommas = (value) => {
  if (value === null || value === undefined || value === "") return 0;
  // Convert to string and remove any non-digit chars (like commas)
  const strValue = String(value).replace(/\D/g, "");
  // Add commas without converting to Number
  return strValue.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// Here's a simple function that takes a number or numeric string,
// and if it’s a single digit (0–9),
// it prepends a 0 to it — otherwise it returns the original number or string as-is:
export function convertSingleDigittoDoubble(value) {
  const num = parseInt(value, 10); // Convert to number safely
  if (!isNaN(num) && num >= 0 && num < 10) {
    return `0${num}`;
  }
  return String(value);
}

// not allow first letter as space
export const removeFirstSpace = (value) => {
  if (typeof value !== "string") return value;
  return value.charAt(0) === " " ? value.slice(1) : value;
};

//Global Date Time Formatter

// utils/dateFormatter.js
/**
 * Convert API UTC datetime string (YYYYMMDD HHmm) to local formatted datetime.
 *
 * @param {string} apiDateTime - API datetime string in UTC (e.g. "20250917 1530")
 * @returns {string} Localized formatted datetime string
 */
export function formatApiDateTime(apiDateTime) {
  if (!apiDateTime || typeof apiDateTime !== "string") return "";

  const [datePart, timePart] = apiDateTime.trim().split(" ");
  if (!datePart || !timePart) return apiDateTime;

  // Parse UTC parts
  const year = parseInt(datePart.slice(0, 4), 10);
  const month = parseInt(datePart.slice(4, 6), 10) - 1;
  const day = parseInt(datePart.slice(6, 8), 10);

  const hours = parseInt(timePart.slice(0, 2), 10);
  const minutes = parseInt(timePart.slice(2, 4), 10);

  // Build UTC date
  const utcDate = new Date(Date.UTC(year, month, day, hours, minutes));

  // Convert to local date
  const localDate = new Date(utcDate);

  // Extract local components
  const localYear = localDate.getFullYear();
  const localMonth = String(localDate.getMonth() + 1).padStart(2, "0");
  const localDay = String(localDate.getDate()).padStart(2, "0");

  let localHours = localDate.getHours();
  const localMinutes = String(localDate.getMinutes()).padStart(2, "0");
  const ampm = localHours >= 12 ? "pm" : "am";

  localHours = localHours % 12 || 12; // 0 -> 12 for 12-hour clock
  const formattedTime = `${String(localHours).padStart(2, "0")}:${localMinutes} ${ampm}`;

  return `${localYear}-${localMonth}-${localDay} | ${formattedTime}`;
}

// this is the formator to convert any type of date to formate into this
// Universal UTC → YYMMDD Formatter
export const toYYMMDD = (input) => {
  // Handle empty, null, undefined
  if (!input) return "";

  // Create Date object
  const date = new Date(input);

  // Validate
  if (isNaN(date)) throw new Error(`Invalid date format: ${input}`);

  // Format in UTC
  const year = String(date.getUTCFullYear()); // YYYY
  const month = String(date.getUTCMonth() + 1).padStart(2, "0"); // MM
  const day = String(date.getUTCDate()).padStart(2, "0"); // DD

  return `${year}${month}${day}`;
};

// this regex work as a dash seperator befor REQ009 after regex REQ-009
export const dashBetweenApprovalAssets = (id) => {
  if (!id) return "";

  const prefix = id.substring(0, 3);
  const number = id.substring(3);

  // If you want to always keep it padded to 3 digits (REQ-009)
  const padded = number.padStart(3, "0");

  return `${prefix}-${padded}`;
};

// Show only Date not the time
// Extracts time part (HHmmss) from API datetime string like "20250822 101103"
export const formatShowOnlyDate = (dateTimeStr) => {
  if (!dateTimeStr) return "";

  // The API format looks like: YYYYMMDD HHMMSS (e.g., 20250822 101103)
  const datePart = dateTimeStr.split(" ")[0]; // "20250822"

  if (datePart && datePart.length === 8) {
    const year = datePart.slice(0, 4);
    const month = datePart.slice(4, 6);
    const day = datePart.slice(6, 8);
    return `${year}-${month}-${day}`;
  }

  return "";
};

export const formatShowOnlyDateForDateRange = (date) => {
  if (!date) return "";

  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const formatCode = (code = "") => {
  return code.replace(/^([A-Za-z]+)(\d+)$/, "$1-$2");
};
