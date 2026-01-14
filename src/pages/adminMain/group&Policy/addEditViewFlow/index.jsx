import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button, PageLayout } from "../../../../components";
import { Breadcrumb, Col, Row } from "antd";
import { useMyAdmin } from "../../../../context/AdminContext";
import styles from "./styles.module.css";
import CancelGroupModal from "./modals/cancle/CancelGroupModal";
import CreatedGroupModal from "./modals/created/CreatedGroupModal";
import Details from "./deatilsTab/details";
import { useApi } from "../../../../context/ApiContext";
import { useGlobalLoader } from "../../../../context/LoaderContext";
import { useNotification } from "../../../../components/NotificationProvider/NotificationProvider";
import Policies from "./policiesTab/policies";
import { useSearchBarContext } from "../../../../context/SearchBarContaxt";
import { BorderTopOutlined } from "@ant-design/icons";
import { notification } from "antd";
import ErrorIcon from "../../../../assets/img/error-red-icon.png";
import Users from "./usersTab/users";
import {
  AddGroupPolicy,
  UpdateGroupPolicy,
  ViewGroupPolicyDetails,
} from "../../../../api/adminApi";
import { buildApiRequest, mapGroupPolicyResponse } from "./utils";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);
/**
 * 🔹 GroupAndPolicyAddViewEdit
 * Handles "Create / Edit / View" pages for Group Policy module.
 * Provides breadcrumb navigation, tab-based content switching,
 * and form control actions (Cancel, Previous, Next, Create).
 */
