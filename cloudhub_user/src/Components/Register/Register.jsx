import React, { useRef, useState } from "react";
import "./Register.css";
import { useNavigate } from "react-router-dom";
import { useAlert } from "../Alertbox/Alertcontext";
import api from "../../api";

function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    contact: "",
    mpin: ""
  });
  const { showAlert } = useAlert();

  const [mpin, setMpin] = useState(["", "", "", ""]);
  const [showMpin, setShowMpin] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // NEW

  const inputsRef = useRef([]);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

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
      showAlert("Please enter 4-digit MPIN");
      return;
    }

    setIsSubmitting(true); // DISABLE BUTTON

    try {
      await api.post("/api/register", {
        ...form,
        mpin: finalMpin
      });
      showAlert("Registered Successfully!", "success", 2000);
      navigate("/login");
    } catch (error) {
      showAlert("User Exists", "info", 2000);
    } finally {
      setIsSubmitting(false); // ENABLE BUTTON if needed
    }
  };

  const handlelogoclick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    window.location.reload();
  };

  return (
    <div className="auth-page">
      <header className="auth-header-register" onClick={handlelogoclick}>
        <h1>
          Cloud<span>hub</span>
        </h1>
      </header>

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
            inputMode="numeric"
            maxLength="10"
            name="contact"
            placeholder="Contact Number"
            onChange={handleChange}
            required
          />

          <p id="enter_mpin_text">Enter M-Pin</p>
          <div className="mpin-box">
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

          <div className="show_mpin">
            <input
              type="checkbox"
              id="showMpin"
              onChange={() => setShowMpin(!showMpin)}
            />
            <p id="show_mpin_text">Show M-Pin</p>
          </div>

          {/* BUTTON with dynamic text */}
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Processing" : "Register"}
          </button>

          <p className="already_registered">
            Already registered?{" "}
            <span
              onClick={() => navigate("/login")}
              style={{ cursor: "pointer", color: "white" }}
            >
              Login
            </span>
          </p>
        </form>
      </div>

      <footer className="auth-footer">
        © 2025 Cloudhub. All rights reserved
      </footer>
    </div>
  );
}

export default Register;
