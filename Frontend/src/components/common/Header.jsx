
import React from "react";
import styles from "./Header.module.css";

const Header = ({
  title = "Student Dashboard",
  userName = "Gomagan R",
  userId = "71",
}) => {
  return (
    <header className={styles.header}>

      {/* LEFT SECTION */}
      <div className={styles.left}>
        <div className={styles.logo}>
          <span>M</span>
        </div>

        <div className={styles.brand}>
          <h2>MAATRAM</h2>
          <p>Volunteering portal</p>
        </div>
      </div>

      {/* CENTER SECTION */}
      <div className={styles.center}>
        <h2>{title}</h2>
      </div>

      {/* RIGHT SECTION */}
      <div className={styles.right}>

        


      </div>

    </header>
  );
};

export default Header;
