import React, { useState } from "react";
import { Form, Input, Typography, Row, Col } from "antd";
import style from "./Login.module.css";
import loginImage from "../../assets/img/login-icon.png";
import logo from "../../assets/img/pad-logo-text.png";
import { useNavigate } from "react-router-dom";
import { Button, TextField } from "../../components";
import { useNotification } from "../../components/NotificationProvider/NotificationProvider";
import { CheckCircleOutlined } from "@ant-design/icons";
import { useApi } from "../../context/ApiContext";
import Cookies from "js-cookie";
import { login } from "../../api/loginApi";
import { useUserProfileContext } from "../../context/userProfileContext";

const { Text } = Typography;

const Login = () => {
  const { showNotification } = useNotification();
  // Hooks and State Management
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [formValues, setFormValues] = useState({
    username: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const { callApi } = useApi();
  const { setProfile, setRoles } = useUserProfileContext();
  const [disableClick, setDisableClick] = useState(false);
  /**
   * Handles input changes and updates form state
   * @param {string} name - Field name ('username' or 'password')
   * @param {string} value - New input value
   */
  const handleChange = (name, value) => {
    setFormValues({ ...formValues, [name]: value });
  };

  /**
   * Handles form submission
   * @param {Object} values - Form values {username, password}
   */
  const handleLogin = async (values) => {
    setDisableClick(true); // Disable button
    try {
      await login({
        username: values.username,
        password: values.password,
        navigate,
        setProfile,
        callApi,
        showNotification,
        setRoles,
      });
    } catch (error) {
      // Optionally handle error here
    } finally {
      setDisableClick(false); // Re-enable button
    }
  };
  return (
    <>
      <Row gutter={[16, 16]} className={style["login-container"]}>
        {/* Form Column - Visible on all screens */}
        <Col xs={24} md={16} lg={12}>
          <div className={style["login-form-container"]}>
            <div className={style["login-content"]}>
              {/* Application Logo */}
              <div className={style["logo-container"]}>
                <img
                  src={logo}
                  alt="Company Logo"
                  className={style["logo-image"]}
                />
              </div>

              {/* Login Form */}
              <Form
                form={form}
                name="login-form"
                onFinish={handleLogin}
                className={style["login-form"]}
              >
                {/* Username Field */}
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
                  />
                </Form.Item>

                {/* Password Field */}
                <Form.Item
                  name="password"
                  rules={[
                    { required: true, message: "Please input your password" },
                  ]}
                >
                  <TextField
                    type="password"
                    label="Password"
                    name="password" // Fixed: Changed from "username" to "password"
                    value={formValues.password}
                    onChange={(value) => handleChange("password", value)} // Fixed: Changed from "username" to "password"
                    placeholder="Password"
                    error={errors.password} // Fixed: Changed from errors.username to errors.password
                    size="extraLarge"
                    classNames="login-form"
                  />
                </Form.Item>

                {/* Submit Button */}
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

        {/* Image Column - Hidden on mobile */}
        <Col xs={0} md={8} lg={12}>
          <div className={style["login-image-container"]}>
            <img
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
