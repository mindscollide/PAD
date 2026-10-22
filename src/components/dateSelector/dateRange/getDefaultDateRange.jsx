import dayjs from "dayjs";

const FORMAT = "YYYY-MM-DD";

export const getDefaultDateRange = (monthsBack = 6) => {
  const end = dayjs();
  return [end.subtract(monthsBack, "month").format(FORMAT), end.format(FORMAT)];
};