const GroupAndPolicyAddViewEdit = ({ currentPolicyID, setCurrentPolicyID }) => {
  const {
    resetAdminGropusAndPolicyContextState,
    pageTypeForAdminGropusAndPolicy,
    pageTabesForAdminGropusAndPolicy,
    setPageTabeForAdminGropusAndPolicy,
    tabesFormDataofAdminGropusAndPolicy,
    setTabesFormDataofAdminGropusAndPolicy,
    setAdminGropusAndPolicyMqtt,
    setPageTypeForAdminGropusAndPolicy,
  } = useMyAdmin();
  const navigate = useNavigate();
  const hasFetched = useRef(false);

  // 🔹 Context Hooks
  const { showNotification } = useNotification();
  const { showLoader } = useGlobalLoader();
  const { callApi } = useApi();

  const [api, contextHolder] = notification.useNotification();
  /** 🔹 Notification for validation */
  const openNotification = (placement) => {
    api.open({
      message: (
        <div style={{ fontWeight: 600, color: "#A50000", fontSize: 16 }}>
          Policy Selection Required
        </div>
      ),
      description: (
        <div style={{ color: "#000000", fontSize: 14 }}>
          Please select at least one policy before proceeding.
        </div>
      ),
      placement,

      icon: (
        <img
          src={ErrorIcon}
          alt="error"
          style={{
            width: 30,
            height: 30,
          }}
        />
      ),
      style: {
        width: 473.02,
        height: 59.71,
        top: 54,
        left: 563,
        borderRadius: 10,
        border: "1px solid #A50000",
        padding: "10px 20px",
        display: "flex",
        alignItems: "center",
        background: "#fff",
        boxShadow: "0px 4px 10px rgba(0,0,0,0.05)",
      },
      duration: 3,
    });
  };

  const {
    adminGropusAndPolicyPoliciesTabSearch,
    setAdminGropusAndPolicyPoliciesTabSearch,
    resetAdminGropusAndPolicyPoliciesTabSearch,
    adminGropusAndPolicyUsersTabSearch,
    setAdminGropusAndPolicyUsersTabSearch,
    resetAdminGropusAndPolicyUsersTabSearch,
  } = useSearchBarContext();

  /** 🔹 Local state for Cancel confirmation modal */
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [createdModalVisible, setCreatedModalVisible] = useState(false);
  const [errorDeatilsTabSwitch, setErrorDeatilsTabSwitch] = useState(false);
  const [clickEditFromView, setClickEditFromView] = useState(false); // Controls which accordion panels are open

  const fetchApiCall = useCallback(
    async (requestData, replace = false, showLoaderFlag = true) => {
      if (!requestData || typeof requestData !== "object") return;
      if (showLoaderFlag) showLoader(true);

      const res = await ViewGroupPolicyDetails({
        callApi,
        showNotification,
        showLoader,
        requestdata: requestData,
        navigate,
      });

      if (res) {
        console.log("groupPolicies", res);
        let data = mapGroupPolicyResponse(res);
        setTabesFormDataofAdminGropusAndPolicy(data);
        console.log("groupPolicies", data);
      }
    },
    [callApi, navigate, showLoader, showNotification]
  );

  // Initial Fetch
  useEffect(() => {
    if (
      !hasFetched.current &&
      (pageTypeForAdminGropusAndPolicy === 1 ||
        pageTypeForAdminGropusAndPolicy === 2)
    ) {
      hasFetched.current = true;
      const requestData = {
        GroupPolicyID: currentPolicyID,
      };
      fetchApiCall(requestData, true, true);
    }
  }, [fetchApiCall]);

  /** 🔹 Dynamic breadcrumb title */
  const getTitleByType = () => {
    switch (pageTypeForAdminGropusAndPolicy) {
      case 0:
        return "Create Groups";
      case 1:
        return "Edit Group";
      case 2:
        return "View Group";
      default:
        return "Group Policy";
    }
  };

  /** 🔹 Clicking “Group Policy” resets to list view */
  const handleGroupPolicyClick = () => {
    resetAdminGropusAndPolicyContextState();
  };

  /** 🔹 Validation for Details tab */
  const validateDetailsTab = () => {
    const { groupTitle, groupDiscription } =
      tabesFormDataofAdminGropusAndPolicy.details;

    if (!groupTitle.trim() || !groupDiscription.trim()) {
      // Optionally, you can trigger red borders from child via context if needed
      // For now, we just block navigation and show message

      setErrorDeatilsTabSwitch(true);
      return false;
    }
    return true;
  };

  /** 🔹 Validation for Policies tab */
  const validatePoliciesTab = () => {
    const selectedPolicies =
      tabesFormDataofAdminGropusAndPolicy?.policies || [];

    if (!selectedPolicies.length) {
      openNotification("top");
      return false;
    }
    return true;
  };

  /** 🔹 Validation for Users tab */
  const validateUsersTab = () => {
    const users = tabesFormDataofAdminGropusAndPolicy?.users || [];

    if (!users.length) {
      api.open({
        message: (
          <div style={{ fontWeight: 600, color: "#A50000", fontSize: 16 }}>
            User Selection Required
          </div>
        ),
        description: (
          <div style={{ color: "#000000", fontSize: 14 }}>
            Ensure at least one user is added.
          </div>
        ),
        placement: "top",
        icon: (
          <img src={ErrorIcon} alt="error" style={{ width: 30, height: 30 }} />
        ),
        style: {
          width: 473.02,
          height: 59.71,
          top: 54,
          left: 563,
          borderRadius: 10,
          border: "1px solid #A50000",
          padding: "10px 20px",
          display: "flex",
          alignItems: "center",
          background: "#fff",
          boxShadow: "0px 4px 10px rgba(0,0,0,0.05)",
        },
        duration: 3,
      });
      return false;
    }

    return true;
  };

  /** 🔹 Tab switching */
  const handleTabSwitch = (index) => {
    if (pageTypeForAdminGropusAndPolicy < 2) {
      if (
        pageTabesForAdminGropusAndPolicy === 0 &&
        index > 0 &&
        !validateDetailsTab()
      )
        return;
      // Validate Policies tab before moving forward
      if (
        pageTabesForAdminGropusAndPolicy === 1 &&
        index > 1 &&
        !validatePoliciesTab()
      )
        return;
      setPageTabeForAdminGropusAndPolicy(index);
    } else {
      setPageTabeForAdminGropusAndPolicy(index);
    }
  };

  /** 🔹 Action Handlers */
  const handleCancel = () => {
    // Show confirmation modal
    setCancelModalVisible(true);
  };

  const handlePrevious = () => {
    if (pageTabesForAdminGropusAndPolicy > 0)
      setPageTabeForAdminGropusAndPolicy(pageTabesForAdminGropusAndPolicy - 1);
  };

  const handleNext = () => {
    if (pageTabesForAdminGropusAndPolicy < 2)
      if (pageTabesForAdminGropusAndPolicy === 0 && !validateDetailsTab())
        return;
    if (pageTabesForAdminGropusAndPolicy === 1 && !validatePoliciesTab())
      return;

    setPageTabeForAdminGropusAndPolicy(pageTabesForAdminGropusAndPolicy + 1);
  };

  const handleCreate = async () => {
    // ✅ Validate Users before allowing creation
    if (!validateUsersTab()) return;
    // ✅ Deep clone state to avoid mutating
    const formData = JSON.parse(
      JSON.stringify(tabesFormDataofAdminGropusAndPolicy)
    );

    // ✅ Convert threshold for only date/time/datetime
    const convertedPolicies = formData?.policies?.map((policy) => {
      const { dataTypeID, threshold } = policy;

      if (threshold === undefined || threshold === null) return policy;

      let convertedThreshold = threshold;

      try {
        const dateFormat = "YYYYMMDD";
        const timeFormat = "HHmmss";
        const dateTimeFormat = "YYYYMMDDHHmmss";

        if (dataTypeID === 2) {
          // ✅ Date Only (e.g. "2025-10-28")
          const now = dayjs();
          const combined = dayjs(
            `${threshold} ${now.format("HH:mm:ss")}`,
            "YYYY-MM-DD HH:mm:ss"
          );
          convertedThreshold = combined.utc().format(dateFormat);
        } else if (dataTypeID === 3) {
          // ✅ Time Only (e.g. "08:15")
          const today = dayjs().format("YYYY-MM-DD");
          const combined = dayjs(`${today} ${threshold}`, "YYYY-MM-DD HH:mm");
          convertedThreshold = combined.utc().format(timeFormat);
        } else if (dataTypeID === 4) {
          // ✅ Date + Time (e.g. "2025-10-28 08:15")
          const parsed = dayjs(threshold, "YYYY-MM-DD HH:mm");
          convertedThreshold = parsed.utc().format(dateTimeFormat);
        } else if (dataTypeID === 7) {
          // ✅ Multi-Select (convert array to comma-separated string)
          if (Array.isArray(threshold)) {
            convertedThreshold = threshold.join(",");
          }
        } else {
          // ✅ Convert all remaining types to string
          convertedThreshold = String(threshold);
        }
      } catch (e) {
        console.warn("⚠️ Conversion failed for policy:", policy.policyID, e);
      }

      return {
        ...policy,
        threshold: convertedThreshold,
      };
    });

    // ✅ Remove `dataTypeID` from final payload
    const cleanedPolicies = convertedPolicies.map(
      ({ dataTypeID, ...rest }) => rest
    );

    let requestData = buildApiRequest({
      ...tabesFormDataofAdminGropusAndPolicy,
      policies: cleanedPolicies,
    });

    if (pageTypeForAdminGropusAndPolicy === 1) {
      // 🟠 Update existing → add GroupPolicyID
      requestData = {
        ...requestData,
        GroupPolicyID: currentPolicyID, // 👈 use your stored policy ID
      };
    }

    if (pageTypeForAdminGropusAndPolicy === 0) {
      showLoader(true);
      const res = await AddGroupPolicy({
        callApi,
        showNotification,
        showLoader,
        requestdata: requestData,
        navigate,
      });
      if (res) {
        setCreatedModalVisible(true); // ✅ Open modal
      } else {
        console.log("failed");
      }
    } else {
      showLoader(true);
      const res = await UpdateGroupPolicy({
        callApi,
        showNotification,
        showLoader,
        requestdata: requestData,
        navigate,
      });
      if (res) {
        setCreatedModalVisible(true); // ✅ Open modal
      } else {
        console.log("failed");
      }

      console.log("requestData", requestData);
    }
  };

  /** 🔹 Cancel Modal Actions */
  const handleContinueEditing = () => {
    setCancelModalVisible(false);
  };

  const handleConfirmCancel = () => {
    setCancelModalVisible(false);
    resetAdminGropusAndPolicyContextState();
  };

  /** 🔹 Handle removing individual filter */
  const handleRemoveFilter = (key) => {
    if (pageTabesForAdminGropusAndPolicy === 1) {
      // Policies Tab Filters
      const resetMap = {
        policyId: { policyId: null },
        scenario: { scenario: "" },
        consequence: { consequence: "" },
      };

      setAdminGropusAndPolicyPoliciesTabSearch((prev) => ({
        ...prev,
        ...resetMap[key],
        pageNumber: 0,
        filterTrigger: true,
      }));
    } else if (pageTabesForAdminGropusAndPolicy === 2) {
      // Users Tab Filters
      const resetMap = {
        employeeName: { employeeName: "" },
        designation: { designation: "" },
        departmentName: { departmentName: "" },
        emailAddress: { emailAddress: "" },
      };

      setAdminGropusAndPolicyUsersTabSearch((prev) => ({
        ...prev,
        ...resetMap[key],
        pageNumber: 0,
        filterTrigger: true,
      }));
    }
  };

  /** 🔹 Handle removing all filters */
  const handleRemoveAllFilters = () => {
    if (pageTabesForAdminGropusAndPolicy === 1) {
      // Policies tab
      setAdminGropusAndPolicyPoliciesTabSearch((prev) => ({
        ...prev,
        policyId: null,
        scenario: "",
        consequence: "",
        pageNumber: 0,
        filterTrigger: true,
      }));
    } else if (pageTabesForAdminGropusAndPolicy === 2) {
      // Users tab
      setAdminGropusAndPolicyUsersTabSearch((prev) => ({
        ...prev,
        employeeName: "",
        emailAddress: "",
        designation: "",
        departmentName: "",
        pageNumber: 0,
        filterTrigger: true,
      }));
    }
  };

  /** 🔹 Build Active Filters */
  const activeFilters = (() => {
    const truncate = (text) =>
      typeof text === "string" && text.length > 13
        ? `${text.slice(0, 13)}...`
        : text;

    if (pageTabesForAdminGropusAndPolicy === 1) {
      // 🔸 Policy Filters
      const { policyId, scenario, consequence } =
        adminGropusAndPolicyPoliciesTabSearch || {};

      const filters = [];

      if (policyId)
        filters.push({
          key: "policyId",
          label: "Policy ID",
          value: truncate(policyId), // ✅ removed '#'
        });

      if (scenario)
        filters.push({
          key: "scenario",
          label: "Scenario",
          value: truncate(scenario),
        });

      if (consequence)
        filters.push({
          key: "consequence",
          label: "Consequence",
          value: truncate(consequence),
        });

      return filters;
    }

    if (pageTabesForAdminGropusAndPolicy === 2) {
      // 🔸 User Filters
      const { employeeName, designation, departmentName, emailAddress } =
        adminGropusAndPolicyUsersTabSearch || {};

      const filters = [];

      if (employeeName)
        filters.push({
          key: "employeeName",
          label: "Employee Name",
          value: truncate(employeeName),
        });

      if (designation)
        filters.push({
          key: "designation",
          label: "Designation",
          value: truncate(designation),
        });

      if (departmentName)
        filters.push({
          key: "departmentName",
          label: "Department",
          value: truncate(departmentName),
        });

      if (emailAddress)
        filters.push({
          key: "emailAddress",
          label: "Email",
          value: truncate(emailAddress),
        });

      return filters;
    }

    return [];
  })();

  /** 🔹 Handle "Edit Details" modal */
  const handleEditFromView = async () => {
    // // Step 1 & 2 — reset values
    setClickEditFromView(true);
  };

  useEffect(() => {
    if (pageTabesForAdminGropusAndPolicy === 0) {
      resetAdminGropusAndPolicyPoliciesTabSearch();
      resetAdminGropusAndPolicyUsersTabSearch();
    } else if (pageTabesForAdminGropusAndPolicy === 1) {
      resetAdminGropusAndPolicyUsersTabSearch();
    } else if (pageTabesForAdminGropusAndPolicy === 2) {
      resetAdminGropusAndPolicyPoliciesTabSearch();
    }
  }, [pageTabesForAdminGropusAndPolicy]);

  return (
    <div className={styles.noScrollContainer}>
      {contextHolder}

      {/* 🔹 Breadcrumb Section */}
      <Row justify="start" align="middle" className={styles.breadcrumbRow}>
        <Col>
          <Breadcrumb
            separator=">"
            className={styles.customBreadcrumb}
            items={[
              {
                title: (
                  <span
                    onClick={handleGroupPolicyClick}
                    className={styles.breadcrumbLink}
                  >
                    Group Policy
                  </span>
                ),
              },
              {
                title: (
                  <span className={styles.breadcrumbText}>
                    {getTitleByType()}
                  </span>
                ),
              },
            ]}
          />
        </Col>
      </Row>
      {/* 🔹 Active Filter Tags */}
      {activeFilters.length > 0 && (
        <Row gutter={[12, 12]} className={styles["filter-tags-container"]}>
          {activeFilters.map(({ key, value }) => (
            <Col key={key}>
              <div className={styles["filter-tag"]}>
                <span>{value}</span>
                <span
                  className={styles["filter-tag-close"]}
                  onClick={() => handleRemoveFilter(key)}
                >
                  &times;
                </span>
              </div>
            </Col>
          ))}

          {/* 🔹 Show Clear All only if more than one filter */}
          {activeFilters.length > 1 && (
            <Col>
              <div
                className={`${styles["filter-tag"]} ${styles["clear-all-tag"]}`}
                onClick={handleRemoveAllFilters}
              >
                <span>Clear All</span>
              </div>
            </Col>
          )}
        </Row>
      )}
      {/* 🔹 Page Layout with Tabs and Actions */}
      <PageLayout
        background={
          activeFilters.length > 0 ? "changeblue2" : "blue2"
        }
        className={
          activeFilters.length > 0 ? "changeGrouppolicy" : "grouppolicy"
        }
      >
        <Row justify="space-between" align="middle" className={styles.header}>
          {/* 🔸 Tabs: Details / Policies / Users */}
          <Col>
            <div className={styles.tabWrapper}>
              <div className={styles.tabButtons}>
                {["Details", "Policies", "Users"].map((tab, index) => (
                  <div
                    key={tab}
                    className={styles.tabButton}
                    onClick={() => handleTabSwitch(index)}
                  >
                    <Button
                      type="text"
                      className={
                        pageTabesForAdminGropusAndPolicy === index
                          ? "only-tex-selected"
                          : "only-tex-not-selected-groups"
                      }
                      text={tab}
                    />
                  </div>
                ))}

                {/* 🔸 Animated underline */}
                <div
                  className={
                    pageTabesForAdminGropusAndPolicy === 0
                      ? styles.underlineDetails
                      : pageTabesForAdminGropusAndPolicy === 1
                      ? styles.underlinePolicies
                      : styles.underlineUsers
                  }
                  style={{
                    transform: `translateX(${
                      pageTabesForAdminGropusAndPolicy * 100
                    }%)`,
                  }}
                />
              </div>
            </div>
          </Col>

          {/* 🔸 Action Buttons (Only for Create/Edit pages) */}
          <div className={styles.allbuttons}>
            {(pageTypeForAdminGropusAndPolicy === 0 ||
              pageTypeForAdminGropusAndPolicy === 1) && (
              <Col>
                <Row gutter={[8, 8]}>
                  <Col>
                    <Button
                      className="small-light-button"
                      text="Cancel"
                      onClick={handleCancel}
                    />
                  </Col>

                  {/* 🔹 Tab-based buttons */}
                  {pageTabesForAdminGropusAndPolicy === 0 && (
                    <Col>
                      <Button
                        className="small-dark-button"
                        text="Next"
                        onClick={handleNext}
                      />
                    </Col>
                  )}

                  {pageTabesForAdminGropusAndPolicy === 1 && (
                    <>
                      <Col>
                        <Button
                          className="small-light-button"
                          text="Previous"
                          onClick={handlePrevious}
                        />
                      </Col>
                      <Col>
                        <Button
                          className="small-dark-button"
                          text="Next"
                          onClick={handleNext}
                        />
                      </Col>
                    </>
                  )}

                  {pageTabesForAdminGropusAndPolicy === 2 && (
                    <>
                      <Col>
                        <Button
                          className="small-light-button"
                          text="Previous"
                          onClick={handlePrevious}
                        />
                      </Col>
                      <Col>
                        <Button
                          className="small-dark-button"
                          text={
                            pageTypeForAdminGropusAndPolicy === 0
                              ? "Create"
                              : "Update"
                          }
                          onClick={handleCreate}
                        />
                      </Col>
                    </>
                  )}
                </Row>
              </Col>
            )}
            {pageTypeForAdminGropusAndPolicy === 2 && (
              <Col>
                <Button
                  className="small-dark-button"
                  text={
                    pageTabesForAdminGropusAndPolicy === 0
                      ? "Edit Deatils"
                      : pageTabesForAdminGropusAndPolicy === 1
                      ? "Edit Policies"
                      : "Edit Users"
                  }
                  onClick={handleEditFromView}
                />
              </Col>
            )}
          </div>
        </Row>
        {pageTabesForAdminGropusAndPolicy === 0 && (
          <Details
            errorDeatilsTabSwitch={errorDeatilsTabSwitch}
            setErrorDeatilsTabSwitch={setErrorDeatilsTabSwitch}
            currentPolicyID={currentPolicyID}
            clickEditFromView={clickEditFromView}
            setClickEditFromView={setClickEditFromView}
          />
        )}
        {pageTabesForAdminGropusAndPolicy === 1 && (
          <Policies
            activeFilters={activeFilters.length > 0}
            currentPolicyID={currentPolicyID}
            clickEditFromView={clickEditFromView}
            setClickEditFromView={setClickEditFromView}
          />
        )}
        {pageTabesForAdminGropusAndPolicy === 2 && (
          <Users
            activeFilters={activeFilters.length > 0}
            currentPolicyID={currentPolicyID}
            clickEditFromView={clickEditFromView}
            setClickEditFromView={setClickEditFromView}
          />
        )}
      </PageLayout>

      {/* 🔹 Cancel Confirmation Modal */}
      <CancelGroupModal
        visible={cancelModalVisible}
        onCancel={() => setCancelModalVisible(false)}
        onContinueEditing={handleContinueEditing}
        onConfirmCancel={handleConfirmCancel}
      />
      {/* 🔹 Group Created Modal */}
      <CreatedGroupModal
        visible={createdModalVisible}
        onClose={() => {
          resetAdminGropusAndPolicyContextState(); // Optional → go back to list
          setCreatedModalVisible(false);
          setAdminGropusAndPolicyMqtt(true);
        }}
      />
    </div>
  );
};

export default GroupAndPolicyAddViewEdit;
