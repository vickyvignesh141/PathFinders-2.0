
import React from "react";
import styles from "./AdminNavbar.module.css";

const defaultItems = [
  { label: "Overview", value: "/admin/dashboard" },
  { label: "History", value: "/admin/eventhistory" },
  { label: "Leaderboard", value: "/admin/leaderboard" },
  { label: "Students", value: "/admin/studentstatus" },
  { label: "Emails", value: "/admin/emails" },
  { label: "Post Event", value: "/admin/createevent" },
  { label: "Profile", value: "/admin/profile" },
];
const AdminNavbar = ({
  items = defaultItems,
  activeSection,
  onNavigate,
}) => {
  return (
    <nav className={styles.navbar}>
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          role="menuitem"
          className={`${styles.navButton} ${
            activeSection === item.value ? styles.active : ""
          }`}
          onClick={() => onNavigate(item.value)}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
};

export default AdminNavbar;
