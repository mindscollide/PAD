// Display format for policy codes: BE sends "PL_00000001" (PL_ + key padded
// to 8 digits); screens show "PL_00_000001". Defensive: returns the input
// untouched when it has no trailing digits (e.g. an old-style "POL001").
export const convertCode = (code) => {
  if (!code) return code;
  const m = String(code).match(/(\d+)$/); // trailing digits = the policy key
  if (!m) return code;
  const n = m[1].padStart(8, "0");
  return `PL_${n.slice(0, 2)}_${n.slice(2)}`; // PL_00_000001
};
