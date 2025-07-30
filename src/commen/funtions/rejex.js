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