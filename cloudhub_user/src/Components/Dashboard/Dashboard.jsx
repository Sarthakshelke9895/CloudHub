import React, { useEffect, useState } from "react";
import api from "../../api";
import { useNavigate } from "react-router-dom";
import './Dashboard.css'
import Telephone from "../../Assests/telephone.png"
import Email from "../../Assests/email.png"
import User from "../../Assests/user.png"

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
  await api.post("/api/logout", {}, { withCredentials: true }); // ✅ add withCredentials
  navigate("/login");
};

     const [user, setUser] = useState(null);

  useEffect(() => {
    api.get("/api/dashboard", { withCredentials: true })
      .then(res => setUser(res.data))
      .catch(err => console.error(err));
  }, []);

  if (!user) return <div>Loading...</div>;

  return (
    <div className="parent">
      <div className="dashboard_navbar">
      <div className="auth-header">
        <h1>
          Cloud<span>hub</span>
        </h1>
      </div>
    <div className="avatar-container">
    <div className="avatar-circle"><p id="username_profile">{user?.name?.[0] || "?"}</p></div>
      <div className="avatar-tooltip">
        <div className="tooltip_row">
        <img src={User} alt="Profile Logo" className="tooltip_logo" />  {user?.name} <br />
        </div>
        
        <div className="tooltip_row">
          <img src={Email} alt="Email Logo" className="tooltip_logo" /> {user?.email} <br />
        </div>
        <div className="tooltip_row">
          <img src={Telephone} alt="Telephone Logo" className="tooltip_logo" />  {user?.contact}
        </div>
      </div>
    </div>  
           <button className="Button" onClick={logout}>Logout</button>
      </div>
      <div className="child_dashboard">
      <h2>{message} Welcome , {user?.name}</h2>
        

      </div>
    </div>
  );
};

export default Dashboard;
