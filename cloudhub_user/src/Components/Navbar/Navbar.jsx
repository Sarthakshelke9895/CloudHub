import React, { useEffect, useState } from "react";
import { Link } from "react-scroll";
import "./Navbar.css";

const Navbar = () => {
  const [sticky, setSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setSticky(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`navbar ${sticky ? "dark_nav" : ""}`}>
      {/* LOGO */}
      <div className="auth-header">
        <h1>
          Cloud<span>hub</span>
        </h1>
      </div>

      {/* LINKS */}
      <div className="nav-links">
        <Link to="home" smooth duration={500} offset={-300} className="nav-link">
          Home
          <span className="underline"></span>
        </Link>

        <Link to="features" smooth duration={500} offset={-150} className="nav-link">
          Features
          <span className="underline"></span>
        </Link>

        <Link to="about" smooth duration={500} offset={-75} className="nav-link">
          About
          <span className="underline"></span>
        </Link>

        <Link to="contact" smooth duration={500} offset={-70} className="nav-link">
          Contact
          <span className="underline"></span>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
