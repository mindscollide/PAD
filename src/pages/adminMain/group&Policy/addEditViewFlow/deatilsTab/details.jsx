import React, { useEffect, useState } from "react";
import { Row, Col, Input, Spin, Flex } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import styles from "./details.module.css";
import { useMyAdmin } from "../../../../../context/AdminContext";
import { useNotification } from "../../../../../components/NotificationProvider/NotificationProvider";
import { useGlobalLoader } from "../../../../../context/LoaderContext";
import { useApi } from "../../../../../context/ApiContext";
import { CheckGroupTitleExists } from "../../../../../api/adminApi";
import { useNavigate } from "react-router-dom";
import Paragraph from "antd/es/skeleton/Paragraph";
const { TextArea } = Input;

const Details = ({
  errorDeatilsTabSwitch,
  setErrorDeatilsTabSwitch,
  clickEditFromView,
  setClickEditFromView,
}) => {
  const {
    tabesFormDataofAdminGropusAndPolicy,
    setTabesFormDataofAdminGropusAndPolicy,
    pageTypeForAdminGropusAndPolicy,
  } = useMyAdmin();
  // 🔷 Context Hooks
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { showLoader } = useGlobalLoader();
  const { callApi } = useApi();
  const [titleError, setTitleError] = useState("");
  const [descError, setDescError] = useState("");
  const [isTitleValid, setIsTitleValid] = useState(null);
  const [isDescValid, setIsDescValid] = useState(null);
  const [isCheckingTitle, setIsCheckingTitle] = useState(false);

  const groupTitle = tabesFormDataofAdminGropusAndPolicy.details.groupTitle;
  console.log("groupDescription", groupTitle);
  const groupDescription =
    tabesFormDataofAdminGropusAndPolicy.details.groupDiscription;
  console.log("groupDescription", groupDescription);

  // 🔹 Simulate async uniqueness check (replace with API later)
  const checkGroupTitleUnique = async () => {
    let requestData = {
      GroupTitle: groupTitle,
    };

    const res = await CheckGroupTitleExists({
      callApi,
      showNotification,
      showLoader,
      requestdata: requestData,
      navigate,
    });

    return res;
  };

  // 🔹 Handle title validation
  const handleTitleBlur = async () => {
    const trimmedTitle = groupTitle.trim();

    if (!trimmedTitle) {
      setTitleError("Please provide a name.");
      setIsTitleValid(false);
      return;
    }
    setIsCheckingTitle(true);
    const isUnique = await checkGroupTitleUnique(trimmedTitle);
    setIsCheckingTitle(false);
    if (!isUnique) {
      setTitleError("This name is already in use.");
      setIsTitleValid(false);
    } else {
      setTitleError("");
      setIsTitleValid(true);
    }
  };

  // 🔹 Handle description validation (only empty check)
  const handleDescriptionBlur = () => {
    const trimmedDesc = groupDescription.trim();
    if (!trimmedDesc) {
      setDescError("Please provide a description.");
      setIsDescValid(false);
    } else {
      setDescError("");
      setIsDescValid(true);
    }
  };

  // 🔹 Handle Input Changes
  const handleChange = (field, value) => {
    setTabesFormDataofAdminGropusAndPolicy((prev) => ({
      ...prev,
      details: {
        ...prev.details,
        [field]: value,
      },
    }));
  };

  // 🔹 Watch for validation trigger from parent
  useEffect(() => {
    if (errorDeatilsTabSwitch) {
      let hasError = false;

      if (!groupTitle.trim()) {
        setTitleError("Please provide a name.");
        setIsTitleValid(false); // ⬅️ Add this
        hasError = true;
      } else {
        setTitleError("");
        setIsTitleValid(true); // ⬅️ Add this
      }

      if (!groupDescription.trim()) {
        setDescError("Please provide a description.");
        setIsDescValid(false); // ⬅️ Add this
        hasError = true;
      } else {
        setDescError("");
        setIsDescValid(true); // ⬅️ Add this
      }

      if (hasError) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }

      // Reset trigger
      setErrorDeatilsTabSwitch(false);
    }
  }, [errorDeatilsTabSwitch]);

  return (
    <div className={styles.detailsContainer}>
      <Row gutter={[0, 24]}>
        {/* 🔹 Group Title */}
        <Col span={24}>
          <label className={styles.label}>Group Title</label>
          {pageTypeForAdminGropusAndPolicy !== 2 ? (
            <>
              <Input
                value={groupTitle}
                onChange={(e) =>
                  e.target.value.length <= 100 &&
                  handleChange("groupTitle", e.target.value)
                }
                onBlur={handleTitleBlur}
                placeholder="Enter group title"
                maxLength={100}
                className={`${styles.inputField} ${
                  isTitleValid === false
                    ? styles.errorBorder
                    : isTitleValid === true
                    ? styles.successBorder
                    : ""
                }`}
              />
              <div
                className={`${styles.counter} ${
                  isTitleValid === false ? styles.errorCounter : ""
                }`}
              >
                {groupTitle.length}/100
              </div>
              {titleError ? (
                <div
                  className={styles.errorMessage}
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <span>{titleError}</span>
                  {isCheckingTitle && (
                    <Spin
                      indicator={<LoadingOutlined spin />}
                      size="small"
                      style={{ marginTop: "-2px" }}
                    />
                  )}
                </div>
              ) : (
                isCheckingTitle && (
                  <div style={{ marginTop: "-12px", marginLeft: "4px" }}>
                    <Spin indicator={<LoadingOutlined spin />} size="small" />
                  </div>
                )
              )}
            </>
          ) : (
            <span className={styles.viewtitle}>{groupTitle}</span>
          )}
        </Col>

        {/* 🔹 Group Description */}
        <Col span={24}>
          <label className={styles.label}>Group Description</label>
          {pageTypeForAdminGropusAndPolicy !== 2 ? (
            <>
              {" "}
              <TextArea
                rows={4}
                value={groupDescription}
                onChange={(e) =>
                  e.target.value.length <= 500 &&
                  handleChange("groupDiscription", e.target.value)
                }
                onBlur={handleDescriptionBlur}
                placeholder="Enter group description"
                maxLength={500}
                className={`${styles.textareaField} ${
                  isDescValid === false ? styles.errorBorder : ""
                }`}
              />
              <div
                className={`${styles.counter} ${
                  isDescValid === false ? styles.errorCounter : ""
                }`}
              >
                {groupDescription.length}/500
              </div>
              {descError && (
                <div className={styles.errorMessage}>{descError}</div>
              )}
            </>
          ) : (
            <span className={styles.viewdiscription}>{groupDescription}</span>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default Details;
