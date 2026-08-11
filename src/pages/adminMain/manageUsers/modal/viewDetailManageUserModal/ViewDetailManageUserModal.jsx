// import React, { useState } from "react";
// import { Col, Row, Tag, Select } from "antd";

// // 🔹 Components & Contexts
// import { GlobalModal } from "../../../../../components";
// import { useGlobalModal } from "../../../../../context/GlobalModalContext";

// // 🔹 Utils & APIs
// import Profile2 from "../../../../../assets/img/Profile2.png";
// import EditIcon from "../../../../../assets/img/EditIcon.png";

// // 🔹 Styles
// import styles from "./ViewDetailManageUserModal.module.css";
// import CustomButton from "../../../../../components/buttons/button";
// import { useMyAdmin } from "../../../../../context/AdminContext";
// import {
//   formatApiDateTime,
//   formatShowOnlyDate,
// } from "../../../../../common/funtions/rejex";
// import {
//   GetComplianceOfficerOnViewDetailUserTabRequest,
//   GetLineManagerOnViewDetailUserTabRequest,
//   GetViewDetailsUserRoleAndPoliciesRequests,
//   UpdateEmployeeManagerManageUserTab,
// } from "../../../../../api/adminApi";
// import { useNavigate } from "react-router-dom";
// import { useNotification } from "../../../../../components/NotificationProvider/NotificationProvider";
// import { useGlobalLoader } from "../../../../../context/LoaderContext";
// import { useApi } from "../../../../../context/ApiContext";

// const ViewDetailManageUserModal = () => {
//   const navigate = useNavigate();

//   // 🔷 Context Hooks
//   const { showNotification } = useNotification();
//   const { showLoader } = useGlobalLoader();
//   const { callApi } = useApi();
//   const {
//     viewDetailManageUser,
//     setViewDetailManageUser,
//     setRolesAndPoliciesManageUser,
//   } = useGlobalModal();

//   // 🔹  Context State of View Detail Modal in which All data store
//   const {
//     manageUsersViewDetailModalData,
//     lineManagerViewDetailDropdownData,
//     setLineManagerViewDetailDropdownData,
//     complianceOfficerViewDetailDropdownData,
//     setComplianceOfficerViewDetailDropdownData,
//     setRoleAndPolicyViewDetailData,
//   } = useMyAdmin();

//   //🔹 Separate edit flags for each role section and Local States
//   const [isLineManagerEditOpen, setIsLineManagerEditOpen] = useState(false);
//   const [isComplianceOfficerEditOpen, setIsComplianceOfficerEditOpen] =
//     useState(false);
//   //🔹 For selected Manager User Id From LM
//   const [selectedLineManagerID, setSelectedLineManagerID] = useState(null);
//   //🔹 For selected Manager User Id From Compliance Offier
//   const [selectedComplianceOfficerID, setSelectedComplianceOfficerID] =
//     useState(null);

//   /** 🔹 on Click On Edit Button In LineManager Dropdown in view detail modal of manage User users Tab*/
//   const onClickOfEditButtonLineMangerDropdown = async () => {
//     showLoader(true);
//     let res = await GetLineManagerOnViewDetailUserTabRequest({
//       callApi,
//       showNotification,
//       showLoader,
//       navigate,
//     });

//     if (res) {
//       setLineManagerViewDetailDropdownData(res);
//     }
//   };

//   /** 🔹 on Click On Edit Button In ComplianceOfficer Dropdown in view detail modal of manage User users Tab*/
//   const onClickOfEditButtonComplianceOfficerDropdown = async () => {
//     showLoader(true);
//     let res = await GetComplianceOfficerOnViewDetailUserTabRequest({
//       callApi,
//       showNotification,
//       showLoader,
//       navigate,
//     });

//     if (res) {
//       setComplianceOfficerViewDetailDropdownData(res);
//     }
//   };

//   /** 🔹 on Click Role And Policies API Hit to get User Details Data in view detail modal of manage User users Tab*/
//   const onClickRoleAndPolicy = async () => {
//     showLoader(true);
//     let payload = {
//       UserID: manageUsersViewDetailModalData?.userAssignedRoles[0]?.employeeID,
//     };

//     console.log(payload, "CheckDataDaatat");

//     let res = await GetViewDetailsUserRoleAndPoliciesRequests({
//       callApi,
//       showNotification,
//       showLoader,
//       requestdata: payload,
//       setViewDetailManageUser,
//       setRolesAndPoliciesManageUser,
//       navigate,
//     });

//     if (res) {
//       setRoleAndPolicyViewDetailData(res);
//     }
//   };

//   // You might want Save handlers here, I just simulate closing edit mode
//   const saveLineManager = async () => {
//     showLoader(true);
//     let payload = {
//       EmployeeID: manageUsersViewDetailModalData?.userDetails?.employeeID,
//       EntityTypeID: 1, // for line manager 1 for compliance officer 2
//       ManagerID: selectedLineManagerID,
//     };
//     await UpdateEmployeeManagerManageUserTab({
//       callApi,
//       showNotification,
//       requestdata: payload,
//       showLoader,
//       navigate,
//     });
//     setIsLineManagerEditOpen(false);
//   };

//   const saveComplianceOfficer = async () => {
//     showLoader(true);
//     let payload = {
//       EmployeeID: manageUsersViewDetailModalData?.userDetails?.employeeID,
//       EntityTypeID: 2, // for line manager 1 for compliance officer 2
//       ManagerID: selectedComplianceOfficerID,
//     };
//     await UpdateEmployeeManagerManageUserTab({
//       callApi,
//       showNotification,
//       requestdata: payload,
//       showLoader,
//       navigate,
//     });
//     setIsComplianceOfficerEditOpen(false);
//   };

