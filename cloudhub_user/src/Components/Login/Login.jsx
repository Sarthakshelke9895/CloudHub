import React, { useRef, useState } from "react";
import api from "../../api";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import { useAlert } from "../Alertbox/Alertcontext";

const Login = () => {
  const [form, setForm] = useState({ login: "", mpin: "" });
  const [mpin, setMpin] = useState(["", "", "", ""]);
  const [showMpin, setShowMpin] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // ✅ new state

  const inputsRef = useRef([]);
  const navigate = useNavigate();
  const { showAlert } = useAlert();

 const handleChange = (e) => {
  const { name, value } = e.target;
  setForm({ ...form, [name]: value });
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
      showAlert("Enter 4-digit MPIN","info",2000);
      return;
    }

    setIsSubmitting(true); // ✅ disable button

    try {
      const res = await api.post("/api/login", {
        ...form,
        mpin: finalMpin,
      });
      localStorage.setItem("token", res.data.token);
      console.log(res.data.token);
      navigate("/dashboard");
      showAlert(res.data.message,"success",2000);
    } catch (err) {
       const message =
        err.response?.data?.message || "Login failed"; // e.g., "User not found" or "Wrong MPIN"
         showAlert(message, "error", 2000); // show in alert
    } finally {
      setIsSubmitting(false); // ✅ enable if needed
    }
  };

  const handlelogoclick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    window.location.reload();
  };

  return (
    <div className="auth-page">
      <header className="auth-header-login" onClick={handlelogoclick}>
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
                name="login"
                type="text"
                placeholder="Email  or Phone "
                value={form.login}
                onChange={handleChange}
                required
              />

              <p id="enter_mpin_text_login">Enter M-Pin</p>
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

              <div className="show_mpin">
                <input
                  type="checkbox"
                  checked={showMpin}
                  onChange={(e) => setShowMpin(e.target.checked)}
                />
                <p>Show M-Pin</p>
              </div>

              {/* ✅ Dynamic button text */}
              <button type="submit" disabled={isSubmitting}
                style={{
                backgroundColor: isSubmitting ? "#aaa" : "#f5a200", // gray when submitting
                color: isSubmitting ? "#555" : "#000",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                transition: "0.3s",
              }}
              >
                {isSubmitting ? "Logging you in..." : "Login"}
              </button>
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
