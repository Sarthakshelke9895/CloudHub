import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from '../src/Components/Login/Login';
import Landingpage from "../src/Components/Landingpage/Landingpage"
import Register from "../src/Components/Register/Register"
import Dashboard from './Components/Dashboard/Dashboard';
import Files from '../src/Components/Files/Hero'

function App() {
  return (
    <Router>
    <Routes>
      <Route path="/" element={<Landingpage/>} />
      <Route path="/login" element={<Login/>} />
      <Route path="/register" element={<Register/>} />
      <Route path="/dashboard" element={<Dashboard/>} />
      <Route path="/files" element={<Files/>} />

    </Routes>
  </Router>
  );
}

export default App;