//   // When There is no data
//   const safeValue = (value, fallback) =>
//     value && value.toString().trim() !== "" ? value : fallback;

//   //Check if Employeeid having roleId 2
//   const hasRoleId2 = manageUsersViewDetailModalData?.userAssignedRoles?.some(
//     (role) => role.roleID === 2
//   );

//   // -----------------------
//   // 🔹 Render
//   // -----------------------
//   return (
//     <GlobalModal
//       visible={viewDetailManageUser}
//       width="1428px"
//       centered
//       modalHeader={null}
//       onCancel={() => setViewDetailManageUser(false)}
//       modalBody={
//         <div
//           className={
//             hasRoleId2
//               ? styles.modalBodyWrapper
//               : styles.modalBodyWrapperRoleId2
//           }
//         >
//           {/* Status Header */}
//           <Row>
//             <Col span={24}>
//               <h5 className={styles.viewManageUserDetailHeading}>
//                 View Details
//               </h5>
//             </Col>
//           </Row>

//           <Row gutter={[4, 4]}>
//             <Col span={8}>
//               <div className={styles.backgroundColorOfInstrumentDetailApproved}>
//                 <img
//                   src={Profile2}
//                   height={54}
//                   width={54}
//                   className={styles.profileImg}
//                 />
//                 <div className={styles.nameContainer}>
//                   <label className={styles.viewDetailMainLabels}>
//                     Full Name
//                   </label>
//                   <label className={styles.viewDetailSubLabels}>
//                     {safeValue(
//                       manageUsersViewDetailModalData?.userDetails?.fullName,
//                       "No Full Name"
//                     )}
//                   </label>
//                 </div>
//               </div>
//             </Col>
//             <Col span={8}>
//               <div className={styles.backgrounColorOfApprovedDetail}>
//                 <label className={styles.viewDetailMainLabels}>
//                   Employee ID
//                 </label>
//                 <label className={styles.viewDetailSubLabels}>
//                   {safeValue(
//                     manageUsersViewDetailModalData?.userDetails?.employeeID,
//                     "No Employee ID"
//                   )}
//                 </label>
//               </div>
//             </Col>
//             <Col span={8}>
//               <div className={styles.backgrounColorOfApprovedDetail}>
//                 <label className={styles.viewDetailMainLabels}>Status</label>
//                 <label className={styles.viewDetailSubLabels}>
//                   {manageUsersViewDetailModalData?.userDetails?.userStatus === 1
//                     ? "Active"
//                     : manageUsersViewDetailModalData?.userDetails
//                         ?.userStatus === 2
//                     ? "Disabled"
//                     : manageUsersViewDetailModalData?.userDetails
//                         ?.userStatus === 3
//                     ? "Closed"
//                     : manageUsersViewDetailModalData?.userDetails
//                         ?.userStatus === 4
//                     ? "Dormant"
//                     : manageUsersViewDetailModalData?.userDetails
//                         ?.userStatus === 5
//                     ? "Registration request pending"
//                     : manageUsersViewDetailModalData?.userDetails
//                         ?.userStatus === 6
//                     ? "Registration request accepted"
//                     : manageUsersViewDetailModalData?.userDetails
//                         ?.userStatus === 7
//                     ? "Registration request rejected"
//                     : "NonActive"}
//                 </label>
//               </div>
//             </Col>
//           </Row>

//           <Row gutter={[4, 4]} style={{ marginTop: "3px" }}>
//             <Col span={8}>
//               <div className={styles.backgrounColorOfApprovedDetail}>
//                 <label className={styles.viewDetailMainLabels}>
//                   Department
//                 </label>
//                 <label className={styles.viewDetailSubLabels}>
//                   {" "}
//                   {safeValue(
//                     manageUsersViewDetailModalData?.userDetails?.departmentName,
//                     "No Department Name"
//                   )}
//                 </label>
//               </div>
//             </Col>
//             <Col span={8}>
//               <div className={styles.backgrounColorOfApprovedDetail}>
//                 <label className={styles.viewDetailMainLabels}>Email</label>
//                 <label className={styles.viewDetailSubLabels}>
//                   {safeValue(
//                     manageUsersViewDetailModalData?.userDetails?.emailAddress,
//                     "No Email Address"
//                   )}
//                 </label>
//               </div>
//             </Col>
//             <Col span={8}>
//               <div className={styles.backgrounColorOfApprovedDetail}>
//                 <label className={styles.viewDetailMainLabels}>
//                   Member Since
//                 </label>
//                 <label className={styles.viewDetailSubLabels}>
//                   {safeValue(
//                     formatShowOnlyDate(
//                       manageUsersViewDetailModalData?.userDetails
//                         ?.memberSinceDate
//                     ),
//                     "No Member Since Date"
//                   )}
//                 </label>
//               </div>
//             </Col>
//           </Row>

//           <Row gutter={[4, 4]} style={{ marginTop: "3px" }}>
//             <Col span={8}>
//               <div className={styles.backgrounColorOfApprovedDetail}>
//                 <label className={styles.viewDetailMainLabels}>
//                   Last Loging
//                 </label>
//                 <label className={styles.viewDetailSubLabels}>
//                   {safeValue(
//                     formatApiDateTime(
//                       `${
//                         manageUsersViewDetailModalData?.userDetails
//                           ?.lastLoginDate || ""
//                       } ${
//                         manageUsersViewDetailModalData?.userDetails
//                           ?.lastLoginTime || ""
//                       }`
//                     ),
//                     "No Last Login"
//                   )}
//                 </label>
//               </div>
//             </Col>
//             <Col span={16}>
//               <div className={styles.backgrounColorOfApprovedDetail}>
//                 <label className={styles.viewDetailMainLabels}>
//                   Assigned Policy Group:
//                 </label>
//                 <label className={styles.viewDetailSubLabels}>
//                   {safeValue(
//                     manageUsersViewDetailModalData?.userDetails
//                       ?.assignedGroupPolicies,
//                     "No Policy Group Assigned"
//                   )}
//                 </label>
//               </div>
//             </Col>
//           </Row>

