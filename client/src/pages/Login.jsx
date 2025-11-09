import React from "react";
import "../styles/Login.css";

const Login = () => {
    return (
        <div className="login-body">
            <h1 className="heading">Welcome to KHub</h1>
            <div className="login-container">
                <h2>Log in</h2>
                <input className="base-input" type="text" placeholder="Username"/>
                <input className="base-input" type="password" placeholder="Password"/>
                <button className="base-button">Log in</button>
            </div>
        </div>
    )
}

export default Login;