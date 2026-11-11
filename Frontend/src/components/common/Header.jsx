
import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./Header.module.css";

import StudentNavbar from "../Navbar/StudentNavbar";
import AdminNavbar from "../Navbar/AdminNavbar";

// Student menu
const STUDENT_ITEMS = [
  { label: "Profile", value: "/student/profile" },
  { label: "Leaderboard", value: "/student/leaderboard" },
  { label: "History", value: "/student/history" },
  { label: "Certificate", value: "/student/certificate" },
];

// Admin menu
const ADMIN_ITEMS = [
  { label: "History", value: "/admin/eventhistory" },
  { label: "Leaderboard", value: "/admin/leaderboard" },
  { label: "Students", value: "/admin/studentstatus" },
  { label: "Emails", value: "/admin/emails" },
  { label: "Post Event", value: "/admin/createevent" },
  { label: "Profile", value: "/admin/profile" },
];

// Alumni menu
const ALUMNI_ITEMS = [
  { label: "Profile", value: "/alumni/profile" },
  { label: "Events", value: "/alumni/events" },
  { label: "History", value: "/alumni/history" },
  { label: "Certificate", value: "/alumni/certificate" },
];

const ROLE_CONFIG = {
  student: {
    title: "Student Dashboard",
    navbar: StudentNavbar,
    items: STUDENT_ITEMS,
    displayRole: "Student",
  },

  admin: {
    title: "Admin Dashboard",
    navbar: AdminNavbar,
    items: ADMIN_ITEMS,
    displayRole: "Admin",
  },

  alumni: {
    title: "Alumni Dashboard",
    navbar: StudentNavbar,
    items: ALUMNI_ITEMS,
    displayRole: "Alumni",
  },
};

const Header = ({
  role ,
  title,
  userName ,
  userRole,
  notificationCount = 0,
  onLogout,
  onNavigate,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  // Identify role
  const normalizedRole = (role || userRole || "student")
  .toString()
  .trim()
  .toLowerCase()
  .replace(/[\s-]/g, "_");

  const roleKey = normalizedRole.includes("admin")
    ? "admin"
    : normalizedRole === "alumni"
    ? "alumni"
    : "student";

  const config = ROLE_CONFIG[roleKey];
  const NavbarComponent = config.navbar;

  // Close dropdown on outside click or Escape
  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    const handleKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);

    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  const handleNavigate = (path) => {
    setOpen(false);

    if (onNavigate) {
      onNavigate(path);
    } else {
      navigate(path);
    }
  };

const handleLogout = () => {
  setOpen(false);

  // Clear logged-in user details
  localStorage.removeItem("name");
  localStorage.removeItem("role");
  localStorage.removeItem("username");

  if (onLogout) {
    onLogout();
  } else {
    navigate("/");
  }
};

  const initial =
    userName?.trim()?.charAt(0)?.toUpperCase() || "U";

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
        <h2>{title || config.title}</h2>
      </div>

      {/* RIGHT */}
      <div className={styles.right}>
        <button
          type="button"
          className={styles.bellBtn}
          aria-label="Notifications"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.7 21a2 2 0 0 1-3.4 0" />
          </svg>

          {notificationCount > 0 && (
            <span className={styles.badge}>
              {notificationCount}
            </span>
          )}
        </button>

        {/* USER MENU */}
        <div className={styles.userMenu} ref={menuRef}>
          <button
            type="button"
            className={styles.userPill}
            onClick={() => setOpen((prev) => !prev)}
            aria-expanded={open}
            aria-haspopup="menu"
          >
            <span className={styles.avatar}>{initial}</span>

            <span className={styles.userInfo}>
              <span className={styles.userName}>{userName}</span>
              <span className={styles.userRole}>
                {userRole || config.displayRole}
              </span>
            </span>

            <svg
              className={`${styles.chevron} ${
                open ? styles.chevronOpen : ""
              }`}
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {/* ROLE BASED NAVBAR */}
          {open && (
            <div className={styles.dropdown} role="menu">
              <NavbarComponent
                items={config.items}
                activeSection={location.pathname}
                onNavigate={handleNavigate}
              />

              <div className={styles.divider} />

              <button
                type="button"
                className={styles.logoutBtn}
                onClick={handleLogout}
                role="menuitem"
              >
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
