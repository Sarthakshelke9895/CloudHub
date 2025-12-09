import React, { useState} from "react";
import axios from "axios";
import AlertBox from "../../Components/Alertbox/Alertbox"
import { useNavigate } from 'react-router-dom';




export default function Register() {
  const [data, setData] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    mpin: "",
  });

  const [alert, setAlert] = useState({ message: "", type: "" });
  const navigate = useNavigate();

  const showAlert = (msg, type) => {
    setAlert({ message: msg, type });
    setTimeout(() => setAlert({ message: "", type: "" }), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!data.name || !data.email || !data.password || !data.mpin)
      return showAlert("All fields required", "error");

    if (data.password.length < 6)
      return showAlert("Password must be 6+ chars", "error");

    if (/^([0-9])\1{3}$/.test(data.mpin))
      return showAlert("MPIN cannot be same repeated digits", "error");

    try {
      const res = await axios.post("http://localhost:5000/api/register", data);
      showAlert(res.data.msg, "success");
      navigate('/login')
    } catch (err) {
      showAlert(err.response?.data?.msg || "Error", "error");
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <AlertBox message={alert.message} type={alert.type} />
      
      <form onSubmit={handleSubmit}>
        <input placeholder="Name" onChange={e => setData({...data, name: e.target.value})} />
        <input placeholder="Email" onChange={e => setData({...data, email: e.target.value})} />
        <input placeholder="Mobile" onChange={e => setData({...data, mobile: e.target.value})} />
        <input placeholder="Password" type="password" onChange={e => setData({...data, password: e.target.value})} />
        <input placeholder="MPIN" type="password" onChange={e => setData({...data, mpin: e.target.value})} />
        <button type="submit">Register</button>
      </form>
    </div>
  );
}
