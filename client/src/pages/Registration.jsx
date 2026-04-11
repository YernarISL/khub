import React from "react";
import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Registration.css";
import { registration } from "../services/userService";
import { useAuthStore } from "../app/store";

const Registration = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [formData, setFormData] = useState({
    firstName: "",
    secondName: "",
    username: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const navigateToLogin = () => {
    navigate("/login");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await registration(formData);
      setMessage(response.data.message);

      if (response.status === 200) {
        navigate("/login");
      }
    } catch (error) {
      console.error("Error registering user:", error);
      setMessage("An error occurred while registering");
    }
  };

  return (
    <div className="reg-wrapper">
      <img
        src="/src/assets/registration_background.png"
        alt="registration background"
        className="reg-bg-img"
      />
      <div className="reg-container">
        <h1 className="reg-heading">Welcome to KHub</h1>
        <form onSubmit={handleSubmit} className="reg-form-wrapper">
          <div className="reg-form-image-container"></div>
          <div className="reg-form-container">
            <div className="reg-form-left-image-section">
              <img
                src="/src/assets/form_image.png"
                alt="form image"
                className="reg-form-image"
              />
            </div>
            <div className="reg-form-right-form-section">
              <h2 className="reg-form-heading">Sign in</h2>
              <input
                className="auth-input"
                type="text"
                name="firstName"
                placeholder="First name"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
              <input
                className="auth-input"
                type="text"
                name="secondName"
                placeholder="Second name"
                value={formData.secondName}
                onChange={handleChange}
                required
              />
              <input
                className="auth-input"
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <input
                className="auth-input"
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                required
              />
              <input
                className="auth-input"
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <p className="login-reference">
                Have an Account? <a onClick={navigateToLogin}>login</a>
              </p>
              <button className="sign-in-button" type="submit">
                Sign in
              </button>

              {message && <p className="response-message">{message}</p>}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Registration;
