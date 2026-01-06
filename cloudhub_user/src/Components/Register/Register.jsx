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

  const inputsRef = useRef([]);
  const navigate = useNavigate();

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
      showAlert("Please enter 4-digit MPIN");
      return;
    }

    try {
      await api.post("/api/register", {
        ...form,
        mpin: finalMpin
      });
      showAlert("Registered Successfully!","success",2000)
      navigate("/login");
    } catch (error) {
          showAlert("User Exists","info",2000);
    }
  };
  
  const handlelogoclick = () => {
    // Navigate to home
   
    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
    // Optional: force refresh if needed
     window.location.reload();
  };

  return (
    <div className="auth-page">
      <header className="auth-header-register" onClick={handlelogoclick} >
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
            name="contact"
            placeholder="Contact Number"
            onChange={handleChange}
            required
          />
          <p id="enter_mpin_text">Enter M-Pin</p>
          {/* MPIN BOXES */}
          <div className="mpin-box">
            {mpin.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputsRef.current[index] = el)}
                type={showMpin ? "text" : "password"}
                maxLength={1}
                inputMode="number"
                value={digit}
                onChange={(e) => handleMpinChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                required
              />
            ))}
          </div>
          <div className="show">
          <input
            type="checkbox"
            id="showMpin"
            onChange={() => setShowMpin(!showMpin)}
          />
          <p id="show_mpin_text">Show M-Pin</p>
        </div>


          <button type="submit">Register</button>

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
