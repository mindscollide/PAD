export const parseComments = (value) => {
  if (!value) return [];

  // already array
  if (Array.isArray(value)) {
    return value
      .filter(Boolean)
      .map((item) =>
        typeof item === "object"
          ? `${item.name ? `${item.comments ?? ""} - ${item.name}` : ""}`.trim()
          : String(item)
      )
      .filter((item) => item.length > 0);
  }

  // convert to string
  let text = String(value);

  // handle:
  // comma separated
  // line break separated
  // mixed
  return text
    .split(/,|\n|\r\n/) // <-- magic (comma OR new line)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
};
