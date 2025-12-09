import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; // for decoding JWT

const Dashboard = () => {
  const navigate = useNavigate();

  // Auto logout when token expires
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    const decoded = jwtDecode(token);
    const exp = decoded.exp * 1000; // convert to milliseconds
    const timeout = exp - Date.now();

    if (timeout <= 0) {
      localStorage.removeItem("token");
      navigate("/login");
    } else {
      const timer = setTimeout(() => {
        alert("Session expired");
        localStorage.removeItem("token");
        navigate("/login");
      }, timeout);

      return () => clearTimeout(timer);
    }
  }, [navigate]);

  // Manual logout function
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome to your dashboard!</p>
      <button
        onClick={handleLogout}
        style={{
          padding: "10px 20px",
          backgroundColor: "#ff4d4f",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Logout
      </button>
    </div>
  );
};

export default Dashboard;
