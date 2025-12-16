import React, { useEffect, useState } from "react";
import api from "../../api";
import { useNavigate } from "react-router-dom";
import './Dashboard.css'

const Dashboard = () => {
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/api/dashboard");
        setMessage(res.data.message);
      } catch {
        navigate("/login");
      }
    };

    load();
  }, [navigate]);

  const logout = async () => {
    await api.post("/api/logout");
    navigate("/login");
  };

  return (
    <div className="parent">
      <div className="navbar">
        <div className="cloudhub_logo">
          <h1>Cloud</h1>
          <div className="hub">
            <h1>hub</h1>
          </div>
        </div>
      </div>
      <div className="child">
      <h2>{message}</h2>
      <button onClick={logout}>Logout</button>
      </div>
    </div>
  );
};

export default Dashboard;
