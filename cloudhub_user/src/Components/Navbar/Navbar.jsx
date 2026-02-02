import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-scroll";
import "./Navbar.css";

const Navbar = () => {
  const [sticky, setSticky] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setSticky(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navigate = useNavigate();

  const handlelogoclick = () => {
    navigate("/", { replace: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
    setMenuOpen(false);
  };
 

  return (
    <nav className={`navbar ${sticky ? "dark_nav" : ""}`}>
      {/* LOGO */}
      <div className="auth-header" onClick={handlelogoclick}>
        <h1>
          Cloud<span>hub</span>
        </h1>
      </div>

      {/* TOGGLE BUTTON */}
      <div className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
        ☰
      </div>

      {/* LINKS */}
<div className={`nav-links ${menuOpen ? "active" : ""}`}>
  <Link
    to="home"
    smooth
    duration={500}
    offset={window.innerWidth > 768 ? -300 : -65} // desktop vs mobile offset
    className="nav-link"
    onClick={() => setMenuOpen(false)}
  >
     Home
  </Link>

  <Link
    to="features"
    smooth
    duration={500}
    offset={window.innerWidth > 768 ? -78 : -55}
    className="nav-link"
    onClick={() => setMenuOpen(false)}
  >
     Features
  </Link>

  <Link
    to="about"
    smooth
    duration={500}
    offset={window.innerWidth > 768 ? -73 : -60}
    className="nav-link"
    onClick={() => setMenuOpen(false)}
  >
     About
  </Link>

  <Link
    to="contact"
    smooth
    duration={500}
    offset={window.innerWidth > 768 ? -70 : -65}
    className="nav-link"
    onClick={() => setMenuOpen(false)}
  >
     Contact
  </Link>
</div>

    </nav>
  );
};

export default Navbar;
