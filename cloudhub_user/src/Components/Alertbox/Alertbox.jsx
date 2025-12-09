import React from "react";
import "./Alertbox.css";

export default function Alertbox({ message, type }) {
  if (!message) return null;

  return (
    <div className={`alert ${type}`}>
      {message}
    </div>
  );
}
