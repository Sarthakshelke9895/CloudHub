import React, { useEffect, useState } from "react";
import "./Alertbox.css";

const Alertbox = ({ message, type, duration = 3000, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      // trigger slide-in after mounting
      const showTimer = setTimeout(() => setVisible(true), 10);

      const hideTimer = setTimeout(() => {
        setVisible(false);
        // remove after animation
        setTimeout(onClose, 500);
      }, duration);

      return () => {
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div className={`alert ${type} ${visible ? "slide-in" : "slide-out"}`}>
      <span className="alert-message">{message}</span>
      <button
        className="close-btn"
        onClick={() => {
          setVisible(false);
          setTimeout(onClose, 500);
        }}
      >
        &times;
      </button>
      <div
        className="progress-bar"
        style={{ animationDuration: `${duration}ms` }}
      ></div>
    </div>
  );
};

export default Alertbox;
