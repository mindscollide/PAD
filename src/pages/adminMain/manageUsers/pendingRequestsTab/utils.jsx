import { toYYMMDD } from "../../../../common/funtions/rejex";

export const buildApiRequest = (searchState = {}) => ({
  EmployeeName: searchState.employeeName,
  EmployeeID:
    searchState.employeeID !== "" && searchState.employeeID !== 0
      ? searchState.employeeID
      : "",
  EmailAddress: searchState.emailAddress,
  DepartmentName: searchState.departmentName,
  StartDate: searchState.startDate ? toYYMMDD(searchState.startDate) : "",
  EndDate: searchState.endDate ? toYYMMDD(searchState.endDate) : "",
  PageNumber: Number(searchState.pageNumber) || 0,
  Length: Number(searchState.pageSize) || 10,
});
