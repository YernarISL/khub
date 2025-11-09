import React from "react";
import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Registration.css";

const Registration = () => {
  const navigate = useNavigate();

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await axios.post(
        "http://localhost:5000/api/registration",
        formData
      );
      setMessage(response.data.message);

      if (response.data.message === "User successfully registered") {
        navigate("/home");
      }

    } catch (error) {
      console.error("Error registering user:", error);
      setMessage("An error occurred while registering");
    }
  };

  return (
    <div className="reg-body">
      <form onSubmit={handleSubmit} className="reg-form">
        <h1 className="heading">Welcome to KHub</h1>
        <div className="reg-container">
          <h2>Sign in</h2>
          <input
            className="base-input"
            type="text"
            name="firstName"
            placeholder="First name"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
          <input
            className="base-input"
            type="text"
            name="secondName"
            placeholder="Second name"
            value={formData.secondName}
            onChange={handleChange}
            required
          />
          <input
            className="base-input"
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
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
          <button className="base-button" type="submit">
            Sign in
          </button>
          {message && <p className="response-message">{message}</p>}
        </div>
      </form>
    </div>
  );
};

export default Registration;
