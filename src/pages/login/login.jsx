import React, { useEffect, useState } from "react";
import { Form, Typography, Row, Col } from "antd";
import style from "./Login.module.css";
import loginImage from "../../assets/img/login-icon.png";
import logo from "../../assets/img/pad-logo-text.png";
import { useNavigate } from "react-router-dom";
import { Button, TextField } from "../../components";
import { useNotification } from "../../components/NotificationProvider/NotificationProvider";
import { useApi } from "../../context/ApiContext";
import { login } from "../../api/loginApi";
import { useGlobalLoader } from "../../context/LoaderContext";
import { useSidebarContext } from "../../context/sidebarContaxt";
import { useDashboardContext } from "../../context/dashboardContaxt";
import { useSearchBarContext } from "../../context/SearchBarContaxt";
import { useGlobalModal } from "../../context/GlobalModalContext";
import { useMyApproval } from "../../context/myApprovalContaxt";
import { usePortfolioContext } from "../../context/portfolioContax";

const { Text } = Typography;

/**
 * 🔐 Login Page
 *
 * Handles user authentication and resets global states when mounted.
 * Provides:
 * - Username & Password fields
 * - Autofocus and keyboard navigation
 * - Context reset on mount (to ensure a clean state)
 * - Submission handling via API
 */
const Login = () => {
  // 🚀 React Router navigation
  const navigate = useNavigate();

  // 🎯 Ant Design form instance
  const [form] = Form.useForm();

  // 📢 Global notification system
  const { showNotification } = useNotification();

  // 🌐 API caller (wrapped with context)
  const { callApi } = useApi();

  // 🔄 Context state resetters (to clear app state on login page mount)
  const { resetDashboardContextState } = useDashboardContext();
  const {
    resetModalContextState,
    resetForLineManagerModal,
    resetStateForComplianceOfficer,
    resetStateForHeadOfApproval,
    resetStateForHeadOfCompliance,
  } = useGlobalModal();
  const { resetMyApprovalContextState, resetApprovalRequestContextState } =
    useMyApproval();
  const { resetPortfolioTab } = usePortfolioContext();
  const { resetSearchBarContextState } = useSearchBarContext();
  const { resetSidebarState, setSelectedKey, setCollapsed } =
    useSidebarContext();

  // ⏳ Global loader
  const { showLoader } = useGlobalLoader();

  // 📝 Local state for form values
  const [formValues, setFormValues] = useState({
    username: "",
    password: "",
  });

  // 🚫 Prevent multiple clicks during login
  const [disableClick, setDisableClick] = useState(false);

  // ❌ Error state for validation
  const [errors, setErrors] = useState({});

  /**
   * 🧹 useEffect → Resets localStorage, sessionStorage,
   * and all global context states whenever login page mounts.
   */
  useEffect(() => {
    localStorage.clear();
    sessionStorage.clear();

    // Reset sidebar
    setSelectedKey("0");
    setCollapsed(true);

    // Reset all contexts
    resetDashboardContextState();
    resetModalContextState();
    resetMyApprovalContextState();
    resetPortfolioTab();
    resetSearchBarContextState();
    resetApprovalRequestContextState();
    resetSidebarState();

    //Reset LM states
    resetForLineManagerModal();

    //Reset For Compliance Officer
    resetStateForComplianceOfficer();

    //Reset For HTA
    resetStateForHeadOfApproval();

    //Reset For HOC
    resetStateForHeadOfCompliance();
  }, []);

  /**
   * Handles controlled input changes
   *
   * @param {string} name - Field name (username/password)
   * @param {string} value - Updated field value
   */
  const handleChange = (name, value) => {
    setFormValues({ ...formValues, [name]: value });
  };

  /**
   * Handles login form submission
   *
   * @async
   * @param {Object} values - Form values { username, password }
   */
  const handleLogin = async (values) => {
    setDisableClick(true);
    try {
      await login({
        username: values.username,
        password: values.password,
        navigate,
        callApi,
        showNotification,
        showLoader,
      });
    } finally {
      setDisableClick(false);
    }
  };

  return (
    <>
      <Row gutter={[16, 16]} className={style["login-container"]}>
        {/* ==================== Left Column (Form Section) ==================== */}
        <Col xs={24} md={16} lg={12}>
          <div className={style["login-form-container"]}>
            <div className={style["login-content"]}>
              {/* 🌟 Logo */}
              <div className={style["logo-container"]}>
                <img
                  draggable={false}
                  src={logo}
                  alt="Company Logo"
                  className={style["logo-image"]}
                />
              </div>

              {/* ==================== Login Form ==================== */}
              <Form
                form={form}
                name="login-form"
                onFinish={handleLogin}
                className={style["login-form"]}
              >
                {/* 🔑 Username Field */}
                <Form.Item
                  name="username"
                  rules={[{ required: true, message: "Please enter username" }]}
                >
                  <TextField
                    label="Username"
                    name="username"
                    value={formValues.username}
                    onChange={(value) => handleChange("username", value)}
                    placeholder="Username"
                    error={errors.username}
                    size="extraLarge"
                    classNames="login-form"
                    autoFocus // 👈 auto-focus on mount
                    onPressEnter={
                      () => form.getFieldInstance("password")?.focus() // 👈 focus password on Enter
                    }
                  />
                </Form.Item>

                {/* 🔒 Password Field */}
                <Form.Item
                  name="password"
                  rules={[
                    { required: true, message: "Please enter your password" },
                  ]}
                >
                  <TextField
                    type="password"
                    label="Password"
                    name="password"
                    value={formValues.password}
                    onChange={(value) => handleChange("password", value)}
                    placeholder="Password"
                    error={errors.password}
                    size="extraLarge"
                    classNames="login-form"
                    onPressEnter={() => form.submit()} // 👈 submit on Enter
                  />
                </Form.Item>

                {/* 🚀 Submit Button */}
                <Form.Item>
                  <Button
                    text="Sign In"
                    className="extra-large-dark-button"
                    htmlType="submit"
                    disabled={disableClick}
                  />
                </Form.Item>
              </Form>
            </div>
          </div>
        </Col>

        {/* ==================== Right Column (Image Section) ==================== */}
        <Col xs={0} md={8} lg={12}>
          <div className={style["login-image-container"]}>
            <img
              draggable={false}
              src={loginImage}
              alt="Login visual"
              className={style["login-image"]}
            />
          </div>
        </Col>
      </Row>
    </>
  );
};

export default Login;