//           <Row gutter={[4, 4]} style={{ marginTop: "3px" }}>
//             <Col span={24}>
//               <div className={styles.backgrounColorOfBrokerDetail}>
//                 <label className={styles.viewDetailMainLabels}>Roles</label>
//                 <div className={styles.tagContainer}>
//                   {manageUsersViewDetailModalData?.userAssignedRoles?.length >
//                   0 ? (
//                     manageUsersViewDetailModalData?.userAssignedRoles?.map(
//                       (role, index) => (
//                         <Tag key={index} className={styles.tagClasses}>
//                           {role.roleName}
//                         </Tag>
//                       )
//                     )
//                   ) : (
//                     <span>No roles assigned</span>
//                   )}
//                 </div>
//               </div>
//             </Col>
//           </Row>

//           {hasRoleId2 && (
//             <>
//               <Row gutter={[16, 16]}>
//                 {/* 🔹 Line Manager Card */}
//                 {(isLineManagerEditOpen || !isComplianceOfficerEditOpen) && (
//                   <Col span={isLineManagerEditOpen ? 24 : 12}>
//                     <div className={styles.complianceCard}>
//                       <h4 className={styles.cardTitle}>Line Manager</h4>

//                       {isLineManagerEditOpen ? (
//                         // Edit Mode Dropdown
//                         <div className={styles.editMainDiv}>
//                           <label className={styles.instrumentLabel}>
//                             Name:
//                           </label>
//                           <Select
//                             allowClear
//                             showSearch
//                             optionFilterProp="label"
//                             optionLabelProp="label"
//                             className={styles.SelectDropdownClass}
//                             placeholder="Select a Line Manager"
//                             onChange={(value) => {
//                               setSelectedLineManagerID(value);
//                             }}
//                           >
//                             {lineManagerViewDetailDropdownData?.lineManagers?.map(
//                               (manager) => (
//                                 <Select.Option
//                                   key={manager.userID}
//                                   value={manager.userID}
//                                   label={`${manager.firstName} ${manager.lastName}`}
//                                 >
//                                   <Row>
//                                     <Col span={12}>
//                                       <div>
//                                         <div
//                                           className={styles.selectFullNameText}
//                                         >
//                                           {manager.firstName} {manager.lastName}
//                                         </div>
//                                         <div className={styles.selectEmailText}>
//                                           {manager.emailAddress || "N/A"}
//                                         </div>
//                                       </div>
//                                     </Col>
//                                     <Col
//                                       span={12}
//                                       style={{ textAlign: "right" }}
//                                     >
//                                       <div
//                                         className={styles.selectFullNameText}
//                                       >
//                                         {manager.userID}
//                                       </div>
//                                       <div className={styles.selectEmailText}>
//                                         {manageUsersViewDetailModalData
//                                           ?.userDetails?.departmentName ||
//                                           "N/A"}
//                                       </div>
//                                     </Col>
//                                   </Row>
//                                 </Select.Option>
//                               )
//                             )}
//                           </Select>

//                           <div className={styles.mainButtonDivClose}>
//                             <CustomButton
//                               text="Cancel"
//                               className="big-light-button"
//                               onClick={() => setIsLineManagerEditOpen(false)}
//                             />
//                             <CustomButton
//                               text="Save"
//                               onClick={saveLineManager}
//                               className="big-dark-button"
//                             />
//                           </div>
//                         </div>
//                       ) : (
//                         // Display Mode Card
//                         <div className={styles.LMcardContent}>
//                           {manageUsersViewDetailModalData?.userHierarchy?.find(
//                             (manager) => manager.roleID === 3
//                           ) ? (
//                             (() => {
//                               const LM =
//                                 manageUsersViewDetailModalData.userHierarchy.find(
//                                   (manager) => manager.roleID === 3
//                                 );
//                               return (
//                                 <Row gutter={16} align="middle">
//                                   <Col span={12}>
//                                     <div className={styles.infoBlock}>
//                                       <label className={styles.infoLabel}>
//                                         Name: {LM.managerName || "N/A"}
//                                       </label>
//                                       <div className={styles.infoSubLabel}>
//                                         Email: {LM.managerEmail || "N/A"}
//                                       </div>
//                                     </div>
//                                   </Col>

//                                   <Col span={11}>
//                                     <div className={styles.infoBlock}>
//                                       <label className={styles.infoLabel}>
//                                         ID: {LM.managerID || "N/A"}
//                                       </label>
//                                       <div className={styles.infoSubLabel}>
//                                         Department:{" "}
//                                         {manageUsersViewDetailModalData
//                                           ?.userDetails?.departmentName ||
//                                           "N/A"}
//                                       </div>
//                                     </div>
//                                   </Col>

//                                   <Col span={1} className={styles.iconCol}>
//                                     <img
//                                       src={EditIcon}
//                                       onClick={() => {
//                                         onClickOfEditButtonLineMangerDropdown();
//                                         setIsLineManagerEditOpen(true);
//                                       }}
//                                       alt="Edit"
//                                     />
//                                   </Col>
//                                 </Row>
//                               );
//                             })()
//                           ) : (
//                             <div className={styles.noDataText}>
//                               No Line Manager Assigned
//                             </div>
//                           )}
//                         </div>
//                       )}
//                     </div>
//                   </Col>
//                 )}

//                 {/* 🔹 Compliance Officer Card */}
//                 {(isComplianceOfficerEditOpen || !isLineManagerEditOpen) && (
//                   <Col span={isComplianceOfficerEditOpen ? 24 : 12}>
//                     <div className={styles.complianceCard}>
//                       <h4 className={styles.cardTitle}>Compliance Officer</h4>

