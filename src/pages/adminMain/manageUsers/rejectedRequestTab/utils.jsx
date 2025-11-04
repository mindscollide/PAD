export const buildApiRequest = (searchState = {}) => ({
  EmployeeName:searchState.employeeName,
  EmailAddress: searchState.emailAddress,
  DepartmentName: searchState.departmentName,
  PageNumber: Number(searchState.pageNumber) || 0,
  Length: Number(searchState.pageSize) || 10,
});