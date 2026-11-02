import React from "react";
import styles from "./StudentNavbar.module.css";

const StudentNavbar = ({ activeSection, onNavigate }) => {
  return (
    <nav className={styles.navbar}>
      <button onClick={() => onNavigate("profile")}>
        Profile
      </button>

      <button onClick={() => onNavigate("leaderboard")}>
        Leaderboard
      </button>

      <button onClick={() => onNavigate("history")}>
        History
      </button>

      <button onClick={() => onNavigate("certificate")}>
        Certificate
      </button>
    </nav>
  );
};

export default StudentNavbar;