//                       {isComplianceOfficerEditOpen ? (
//                         // Edit Mode Dropdown
//                         <div className={styles.editMainDiv}>
//                           <label className={styles.instrumentLabel}>
//                             Name:
//                           </label>
//                           <Select
//                             showSearch
//                             allowClear
//                             optionFilterProp="label"
//                             optionLabelProp="label"
//                             className={styles.SelectDropdownClass}
//                             placeholder="Select a Compliance Officer"
//                             onChange={(value) =>
//                               setSelectedComplianceOfficerID(value)
//                             }
//                           >
//                             {complianceOfficerViewDetailDropdownData?.lineManagers?.map(
//                               (officer) => (
//                                 <Select.Option
//                                   key={officer.userID}
//                                   value={officer.userID}
//                                   label={`${officer.firstName} ${officer.lastName}`}
//                                 >
//                                   <Row>
//                                     <Col span={12}>
//                                       <div>
//                                         <div
//                                           className={styles.selectFullNameText}
//                                         >
//                                           {officer.firstName} {officer.lastName}
//                                         </div>
//                                         <div className={styles.selectEmailText}>
//                                           {officer.emailAddress || "N/A"}
//                                         </div>
//                                       </div>
//                                     </Col>
//                                     <Col
//                                       span={12}
//                                       style={{ textAlign: "right" }}
//                                     >
//                                       <div
//                                         className={styles.selectFullNameText}
//                                       >
//                                         {officer.userID}
//                                       </div>
//                                       <div className={styles.selectEmailText}>
//                                         {manageUsersViewDetailModalData
//                                           ?.userDetails?.departmentName ||
//                                           "N/A"}
//                                       </div>
//                                     </Col>
//                                   </Row>
//                                 </Select.Option>
//                               )
//                             )}
//                           </Select>

//                           <div className={styles.mainButtonDivClose}>
//                             <CustomButton
//                               text="Cancel"
//                               className="big-light-button"
//                               onClick={() =>
//                                 setIsComplianceOfficerEditOpen(false)
//                               }
//                             />
//                             <CustomButton
//                               text="Save"
//                               onClick={saveComplianceOfficer}
//                               className="big-dark-button"
//                             />
//                           </div>
//                         </div>
//                       ) : (
//                         // Display Mode Card
//                         <div className={styles.cardContent}>
//                           {manageUsersViewDetailModalData?.userHierarchy?.find(
//                             (manager) => manager.roleID === 4
//                           ) ? (
//                             (() => {
//                               const CO =
//                                 manageUsersViewDetailModalData.userHierarchy.find(
//                                   (manager) => manager.roleID === 4
//                                 );
//                               return (
//                                 <Row gutter={16} align="middle">
//                                   <Col span={12}>
//                                     <div className={styles.infoBlock}>
//                                       <label className={styles.infoLabel}>
//                                         Name: {CO.managerName || "N/A"}
//                                       </label>
//                                       <div className={styles.infoSubLabel}>
//                                         Email: {CO.managerEmail || "N/A"}
//                                       </div>
//                                     </div>
//                                   </Col>

//                                   <Col span={11}>
//                                     <div className={styles.infoBlock}>
//                                       <label className={styles.infoLabel}>
//                                         ID: {CO.managerID || "N/A"}
//                                       </label>
//                                       <div className={styles.infoSubLabel}>
//                                         Department:{" "}
//                                         {manageUsersViewDetailModalData
//                                           ?.userDetails?.departmentName ||
//                                           "N/A"}
//                                       </div>
//                                     </div>
//                                   </Col>

//                                   <Col span={1} className={styles.iconCol}>
//                                     <img
//                                       src={EditIcon}
//                                       onClick={() => {
//                                         onClickOfEditButtonComplianceOfficerDropdown();
//                                         setIsComplianceOfficerEditOpen(true);
//                                       }}
//                                       alt="Edit"
//                                     />
//                                   </Col>
//                                 </Row>
//                               );
//                             })()
//                           ) : (
//                             <div className={styles.noDataText}>
//                               No Compliance Officer Assigned
//                             </div>
//                           )}
//                         </div>
//                       )}
//                     </div>
//                   </Col>
//                 )}
//               </Row>

//               {/* 🔹 Bottom Buttons */}
//               {!isLineManagerEditOpen && !isComplianceOfficerEditOpen && (
//                 <Row>
//                   <Col span={24} className={styles.mainButtonDivClose}>
//                     <CustomButton
//                       text={"Roles & Policies"}
//                       className="big-light-button"
//                       onClick={onClickRoleAndPolicy}
//                     />
//                     <CustomButton
//                       text={"Close"}
//                       className="big-light-button"
//                       onClick={() => setViewDetailManageUser(false)}
//                     />
//                   </Col>
//                 </Row>
//               )}
//             </>
//           )}

//           {!hasRoleId2 && (
//             <Row>
//               <Col span={24} className={styles.mainButtonDivClose}>
//                 <CustomButton
//                   text={"Close"}
//                   className="big-light-button"
//                   onClick={() => setViewDetailManageUser(false)}
//                 />
//               </Col>
//             </Row>
//           )}
//         </div>
//       }
//     />
//   );
// };

// export default ViewDetailManageUserModal;

import React, { useState } from "react";
import { Col, Row, Tag, Select } from "antd";

// 🔹 Components & Contexts
import { GlobalModal } from "../../../../../components";
import { useGlobalModal } from "../../../../../context/GlobalModalContext";

// 🔹 Utils & APIs
import Profile2 from "../../../../../assets/img/Profile2.png";
import EditIcon from "../../../../../assets/img/EditIcon.png";

