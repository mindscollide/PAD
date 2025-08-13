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
  // Ensure it's a number or numeric string
  const num = Number(value);
  if (isNaN(num)) return value; // return original if not a number
  return num.toLocaleString("en-US");
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
export function formatApiDateTime(apiDateTime) {
  if (!apiDateTime || typeof apiDateTime !== "string") return "";

  // Split into date and time parts
  const [datePart, timePart] = apiDateTime.trim().split(" ");
  if (!datePart || !timePart) return apiDateTime; // fallback if unexpected format

  // Extract date components
  const year = datePart.slice(0, 4);
  const month = datePart.slice(4, 6);
  const day = datePart.slice(6, 8);

  // Extract time components
  let hours = parseInt(timePart.slice(0, 2), 10);
  const minutes = timePart.slice(2, 4);

  // Determine AM/PM
  const ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12 || 12; // convert 0 -> 12 for 12-hour clock

  return `${year}-${month}-${day} | ${hours
    .toString()
    .padStart(2, "0")}:${minutes} ${ampm}`;
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
  const year = String(date.getUTCFullYear()).slice(-2); // YY
  const month = String(date.getUTCMonth() + 1).padStart(2, "0"); // MM
  const day = String(date.getUTCDate()).padStart(2, "0"); // DD

  return `${year}${month}${day}`;
};