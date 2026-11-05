
import React from "react";
import styles from "./AdminNavbar.module.css";

const defaultItems = [
  { label: "Profile", value: "/admin/profile" },
  { label: "Post Event", value: "/admin/createevent" },
  { label: "Leaderboard", value: "/admin/leaderboard" },
  { label: "Students", value: "/admin/studentstatus" },
  { label: "Emails", value: "/admin/emails" },
  { label: "History", value: "/admin/eventhistory" },

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
          className={`${styles.navButton} ${activeSection === item.value ? styles.active : ""
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