// 🔹 Styles
import styles from "./ViewDetailManageUserModal.module.css";
import CustomButton from "../../../../../components/buttons/button";
import { useMyAdmin } from "../../../../../context/AdminContext";
import {
  formatApiDateTime,
  formatShowOnlyDateForDateRange,
} from "../../../../../common/funtions/rejex";
import {
  GetComplianceOfficerOnViewDetailUserTabRequest,
  GetLineManagerOnViewDetailUserTabRequest,
  GetViewDetailsUserRoleAndPoliciesRequests,
  UpdateEmployeeManagerManageUserTab,
  ViewDetailManageUserUserTabRequest,
} from "../../../../../api/adminApi";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../../../../../components/NotificationProvider/NotificationProvider";
import { useGlobalLoader } from "../../../../../context/LoaderContext";
import { useApi } from "../../../../../context/ApiContext";

const ViewDetailManageUserModal = () => {
  const navigate = useNavigate();

  // 🔷 Context Hooks
  const { showNotification } = useNotification();
  const { showLoader } = useGlobalLoader();
  const { callApi } = useApi();
  const {
    viewDetailManageUser,
    setViewDetailManageUser,
    setRolesAndPoliciesManageUser,
  } = useGlobalModal();

  // 🔹  Context State of View Detail Modal in which All data store
  const {
    manageUsersViewDetailModalData,
    lineManagerViewDetailDropdownData,
    setLineManagerViewDetailDropdownData,
    complianceOfficerViewDetailDropdownData,
    setComplianceOfficerViewDetailDropdownData,
    setRoleAndPolicyViewDetailData,
    setManageUsersViewDetailModalData,
  } = useMyAdmin();

  //🔹 Separate edit flags for each role section and Local States
  const [isLineManagerEditOpen, setIsLineManagerEditOpen] = useState(false);
  const [isComplianceOfficerEditOpen, setIsComplianceOfficerEditOpen] =
    useState(false);
  //🔹 For selected Manager User Id From LM — shape: { value, label } (labelInValue)
  const [selectedLineManagerID, setSelectedLineManagerID] = useState(null);
  //🔹 For selected Manager User Id From Compliance Officer — shape: { value, label } (labelInValue)
  const [selectedComplianceOfficerID, setSelectedComplianceOfficerID] =
    useState(null);

  /** 🔹 on Click On Edit Button In LineManager Dropdown in view detail modal of manage User users Tab*/
  const onClickOfEditButtonLineMangerDropdown = async () => {
    showLoader(true);
    let res = await GetLineManagerOnViewDetailUserTabRequest({
      callApi,
      showNotification,
      showLoader,
      navigate,
    });

    if (res) {
      setLineManagerViewDetailDropdownData(res);

      // 🔹 Pre-select the currently assigned Line Manager once the dropdown list is available
      const currentLM = manageUsersViewDetailModalData?.userHierarchy?.find(
        (manager) => manager.roleID === 3
      );

      if (currentLM) {
        const matchedManager = res?.lineManagers?.find(
          (manager) => manager.userID === currentLM.managerID
        );

        if (matchedManager) {
          setSelectedLineManagerID({
            value: matchedManager.userID,
            label: `${matchedManager.firstName} ${matchedManager.lastName}`,
          });
        } else {
          // Current LM wasn't returned by the dropdown API (e.g. disabled/removed) —
          // fall back to the name we already have from the hierarchy data
          setSelectedLineManagerID({
            value: currentLM.managerID,
            label: currentLM.managerName,
          });
        }
      }
    }
  };

  /** 🔹 on Click On Edit Button In ComplianceOfficer Dropdown in view detail modal of manage User users Tab*/
  const onClickOfEditButtonComplianceOfficerDropdown = async () => {
    showLoader(true);
    let res = await GetComplianceOfficerOnViewDetailUserTabRequest({
      callApi,
      showNotification,
      showLoader,
      navigate,
    });

    if (res) {
      setComplianceOfficerViewDetailDropdownData(res);

      // 🔹 Pre-select the currently assigned Compliance Officer once the dropdown list is available
      const currentCO = manageUsersViewDetailModalData?.userHierarchy?.find(
        (manager) => manager.roleID === 4
      );

      if (currentCO) {
        const matchedOfficer = res?.lineManagers?.find(
          (officer) => officer.userID === currentCO.managerID
        );

        if (matchedOfficer) {
          setSelectedComplianceOfficerID({
            value: matchedOfficer.userID,
            label: `${matchedOfficer.firstName} ${matchedOfficer.lastName}`,
          });
        } else {
          // Current CO wasn't returned by GetAllComplianceOfficer (e.g. disabled/removed) —
          // fall back to the name we already have from the hierarchy data
          setSelectedComplianceOfficerID({
            value: currentCO.managerID,
            label: currentCO.managerName,
          });
        }
      }
    }
  };

  /** 🔹 on Click Role And Policies API Hit to get User Details Data in view detail modal of manage User users Tab*/
  const onClickRoleAndPolicy = async () => {
    showLoader(true);
    let payload = {
      UserID: manageUsersViewDetailModalData?.userAssignedRoles[0]?.employeeID,
    };

    console.log(payload, "CheckDataDaatat");

    let res = await GetViewDetailsUserRoleAndPoliciesRequests({
      callApi,
      showNotification,
      showLoader,
      requestdata: payload,
      setViewDetailManageUser,
      setRolesAndPoliciesManageUser,
      navigate,
    });

    if (res) {
      setRoleAndPolicyViewDetailData(res);
    }
  };
  const getUpdatedUserDetails = async () => {
    showLoader(true);
    const payload = {
      EmployeeID: manageUsersViewDetailModalData?.userDetails?.employeeID,
    };

    let res = await ViewDetailManageUserUserTabRequest({
      callApi,
      showNotification,
      showLoader,
      requestdata: payload,
      navigate,
    });

    if (res) {
      setManageUsersViewDetailModalData(res);
    }
  };

  // You might want Save handlers here, I just simulate closing edit mode
  const saveLineManager = async () => {
    showLoader(true);
    let payload = {
      EmployeeID: manageUsersViewDetailModalData?.userDetails?.employeeID,
      EntityTypeID: 1, // for line manager 1 for compliance officer 2
      ManagerID: selectedLineManagerID?.value,
    };
    await UpdateEmployeeManagerManageUserTab({
      callApi,
      showNotification,
      requestdata: payload,
      showLoader,
      navigate,
    });

    getUpdatedUserDetails();
    setIsLineManagerEditOpen(false);
  };

  const saveComplianceOfficer = async () => {
    showLoader(true);
    let payload = {
      EmployeeID: manageUsersViewDetailModalData?.userDetails?.employeeID,
      EntityTypeID: 2, // for line manager 1 for compliance officer 2
      ManagerID: selectedComplianceOfficerID?.value,
    };
    await UpdateEmployeeManagerManageUserTab({
      callApi,
      showNotification,
      requestdata: payload,
      showLoader,
      navigate,
    });
    getUpdatedUserDetails();
    setIsComplianceOfficerEditOpen(false);
  };

  // When There is no data
  const safeValue = (value, fallback) =>
    value && value.toString().trim() !== "" ? value : fallback;

  //Check if Employeeid having roleId 2
  const hasRoleId2 = manageUsersViewDetailModalData?.userAssignedRoles?.some(
    (role) => role.roleID === 2
  );

  // -----------------------
  // 🔹 Render
  // -----------------------
  return (
    <GlobalModal
      visible={viewDetailManageUser}
      width="1428px"
      centered
      modalHeader={null}
      onCancel={() => setViewDetailManageUser(false)}
      modalBody={
        <div
          className={
            hasRoleId2
              ? styles.modalBodyWrapper
              : styles.modalBodyWrapperRoleId2
          }
        >
          {/* Status Header */}
          <Row>
            <Col span={24}>
              <h5 className={styles.viewManageUserDetailHeading}>
                View Details
              </h5>
            </Col>
          </Row>

          <Row gutter={[4, 4]}>
            <Col span={8}>
              <div className={styles.backgroundColorOfInstrumentDetailApproved}>
                <img
                  src={Profile2}
                  height={54}
                  width={54}
                  className={styles.profileImg}
                />
                <div className={styles.nameContainer}>
                  <label className={styles.viewDetailMainLabels}>
                    Full Name
                  </label>
                  <label className={styles.viewDetailSubLabels}>
                    {safeValue(
                      manageUsersViewDetailModalData?.userDetails?.fullName,
                      "No Full Name"
                    )}
                  </label>
                </div>
              </div>
            </Col>
            <Col span={8}>
              <div className={styles.backgrounColorOfApprovedDetail}>
                <label className={styles.viewDetailMainLabels}>
                  Employee ID
                </label>
                <label className={styles.viewDetailSubLabels}>
                  {safeValue(
                    manageUsersViewDetailModalData?.userDetails?.employeeID,
                    "No Employee ID"
                  )}
                </label>
              </div>
            </Col>
            <Col span={8}>
              <div className={styles.backgrounColorOfApprovedDetail}>
                <label className={styles.viewDetailMainLabels}>Status</label>
                <label className={styles.viewDetailSubLabels}>
                  {manageUsersViewDetailModalData?.userDetails?.userStatus === 1
                    ? "Active"
                    : manageUsersViewDetailModalData?.userDetails
                        ?.userStatus === 2
                    ? "Disabled"
                    : manageUsersViewDetailModalData?.userDetails
                        ?.userStatus === 3
                    ? "Closed"
                    : manageUsersViewDetailModalData?.userDetails
                        ?.userStatus === 4
                    ? "Dormant"
                    : manageUsersViewDetailModalData?.userDetails
                        ?.userStatus === 5
                    ? "Registration request pending"
                    : manageUsersViewDetailModalData?.userDetails
                        ?.userStatus === 6
                    ? "Registration request accepted"
                    : manageUsersViewDetailModalData?.userDetails
                        ?.userStatus === 7
                    ? "Registration request rejected"
                    : "NonActive"}
                </label>
              </div>
            </Col>
          </Row>

          <Row gutter={[4, 4]} style={{ marginTop: "3px" }}>
            <Col span={8}>
              <div className={styles.backgrounColorOfApprovedDetail}>
                <label className={styles.viewDetailMainLabels}>
                  Department
                </label>
                <label className={styles.viewDetailSubLabels}>
                  {" "}
                  {safeValue(
                    manageUsersViewDetailModalData?.userDetails?.departmentName,
                    "No Department Name"
                  )}
                </label>
              </div>
            </Col>
            <Col span={8}>
              <div className={styles.backgrounColorOfApprovedDetail}>
                <label className={styles.viewDetailMainLabels}>Email</label>
                <label className={styles.viewDetailSubLabels}>
                  {safeValue(
                    manageUsersViewDetailModalData?.userDetails?.emailAddress,
                    "No Email Address"
                  )}
                </label>
              </div>
            </Col>
            <Col span={8}>
              <div className={styles.backgrounColorOfApprovedDetail}>
                <label className={styles.viewDetailMainLabels}>
                  Member Since
                </label>
                <label className={styles.viewDetailSubLabels}>
                  {safeValue(
                    // FIXED (2026-08-11): was formatShowOnlyDate(memberSinceDate)
                    // only - the backend's MemberSince is a real UTC timestamp
                    // with a paired MemberSinceTime field that was never being
                    // passed in, so this silently dropped the time and could
                    // land on the wrong calendar day (same bug class already
                    // fixed for Instrument Closing Periods).
                    formatShowOnlyDateForDateRange(
                      manageUsersViewDetailModalData?.userDetails
                        ?.memberSinceDate,
                      manageUsersViewDetailModalData?.userDetails
                        ?.memberSinceTime
                    ),
                    "No Member Since Date"
                  )}
                </label>
              </div>
            </Col>
          </Row>

          <Row gutter={[4, 4]} style={{ marginTop: "3px" }}>
            <Col span={8}>
              <div className={styles.backgrounColorOfApprovedDetail}>
                <label className={styles.viewDetailMainLabels}>
                  Last Loging
                </label>
                <label className={styles.viewDetailSubLabels}>
                  {safeValue(
                    formatApiDateTime(
                      `${
                        manageUsersViewDetailModalData?.userDetails
                          ?.lastLoginDate || ""
                      } ${
                        manageUsersViewDetailModalData?.userDetails
                          ?.lastLoginTime || ""
                      }`
                    ),
                    "No Last Login"
                  )}
                </label>
              </div>
            </Col>
            <Col span={16}>
              <div className={styles.backgrounColorOfApprovedDetail}>
                <label className={styles.viewDetailMainLabels}>
                  Assigned Policy Group:
                </label>
                <label className={styles.viewDetailSubLabels}>
                  {safeValue(
                    manageUsersViewDetailModalData?.userDetails
                      ?.assignedGroupPolicies,
                    "No Policy Group Assigned"
                  )}
                </label>
              </div>
            </Col>
          </Row>

          <Row gutter={[4, 4]} style={{ marginTop: "3px" }}>
            <Col span={24}>
              <div className={styles.backgrounColorOfBrokerDetail}>
                <label className={styles.viewDetailMainLabels}>Roles</label>
                <div className={styles.tagContainer}>
                  {manageUsersViewDetailModalData?.userAssignedRoles?.length >
                  0 ? (
                    manageUsersViewDetailModalData?.userAssignedRoles?.map(
                      (role, index) => (
                        <Tag key={index} className={styles.tagClasses}>
                          {role.roleName}
                        </Tag>
                      )
                    )
                  ) : (
                    <span>No roles assigned</span>
                  )}
                </div>
              </div>
            </Col>
          </Row>

          {hasRoleId2 && (
            <>
              <Row gutter={[16, 16]}>
                {/* 🔹 Line Manager Card */}
                {(isLineManagerEditOpen || !isComplianceOfficerEditOpen) && (
                  <Col span={isLineManagerEditOpen ? 24 : 12}>
                    <div className={styles.complianceCard}>
                      <h4 className={styles.cardTitle}>Line Manager</h4>

                      {isLineManagerEditOpen ? (
                        // Edit Mode Dropdown
                        <div className={styles.editMainDiv}>
                          <label className={styles.instrumentLabel}>
                            Name:
                          </label>
                          <Select
                            showSearch
                            labelInValue
                            value={selectedLineManagerID}
                            optionFilterProp="label"
                            optionLabelProp="label"
                            className={styles.SelectDropdownClass}
                            placeholder="Select a Line Manager"
                            onChange={(value) => {
                              setSelectedLineManagerID(value);
                            }}
                          >
                            {lineManagerViewDetailDropdownData?.lineManagers?.map(
                              (manager) => (
                                <Select.Option
                                  key={manager.userID}
                                  value={manager.userID}
                                  label={`${manager.firstName} ${manager.lastName}`}
                                >
                                  <Row>
                                    <Col span={12}>
                                      <div>
                                        <div
                                          className={styles.selectFullNameText}
                                        >
                                          {manager.firstName} {manager.lastName}
                                        </div>
                                        <div className={styles.selectEmailText}>
                                          {manager.emailAddress || "N/A"}
                                        </div>
                                      </div>
                                    </Col>
                                    <Col
                                      span={12}
                                      style={{ textAlign: "right" }}
                                    >
                                      <div
                                        className={styles.selectFullNameText}
                                      >
                                        {manager.userID}
                                      </div>
                                      <div className={styles.selectEmailText}>
                                        {manageUsersViewDetailModalData
                                          ?.userDetails?.departmentName ||
                                          "N/A"}
                                      </div>
                                    </Col>
                                  </Row>
                                </Select.Option>
                              )
                            )}
                          </Select>

                          <div className={styles.mainButtonDivClose}>
                            <CustomButton
                              text="Cancel"
                              className="big-light-button"
                              onClick={() => {
                                setSelectedLineManagerID(null);
                                setIsLineManagerEditOpen(false);
                              }}
                            />
                            <CustomButton
                              text="Save"
                              onClick={saveLineManager}
                              className="big-dark-button"
                            />
                          </div>
                        </div>
                      ) : (
                        // Display Mode Card
                        <div className={styles.LMcardContent}>
                          {manageUsersViewDetailModalData?.userHierarchy?.find(
                            (manager) => manager.roleID === 3
                          ) ? (
                            (() => {
                              const LM =
                                manageUsersViewDetailModalData.userHierarchy.find(
                                  (manager) => manager.roleID === 3
                                );
                              return (
                                <Row gutter={16} align="middle">
                                  <Col span={12}>
                                    <div className={styles.infoBlock}>
                                      <label className={styles.infoLabel}>
                                        Name: {LM.managerName || "N/A"}
                                      </label>
                                      <div className={styles.infoSubLabel}>
                                        Email: {LM.managerEmail || "N/A"}
                                      </div>
                                    </div>
                                  </Col>

                                  <Col span={11}>
                                    <div className={styles.infoBlock}>
                                      <label className={styles.infoLabel}>
                                        ID: {LM.managerID || "N/A"}
                                      </label>
                                      <div className={styles.infoSubLabel}>
                                        Department:{" "}
                                        {manageUsersViewDetailModalData
                                          ?.userDetails?.departmentName ||
                                          "N/A"}
                                      </div>
                                    </div>
                                  </Col>

                                  <Col span={1} className={styles.iconCol}>
                                    <img
                                      src={EditIcon}
                                      onClick={() => {
                                        onClickOfEditButtonLineMangerDropdown();
                                        setIsLineManagerEditOpen(true);
                                      }}
                                      alt="Edit"
                                    />
                                  </Col>
                                </Row>
                              );
                            })()
                          ) : (
                            <div className={styles.noDataText}>
                              No Line Manager Assigned
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </Col>
                )}

                {/* 🔹 Compliance Officer Card */}
                {(isComplianceOfficerEditOpen || !isLineManagerEditOpen) && (
                  <Col span={isComplianceOfficerEditOpen ? 24 : 12}>
                    <div className={styles.complianceCard}>
                      <h4 className={styles.cardTitle}>Compliance Officer</h4>

                      {isComplianceOfficerEditOpen ? (
                        // Edit Mode Dropdown
                        <div className={styles.editMainDiv}>
                          <label className={styles.instrumentLabel}>
                            Name:
                          </label>
                          <Select
                            showSearch
                            labelInValue
                            value={selectedComplianceOfficerID}
                            optionFilterProp="label"
                            optionLabelProp="label"
                            className={styles.SelectDropdownClass}
                            placeholder="Select a Compliance Officer"
                            onChange={(value) =>
                              setSelectedComplianceOfficerID(value)
                            }
                          >
                            {complianceOfficerViewDetailDropdownData?.lineManagers?.map(
                              (officer) => (
                                <Select.Option
                                  key={officer.userID}
                                  value={officer.userID}
                                  label={`${officer.firstName} ${officer.lastName}`}
                                >
                                  <Row>
                                    <Col span={12}>
                                      <div>
                                        <div
                                          className={styles.selectFullNameText}
                                        >
                                          {officer.firstName} {officer.lastName}
                                        </div>
                                        <div className={styles.selectEmailText}>
                                          {officer.emailAddress || "N/A"}
                                        </div>
                                      </div>
                                    </Col>
                                    <Col
                                      span={12}
                                      style={{ textAlign: "right" }}
                                    >
                                      <div
                                        className={styles.selectFullNameText}
                                      >
                                        {officer.userID}
                                      </div>
                                      <div className={styles.selectEmailText}>
                                        {manageUsersViewDetailModalData
                                          ?.userDetails?.departmentName ||
                                          "N/A"}
                                      </div>
                                    </Col>
                                  </Row>
                                </Select.Option>
                              )
                            )}
                          </Select>

                          <div className={styles.mainButtonDivClose}>
                            <CustomButton
                              text="Cancel"
                              className="big-light-button"
                              onClick={() => {
                                setSelectedComplianceOfficerID(null);
                                setIsComplianceOfficerEditOpen(false);
                              }}
                            />
                            <CustomButton
                              text="Save"
                              onClick={saveComplianceOfficer}
                              className="big-dark-button"
                            />
                          </div>
                        </div>
                      ) : (
                        // Display Mode Card
                        <div className={styles.cardContent}>
                          {manageUsersViewDetailModalData?.userHierarchy?.find(
                            (manager) => manager.roleID === 4
                          ) ? (
                            (() => {
                              const CO =
                                manageUsersViewDetailModalData.userHierarchy.find(
                                  (manager) => manager.roleID === 4
                                );
                              return (
                                <Row gutter={16} align="middle">
                                  <Col span={12}>
                                    <div className={styles.infoBlock}>
                                      <label className={styles.infoLabel}>
                                        Name: {CO.managerName || "N/A"}
                                      </label>
                                      <div className={styles.infoSubLabel}>
                                        Email: {CO.managerEmail || "N/A"}
                                      </div>
                                    </div>
                                  </Col>

                                  <Col span={11}>
                                    <div className={styles.infoBlock}>
                                      <label className={styles.infoLabel}>
                                        ID: {CO.managerID || "N/A"}
                                      </label>
                                      <div className={styles.infoSubLabel}>
                                        Department:{" "}
                                        {manageUsersViewDetailModalData
                                          ?.userDetails?.departmentName ||
                                          "N/A"}
                                      </div>
                                    </div>
                                  </Col>

                                  <Col span={1} className={styles.iconCol}>
                                    <img
                                      src={EditIcon}
                                      onClick={() => {
                                        onClickOfEditButtonComplianceOfficerDropdown();
                                        setIsComplianceOfficerEditOpen(true);
                                      }}
                                      alt="Edit"
                                    />
                                  </Col>
                                </Row>
                              );
                            })()
                          ) : (
                            <div className={styles.noDataText}>
                              No Compliance Officer Assigned
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </Col>
                )}
              </Row>

              {/* 🔹 Bottom Buttons */}
              {!isLineManagerEditOpen && !isComplianceOfficerEditOpen && (
                <Row>
                  <Col span={24} className={styles.mainButtonDivClose}>
                    <CustomButton
                      text={"Roles & Policies"}
                      className="big-light-button"
                      onClick={onClickRoleAndPolicy}
                    />
                    <CustomButton
                      text={"Close"}
                      className="big-light-button"
                      onClick={() => setViewDetailManageUser(false)}
                    />
                  </Col>
                </Row>
              )}
            </>
          )}

          {!hasRoleId2 && (
            <Row>
              <Col span={24} className={styles.mainButtonDivClose}>
                <CustomButton
                  text={"Close"}
                  className="big-light-button"
                  onClick={() => setViewDetailManageUser(false)}
                />
              </Col>
            </Row>
          )}
        </div>
      }
    />
  );
};

export default ViewDetailManageUserModal;
