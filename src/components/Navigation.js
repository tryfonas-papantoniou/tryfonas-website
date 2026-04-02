"use client";
import { useState, useEffect } from "react";
import ThemeToggle from "./ThemeToggle";

export default function Navigation() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const handleNavClick = () => {
    setMenuOpen(false);
  };

  return (
    <>
      <nav>
        <a href="#" className="nav-logo">
          T<span>.</span>P
        </a>
        <ul className="nav-links">
          <li><a href="#about">About</a></li>
          <li><a href="#projects">Projects</a></li>
          <li><a href="#skills">Skills</a></li>
          <li><a href="#education">Education</a></li>
          <li><a href="#contact" className="nav-cta">Get in Touch</a></li>
          <li><ThemeToggle /></li>
        </ul>
        <div className="nav-right-mobile">
          <ThemeToggle />
          <button
            className={`menu-btn ${menuOpen ? "open" : ""}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>

      <div className={`mobile-nav ${menuOpen ? "open" : ""}`}>
        <a href="#about" onClick={handleNavClick}>About</a>
        <a href="#projects" onClick={handleNavClick}>Projects</a>
        <a href="#skills" onClick={handleNavClick}>Skills</a>
        <a href="#education" onClick={handleNavClick}>Education</a>
        <a href="#contact" onClick={handleNavClick}>Get in Touch</a>
      </div>
    </>
  );
}
