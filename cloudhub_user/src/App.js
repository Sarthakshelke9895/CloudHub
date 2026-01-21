import './App.css';
import { BrowserRouter as Router, Routes, Route,Navigate } from "react-router-dom";
import Login from '../src/Components/Login/Login';
import Landingpage from "../src/Components/Landingpage/Landingpage"
import Register from "../src/Components/Register/Register"
import Dashboard from './Components/Dashboard/Dashboard';
import { isAuthenticated } from "./auth";
import { AlertProvider } from './Components/Alertbox/Alertcontext';

function PrivateRoute({ children }) {
  return isAuthenticated() ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <AlertProvider>
    <Router>
    <Routes>
      <Route path="/" element={<Landingpage/>} />
      <Route path="/login" element={<Login/>} />
      <Route path="/register" element={<Register/>} />
         <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
    

    </Routes>
  </Router>
  </AlertProvider>
  );
}

export default App;
