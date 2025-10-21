import React from "react";
import { PageLayout } from "../../../../components";
import { Breadcrumb, Col, Row } from "antd";
import { useMyAdmin } from "../../../../context/AdminContext";
import styles from "./styles.module.css";

const GroupAndPolicyAddViewEdit = () => {
  const {
    resetAdminGropusAndPolicyContextState,
    pageTypeForAdminGropusAndPolicy,
  } = useMyAdmin();

  // 🔹 Dynamic breadcrumb title
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

  // 🔹 Handle click on “Group Policy”
  const handleGroupPolicyClick = () => {
    resetAdminGropusAndPolicyContextState();
  };

  return (
    <div className={styles.noScrollContainer}>
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

      <PageLayout background="blue" />
    </div>
  );
};

export default GroupAndPolicyAddViewEdit;
