import React, { useEffect, useState } from "react";
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
/**
 * 🔹 GroupAndPolicyAddViewEdit
 * Handles "Create / Edit / View" pages for Group Policy module.
 * Provides breadcrumb navigation, tab-based content switching,
 * and form control actions (Cancel, Previous, Next, Create).
 */
const GroupAndPolicyAddViewEdit = () => {
  const {
    resetAdminGropusAndPolicyContextState,
    pageTypeForAdminGropusAndPolicy,
    pageTabesForAdminGropusAndPolicy,
    setPageTabeForAdminGropusAndPolicy,
    tabesFormDataofAdminGropusAndPolicy,
    setTabesFormDataofAdminGropusAndPolicy,
  } = useMyAdmin();

  const {
    adminGropusAndPolicyPoliciesTabSearch,
    setAdminGropusAndPolicyPoliciesTabSearch,
    resetAdminGropusAndPolicyPoliciesTabSearch,
  } = useSearchBarContext();

  /** 🔹 Local state for Cancel confirmation modal */
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [createdModalVisible, setCreatedModalVisible] = useState(false);
  const [errorDeatilsTabSwitch, setErrorDeatilsTabSwitch] = useState(false);
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

  /** 🔹 Tab switching */
  const handleTabSwitch = (index) => {
    if (pageTabesForAdminGropusAndPolicy === 0 && !validateDetailsTab()) return;
    setPageTabeForAdminGropusAndPolicy(index);
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
    setPageTabeForAdminGropusAndPolicy(pageTabesForAdminGropusAndPolicy + 1);
  };

  const handleCreate = () => {
    setCreatedModalVisible(true); // ✅ Open modal
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
  };

  /** 🔹 Handle removing all filters */
  const handleRemoveAllFilters = () => {
    setAdminGropusAndPolicyPoliciesTabSearch((prev) => ({
      ...prev,
      policyId: null,
      scenario: "",
      consequence: "",
      pageNumber: 0,
      filterTrigger: true,
    }));
  };

  /** 🔹 Build Active Filters */
  const activeFilters = (() => {
    const { policyId, scenario, consequence } =
      adminGropusAndPolicyPoliciesTabSearch || {};

    const filters = [];

    if (policyId)
      filters.push({
        key: "policyId",
        label: "Policy ID",
        value: `#${policyId}`,
      });

    if (scenario)
      filters.push({
        key: "scenario",
        label: "Scenario",
        value: scenario.length > 20 ? `${scenario.slice(0, 20)}...` : scenario,
      });

    if (consequence)
      filters.push({
        key: "consequence",
        label: "Consequence",
        value:
          consequence.length > 20
            ? `${consequence.slice(0, 20)}...`
            : consequence,
      });

    return filters;
  })();
  useEffect(() => {
    if (pageTabesForAdminGropusAndPolicy === 0) {
      resetAdminGropusAndPolicyPoliciesTabSearch();
    } else if (pageTabesForAdminGropusAndPolicy === 1) {
      console.log("h");
    } else if (pageTabesForAdminGropusAndPolicy === 2) {
      resetAdminGropusAndPolicyPoliciesTabSearch();
    }
  }, [pageTabesForAdminGropusAndPolicy]);
  return (
    <div className={styles.noScrollContainer}>
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

      {/* 🔹 Page Layout with Tabs and Actions */}
      <PageLayout
        background="blue"
        className={activeFilters.length > 0 && "changeHeightforPolicy"}
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
                          text="Create"
                          onClick={handleCreate}
                        />
                      </Col>
                    </>
                  )}
                </Row>
              </Col>
            )}
          </div>
        </Row>
        {pageTabesForAdminGropusAndPolicy === 0 && (
          <Details
            errorDeatilsTabSwitch={errorDeatilsTabSwitch}
            setErrorDeatilsTabSwitch={setErrorDeatilsTabSwitch}
          />
        )}
        {pageTabesForAdminGropusAndPolicy === 1 && (
          <Policies activeFilters={activeFilters.length > 0} />
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
          setCreatedModalVisible(false);
          resetAdminGropusAndPolicyContextState(); // Optional → go back to list
        }}
      />
    </div>
  );
};

export default GroupAndPolicyAddViewEdit;
