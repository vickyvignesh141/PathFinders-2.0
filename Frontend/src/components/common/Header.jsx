import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./Header.module.css";
import StudentNavbar from "../Navbar/StudentNavbar";

const NAV_ITEMS = [
  { label: "Profile", value: "/student/profile" },
  { label: "Leaderboard", value: "/student/leaderboard" },
  { label: "History", value: "/student/history" },
  { label: "Certificate", value: "/student/certificate" },
];

const Header = ({
  title = "Student Dashboard",
  userName = "Gomagan R",
  userRole = "Student",
  notificationCount = 0,
  onLogout,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  // Close on outside click or Escape
  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const handleKey = (e) => e.key === "Escape" && setOpen(false);

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  const handleNavigate = (path) => {
    setOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    setOpen(false);
    if (onLogout) onLogout();
    else navigate("/"); // change to your login route
  };

  const initial = userName?.trim()?.charAt(0)?.toUpperCase() || "U";

  return (
    <header className={styles.header}>
      {/* LEFT */}
      <div className={styles.left}>
        <div className={styles.logo}>
          <span>M</span>
        </div>
        <div className={styles.brand}>
          <h2>MAATRAM</h2>
          <p>Volunteering portal</p>
        </div>
      </div>

      {/* CENTER */}
      <div className={styles.center}>
        <h2>{title}</h2>
      </div>

      {/* RIGHT */}
      <div className={styles.right}>
        <button className={styles.bellBtn} aria-label="Notifications">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.7 21a2 2 0 0 1-3.4 0" />
          </svg>
          {notificationCount > 0 && (
            <span className={styles.badge}>{notificationCount}</span>
          )}
        </button>

        <div className={styles.userMenu} ref={menuRef}>
          <button
            className={styles.userPill}
            onClick={() => setOpen((prev) => !prev)}
            aria-expanded={open}
            aria-haspopup="menu"
          >
            <span className={styles.avatar}>{initial}</span>
            <span className={styles.userInfo}>
              <span className={styles.userName}>{userName}</span>
              <span className={styles.userRole}>{userRole}</span>
            </span>
            <svg
              className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`}
              width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {open && (
            <div className={styles.dropdown} role="menu">
              <StudentNavbar
                items={NAV_ITEMS}
                activeSection={location.pathname}
                onNavigate={handleNavigate}
              />
              <div className={styles.divider} />
              <button className={styles.logoutBtn} onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;