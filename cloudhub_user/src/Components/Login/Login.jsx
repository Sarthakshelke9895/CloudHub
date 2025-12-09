import React, { useState } from "react";
import axios from "axios";
import AlertBox from "../../Components/Alertbox/Alertbox"
import { useNavigate } from 'react-router-dom';


export default function Login() {
  const [data, setData] = useState({ email: "", password: "", mpin: "" });
  const [alert, setAlert] = useState({ message: "", type: "" });
  const navigate = useNavigate();

  const showAlert = (msg, type) => {
    setAlert({ message: msg, type });
    setTimeout(() => setAlert({ message: "", type: "" }), 2500);
  };

  const loginUser = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/login", data);
      localStorage.setItem("token", res.data.token);
      showAlert("Login Successful", "success");
      console.log(res.data.token);
      navigate('/dashboard')
      console.log(data)
    } catch (err) {
      showAlert("Invalid credentials", "error");
    }
  };

  return (
    <div>
      <h2>Login</h2>

      <AlertBox message={alert.message} type={alert.type} />

      <form onSubmit={loginUser}>
        <input placeholder="Email" onChange={e => setData({...data, email: e.target.value})} />
        <input placeholder="Password" type="password" onChange={e => setData({...data, password: e.target.value})} />
        <input placeholder="MPIN" type="password" onChange={e => setData({...data, mpin: e.target.value})} />
        <button>Login</button>
      </form>
    </div>
  );
}
