
import { useState, useEffect, useRef } from "react";
import { Outlet, Link } from "react-router-dom";

const PublicLayout = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const menuRef = useRef(null);
  const toggleRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event) => {
      const clickedInsideMenu =
        menuRef.current?.contains(event.target);

      const clickedToggle =
        toggleRef.current?.contains(event.target);

      if (!clickedInsideMenu && !clickedToggle) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", handleOutsideClick);

    return () => {
      document.removeEventListener(
        "pointerdown",
        handleOutsideClick
      );
    };
  }, []);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <div className="public-layout">

      <header className="site-header">
        <nav className="navbar container">

          {/* HAMBURGER ICON */}
          <button
            ref={toggleRef}
            type="button"
            className={`menu-toggle ${menuOpen ? "menu-active" : ""}`}
            onClick={() => setMenuOpen((previous) => !previous)}
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          {/* UNFAZED LOGO */}
          <Link
            to="/"
            className="navbar-logo"
            onClick={closeMenu}
          >
            Unfazed<span>.</span>
          </Link>

          {/* DESKTOP NAVIGATION */}
          <div className="nav-links">
            <Link to="/" onClick={closeMenu}>Home</Link>
            <Link to="/about" onClick={closeMenu}>About</Link>
            <Link to="/services" onClick={closeMenu}>Services</Link>
          </div>

          {/* LOGIN AND REGISTER */}
          <div className="nav-actions">
            <Link
              to="/login"
              className="nav-login"
              onClick={closeMenu}
            >
              Login
            </Link>

            <Link
              to="/register"
              className="nav-cta"
              onClick={closeMenu}
            >
              Register
            </Link>
          </div>

          {/* MOBILE DROPDOWN - NO BRAND HEADING */}
          <div
            ref={menuRef}
            className={`mobile-nav-panel ${
              menuOpen ? "mobile-menu-open" : ""
            }`}
          >
            <Link to="/" onClick={closeMenu}>
              Home
            </Link>

            <Link to="/about" onClick={closeMenu}>
              About
            </Link>

            <Link to="/services" onClick={closeMenu}>
              Services
            </Link>
          </div>

        </nav>
      </header>

      <main>
        <Outlet />
      </main>

      {/* FOOTER */}
      <footer className="site-footer">
        <div className="container">
          <div className="footer-main">

            {/* BRAND */}
            <div className="footer-brand">
              <Link to="/" className="footer-logo">
                Unfazed<span>.</span>
              </Link>

              <p>
                A thoughtful space to connect with professionals,
                explore support and take your next step towards
                mental wellbeing.
              </p>

              <Link to="/register" className="footer-cta">
                Begin Your Journey →
              </Link>
            </div>

            {/* EXPLORE */}
            <div className="footer-column">
              <h3>Explore</h3>
              <Link to="/">Home</Link>
              <Link to="/about">About Us</Link>
              <Link to="/services">Our Services</Link>
              <Link to="/#support">Support Areas</Link>
            </div>

            {/* PLATFORM */}
            <div className="footer-column">
              <h3>Platform</h3>
              <Link to="/#therapists">Find Therapists</Link>
              <Link to="/#how-it-works">How It Works</Link>
              <Link to="/#faq">FAQs</Link>
              <Link to="/login">Client Login</Link>
            </div>

            {/* GET STARTED */}
            <div className="footer-column footer-connect">
              <h3>Your Next Step</h3>
              <p>
                You don't have to figure everything out today.
                Explore your options whenever you're ready.
              </p>

              <Link to="/register" className="footer-register">
                Get Started →
              </Link>
            </div>

          </div>

          <div className="footer-bottom">
            <p>© 2026 Unfazed. All rights reserved.</p>
            <span>Thoughtful support. Your pace. Your journey.</span>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default PublicLayout;
