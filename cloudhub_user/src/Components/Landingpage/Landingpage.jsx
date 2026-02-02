import React from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api"
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import './Landingpage.css'
import Location from '../../Assests/location.png'
import Telephone from "../../Assests/telephone.png"
import Email from "../../Assests/email.png"
import notess from '../../Assests/notess.png'
import cloudstorage from '../../Assests/cloudcomputing.png'
import cloudsync from '../../Assests/cloudsync.png'
import contactsync from '../../Assests/customer.png'




const LandingPage = () => {
  const navigate = useNavigate();
 React.useEffect(() => {
  const checkAuth = async () => {
    try {
      await api.get("/api/dashboard");
      navigate("/dashboard");
    } catch (err) {
      if (err.response?.status !== 401) {
        console.error(err); // or show toast for real errors
      }
      // do nothing for 401 → stay on landing page
    }
  };
  checkAuth();
}, [navigate]);

  const [result, setResult] = React.useState("");

  const onSubmit = async (event) => {
    event.preventDefault();
    setResult("Sending....");
    const formData = new FormData(event.target);

    formData.append("access_key", "b8e0ac71-fede-41d5-9f1f-0452b45e5eab");

    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      body: formData
    });

    const data = await response.json();

    if (data.success) {
      setResult("Form Submitted Successfully");
      event.target.reset();
    } else {
      console.log("Error", data);
      setResult(data.message);
    }
  };



  return (
    <div className="parentl">
      <Navbar/>
      
      <div id="home" className="childl">
      <h1 id="greeting_landingpage" >Welcome to CloudHub </h1>
      <h3>• Upload files • Sync contacts • Manage notes • Stay connected</h3>
      <button className="ph-btn" onClick={() => navigate("/register")}>
        Get Started
      </button>
      <p>Already Registered ?<button className="loginbtn" onClick={() => navigate("/login")}>Login</button></p>
      </div>




      <div className="nav-sections">
       
      <section id="features" className="section">
  <h2 className="section-title">Features we offer...</h2>

  <div className="features-grid">
    <div className="feature-card">
      <div className="logo_and_heading">
      <img src={cloudstorage} alt="" className="feature-logo" />
      <h3>Secure Storage</h3>
      </div>
      
      
      <p>Your files are encrypted and safely stored in the cloud.</p>
    </div>

    <div className="feature-card">
      <div className="logo_and_heading">
      <img src={contactsync} alt=""   className="feature-logo"/>
      <h3>Contacts</h3>
      </div>
      
      <p>Access your contacts anytime across devices.</p>
    </div>

    <div className="feature-card">
      <div className="logo_and_heading">
         <img src={cloudsync} alt=""  className="feature-logo" />
      <h3>Automatic Backup </h3>
      </div>
     
      <p>Automatic Data backup of phone, to enjoy free space</p>
    </div>

    <div className="feature-card">
       <div className="logo_and_heading">
       <img src={notess} alt=""  className="feature-logo" />
      <h3>Cloud Notes</h3>
      </div>
     
      <p>Create and access notes anywhere, anytime.</p>
    </div>
  </div>
</section>
<section id="about" className="section ">
    <h2 className="section-title">About CloudHub</h2>
     <p>
    CloudHub is a modern cloud platform built to simplify your digital life.
    It centralizes storage, communication, and personal data management into
    one secure ecosystem.
    CloudHub integrates multiple services traditionally handled by separate apps
    into one smooth, cohesive experience. Users can upload and share files,
    sync contacts, track calls, and manage notes without switching platforms.
    In today's fast-paced digital world, users often struggle to manage files,
    contacts, calls, and notes spread across multiple apps. CloudHub solves
    this problem by bringing everything under one secure platform.
  
    Our goal is to reduce digital clutter, improve productivity, and give
    users peace of mind knowing all their essential data is secure, backed up,
    and accessible anywhere, anytime.
  
  </p>



  {/* Vision */}
  <div className="cards">
      <div className="about-card">
    <h3>Our Vision</h3>
    <p>
      To create a seamless digital experience where all your data and
      communications are unified, accessible, and secure across any device.
    </p>
  </div>

  {/* Mission */}
  <div className="about-card">
    <h3>Our Mission</h3>
    <p>
      To empower users by providing an intuitive, reliable, and encrypted
      cloud platform that combines file storage, contact syncing, call
      management, and note-taking in one place.
    </p>
  </div>

  {/* Core Values */}
  <div className="about-card">
    <h3>Our Core Values</h3>
    <ul>
      <li>Security & Privacy – Your data is fully encrypted and protected.</li>
      <li>Seamless Experience – Access everything easily from any device.</li>
      <li>Innovation – Continuously improving cloud technology.</li>
      <li>Reliability – Always available when you need it most.</li>
    </ul>
  </div>
  </div>




  
</section>
<section id="contact" className="section">
  <h2 className="section-title">Contact Us</h2>

<div className="columns">
         <div className="contact_col1 ">
        <h3>Send us a message <img  alt="" srcSet="" /></h3>
        <p>Feel free to reach out through contact from or find our contact
          information below. Your feedback, questions,and suggestions,are important
         to us as we strive to provide exceptional service to our university community
        </p>
        <ul>
          <li><img src={Email} alt=""  className="contact_icons"/>cloudhubbb.org@gmail.com  </li>
          <li> <img src={Telephone} alt=""className="contact_icons" />+91 9123456789</li>
          <li><img   src={Location} alt="" className="contact_icons" />CloudHub Technologies Pvt. Ltd.</li>
        </ul>
      </div>

      <div className="contact_col2">
        <form onSubmit={onSubmit}>
          <label>Your Name</label>
          <input type="text" name='name' placeholder='Enter your name' required/>

          <label>Phone Number</label>
          <input type="tel" name='phone' maxLength="10" pattern="\d{5,10}"  placeholder='Enter your Mobile No.' required/>

          <label>Write your messages here</label>
          <textarea name="message" rows="6" placeholder='Enter your Message Here'  required></textarea>

          <button type='submit' className='btn'>Submit <img  alt="" /></button>
          
        </form>
        <span>{result}</span>
      </div>
</div>


</section>


      </div>
      <Footer/>
    </div>
  );
};

export default LandingPage;
