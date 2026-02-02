import React, { useEffect, useState } from "react";
import api from "../../api";
import { useNavigate } from "react-router-dom";
import './Dashboard.css'
import Telephone from "../../Assests/telephone.png"
import Email from "../../Assests/email.png"
import User from "../../Assests/user.png"
import File from "../File/File";
import Contact from "../Contact/Contact";
import Note from "../Note/Note";
import Sync from "../Sync/Sync";

import notes from '../../Assests/notess.png'
import telephone from '../../Assests/telephone.png'
import cloud from '../../Assests/cloudcomputing.png'
import autosync from '../../Assests/cloudsync.png'

const Dashboard = () => {
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const [active,setActive]=useState(()=>localStorage.getItem("active")||"file"); useEffect(()=>localStorage.setItem("active",active),[active]);


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
  await api.post("/api/logout", {}, { withCredentials: true });

  // clear client state
  localStorage.clear();
  sessionStorage.clear();

  // hard redirect → clears history stack
  window.location.replace("/"); // ✅ base URL, no back navigation
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
    <div className="avatar-circle"><p id="username_pro">{user?.name?.[0] || "?"}</p></div>
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
      <button className="Button" onClick={logout}>Logout</button>
    </div>  
           
      </div>
      <div className="child_dashboard">
      <h2>{message}Hi,{user?.name}</h2>
      </div>

      <div className="card_dashboard">
        <div className={`card ${active === "file" ? "active" : ""}`}
          onClick={() => setActive("file")}>
          <img src={cloud} alt="cloud-logo" className="dashboard_buttons_logo" />
          <h2>Files</h2>
          
        </div>

        <div className={`card ${active === "contact" ? "active" : ""}`}
          onClick={() => setActive("contact")}>
          <img src={telephone} alt="contact-logo"  className="dashboard_buttons_logo" />   
          <h2>Contact</h2>
          
        </div>

        <div className={`card ${active === "note" ? "active" : ""}`}
          onClick={() => setActive("note")}>
          <img src={notes} alt="notes-logo" className="dashboard_buttons_logo" />
          <h2>Notes</h2>
 
          
        </div>

        <div className={`card ${active === "sync" ? "active" : ""}`} 
          onClick={() => setActive("sync")}>
          <img src={autosync} id="sync_logo" alt="sync-logo" className="dashboard_buttons_logo" />
          <h2>Sync</h2>
          
        </div>
      </div>


      <div className="components_dashboard">
     
      {active === "file" && <File/>}
      {active === "contact" && <Contact/>}
      {active === "note" && <Note/>}
      {active === "sync" && <Sync/>}
      </div>
    </div>
  );
};

export default Dashboard;
