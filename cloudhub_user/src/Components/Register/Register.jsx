import React, {  useState } from "react";
import axios from "axios";
import "./Register.css";
import { useNavigate } from "react-router-dom";

function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    contact: "",
    mpin: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

   const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/register", form);
      alert("Registered Successfully");
      navigate('/login')
    } catch (error) {
      alert("User Exists. Please Login");
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

      {/* Register Card */}
      <div className="auth-card">
        <h2>Create Account</h2>
        <p>Register to get started with CloudHub</p>

        <form onSubmit={handleSubmit}>
          <input
            name="name"
            placeholder="Full Name"
            onChange={handleChange}
            required
          />

          <input
            name="email"
            type="email"
            placeholder="Email Address"
            onChange={handleChange}
            required
          />

          <input
            name="contact"
            placeholder="Contact Number"
            onChange={handleChange}
            required
          />

          <input
            name="mpin"
            type="password"
            placeholder="Create MPIN"
            onChange={handleChange}
            required
          />

          <button type="submit">Register</button>
        </form>
      </div>

      {/* Footer */}
      <footer className="auth-footer">
        © 2025 Cloudhub. All rights reserved
      </footer>
    </div>
  );
}

export default Register;
