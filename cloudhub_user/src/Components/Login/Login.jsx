import React, { useRef, useState } from "react";
import api from "../../api";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import { useAlert } from "../Alertbox/Alertcontext";


const Login = () => {
  const [form, setForm] = useState({ email: "", mpin: "" });
  const [mpin, setMpin] = useState(["", "", "", ""]);
  const [showMpin, setShowMpin] = useState(false);
  const inputsRef = useRef([]);
  const navigate = useNavigate();
  const { showAlert } = useAlert();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // MPIN logic
  const handleMpinChange = (e, index) => {
    const value = e.target.value;
    if (!/^\d?$/.test(value)) return;

    const newMpin = [...mpin];
    newMpin[index] = value;
    setMpin(newMpin);

    if (value && index < mpin.length - 1) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !mpin[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const finalMpin = mpin.join("");
    if (finalMpin.length !== 4) {
      showAlert("Enter 4-digit MPIN");
      return;
    }

    try {
      const res = await api.post("/api/login", {
        ...form,
        mpin: finalMpin
      });
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (err) {
      showAlert("Invalid credentials","error",2000);
    }
  };

  return (
    <div className="auth-page">
      <header className="auth-header-login">
        <h1>
          Cloud<span>hub</span>
        </h1>
      </header>

      <div className="login-wrapper">
         <div className="login-card">
        <div className="randomcenter">
                 
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

            <p id="enter_mpin_text_login">Enter M-Pin</p>
            {/* MPIN BOXES */}
            <div className="mpin-box-login">
              {mpin.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputsRef.current[index] = el)}
                  type={showMpin ? "text" : "password"}
                  maxLength={1}
                  inputMode="numeric"
                  value={digit}
                  onChange={(e) => handleMpinChange(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  required
                />
              ))}
            </div>

            {/* Show MPIN */}
            <div className="show">
              <input
                type="checkbox"
                checked={showMpin}
                onChange={(e) => setShowMpin(e.target.checked)}
              />
              <p>Show M-Pin</p>
            </div>

            <button type="submit">Login</button>
          </form>
        </div>
        </div>

      </div>

      <footer className="auth-footer">
        © 2025 Cloudhub. All rights reserved
      </footer>
    </div>
  );
};

export default Login;
