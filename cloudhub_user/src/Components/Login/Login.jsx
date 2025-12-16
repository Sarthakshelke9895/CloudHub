import React, { useState } from "react";
import api from "../../api";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const Login = () => {
  const [form, setForm] = useState({ email: "", mpin: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/api/login", form);
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (err) {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="auth-page">
      {/* Header */}
      <header className="auth-header">
        <h1>
          Cloud<span>hub</span>
        </h1>
      </header>

      {/* Login Card */}
      <div className="login-wrapper">
        <div className="login-card">
          <h2>Welcome Back</h2>
          <p>Login to continue to CloudHub</p>

          <form onSubmit={handleSubmit}>
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
            />

            <input
              name="mpin"
              type="password"
              placeholder="MPIN"
              value={form.mpin}
              onChange={handleChange}
              required
            />

            <button type="submit">Login</button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="auth-footer">
        © 2025 Cloudhub. All rights reserved
      </footer>
    </div>
  );
};

export default Login;
