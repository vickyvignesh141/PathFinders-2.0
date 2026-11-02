import React from "react";
import styles from "./StudentNavbar.module.css";

const defaultItems = [
  { label: "Profile", value: "profile" },
  { label: "Leaderboard", value: "leaderboard" },
  { label: "History", value: "history" },
  { label: "Certificate", value: "certificate" },
];

const StudentNavbar = ({ items = defaultItems, activeSection, onNavigate }) => {
  return (
    <nav className={styles.navbar}>
      {items.map((item) => (
        <button
          key={item.value}
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

export default StudentNavbar;