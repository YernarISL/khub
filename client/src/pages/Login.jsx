import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/userService";
import { useAuthStore } from "../app/store";
import "../styles/Login.css";

const Login = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const navigateToReg = () => {
    navigate("/registration");
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await login(formData);

      if (response.status === 200) {
        setAuth(response.data);
        navigate("/home");
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <div className="login-page-wrapper">
      <img
        src="/src/assets/registration_background.png"
        alt="login background image"
        className="login-background-image"
      />
      <div className="login-page-container">
        <form onSubmit={handleSubmit} className="login-form-container">
          <h2 className="login-page-heading">Log in</h2>
          <input
            className="auth-input"
            id="login-username-input-field"
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
          />
          <input
            className="auth-input"
            id="login-password-input-field"
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button className="login-button" type="submit">
            Log in
          </button>
          <p className="login-reference">
            Don't an Account? <a onClick={navigateToReg}>Register</a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
