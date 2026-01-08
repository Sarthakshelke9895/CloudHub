import React, { useRef, useState } from "react";
import "./Register.css";
import { useNavigate } from "react-router-dom";
import { useAlert } from "../Alertbox/Alertcontext";
import api from "../../api";

function Register() {
  const [form, setForm] = useState({ name: "", email: "", contact: "" });
  const { showAlert } = useAlert();

  const [mpin, setMpin] = useState(["", "", "", ""]);
  const [showMpin, setShowMpin] = useState(false);

  const [otp, setOtp] = useState(["", "", "", ""]);
  const [otpVisible, setOtpVisible] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const [otpLoading, setOtpLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const mpinRefs = useRef([]);
  const otpRefs = useRef([]);
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

    if (value && index < 3) mpinRefs.current[index + 1].focus();

    if (newMpin.every((d) => d !== "")) setOtpVisible(true);
    else setOtpVisible(false);
  };

  const handleMpinKeyDown = (e, index) => {
    if (e.key === "Backspace" && !mpin[index] && index > 0)
      mpinRefs.current[index - 1].focus();
  };
  // SEND OTP via WhatsApp
const sendOtpWhatsapp = async () => {
  if (!form.contact) {
    showAlert("Enter phone number to receive OTP via WhatsApp");
    return;
  }

  setOtpLoading(true);
  try {
    const res = await api.post("/api/send-otp-whatsapp", { phone: form.contact });
    const { whatsappLink } = res.data;

    // Open WhatsApp link in new tab
    window.open(whatsappLink, "_blank");

    showAlert("OTP link opened in WhatsApp. Enter OTP here.", "success", 2000);
    setOtpSent(true);
  } catch {
    showAlert("Failed to send OTP via WhatsApp", "error", 2000);
  } finally {
    setOtpLoading(false);
  }
};

// VERIFY OTP
const verifyOtpWhatsapp = async () => {
  const finalOtp = otp.join("");
  if (finalOtp.length !== 4) {
    showAlert("Enter 4-digit OTP");
    return;
  }

  setVerifyLoading(true);
  try {
    await api.post("/api/verify-otp-whatsapp", {
      phone: form.contact,
      otp: finalOtp,
    });
    showAlert("OTP Verified! Click Register.", "success", 2000);
    setOtpVerified(true);
  } catch {
    showAlert("Invalid OTP", "error", 2000);
    setOtpVerified(false);
  } finally {
    setVerifyLoading(false);
  }
};


// OTP input logic
const handleOtpChange = (e, index) => {
  const value = e.target.value;
  if (!/^\d?$/.test(value)) return;

  const newOtp = [...otp];
  newOtp[index] = value;
  setOtp(newOtp); // or updateOtp(newOtp)

  if (value && index < 3) otpRefs.current[index + 1].focus();
};

const handleOtpKeyDown = (e, index) => {
  if (e.key === "Backspace" && !otp[index] && index > 0)
    otpRefs.current[index - 1].focus();
};


  // REGISTER
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!otpVerified) {
      showAlert("Please verify OTP first", "info", 2000);
      return;
    }

    const finalMpin = mpin.join("");
    if (finalMpin.length !== 4) {
      showAlert("Please enter 4-digit MPIN");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post("/api/register", { ...form, mpin: finalMpin });
      showAlert("Registered Successfully!", "success", 2000);
      navigate("/login");
    } catch {
      showAlert("User Exists", "info", 2000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <header className="auth-header-register">
        <h1>
          Cloud<span>hub</span>
        </h1>
      </header>

      <div className="auth-card">
        <h2>Create Account</h2>
        <p>Register to get started with CloudHub</p>

        <form onSubmit={handleSubmit}>
          <input name="name" placeholder="Full Name" onChange={handleChange} required />
          <input name="email" type="email" placeholder="Email Address" onChange={handleChange} required />
          <input inputMode="numeric" maxLength="10" name="contact" placeholder="Contact Number" onChange={handleChange} required />

          <p id="enter_mpin_text">Enter M-Pin</p>
          <div className="mpin-box">
            {mpin.map((digit, i) => (
              <input
                key={i}
                ref={(el) => (mpinRefs.current[i] = el)}
                type={showMpin ? "text" : "password"}
                maxLength={1}
                inputMode="numeric"
                value={digit}
                onChange={(e) => handleMpinChange(e, i)}
                onKeyDown={(e) => handleMpinKeyDown(e, i)}
                required
              />
            ))}
          </div>

          <div className="show_mpin">
            <input type="checkbox" onChange={() => setShowMpin(!showMpin)} />
            <p>Show M-Pin</p>
          </div>

          {/* GET OTP */}
            {otpVisible && !otpSent && (
              <button type="button" onClick={sendOtpWhatsapp} disabled={otpLoading}>
                {otpLoading ? "Sending OTP..." : "Get OTP via WhatsApp"}
              </button>
            )}

            {/* VERIFY OTP */}
            {otpSent && !otpVerified && (
              <>
                <p id="enter_otp">Enter OTP</p>
                <div className="mpin-box">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => (otpRefs.current[i] = el)}
                      type="text"
                      maxLength={1}
                      inputMode="numeric"
                      value={digit}
                      onChange={(e) => handleOtpChange(e, i)}
                      onKeyDown={(e) => handleOtpKeyDown(e, i)}
                      required
                    />
                  ))}
                </div>

                <button type="button" onClick={verifyOtpWhatsapp} disabled={verifyLoading}>
                  {verifyLoading ? "Verifying..." : "Verify OTP"}
                </button>
              </>
            )}

          {/* REGISTER */}
          <button
            id="register_button"
            type="submit"
            disabled={!otpVerified || isSubmitting}
          >
            {isSubmitting ? "Registering..." : "Register"}
          </button>

          <p className="already_registered">
            Already registered?{" "}
            <span onClick={() => navigate("/login")} style={{ cursor: "pointer", color: "white" }}>
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
