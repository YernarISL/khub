import React, { useState } from "react";
import "../styles/Login.css";
import { useNavigate } from "react-router-dom";
import { login } from "../services/userService";
import { useAuthStore } from "../store";

const Login = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const navigateToReg = () => {
    navigate("/");
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
    <div className="login-body">
      <h1 className="heading">Welcome to KHub</h1>
      <form onSubmit={handleSubmit}>
        <div className="login-container">
          <h2>Log in</h2>
          <input
            className="base-input"
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
          />
          <input
            className="base-input"
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button className="base-button" type="submit">Log in</button>
          <p className="login-reference">
            Don't an Account? <a onClick={navigateToReg}>Register</a>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Login;
