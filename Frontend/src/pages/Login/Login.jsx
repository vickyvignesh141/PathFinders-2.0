import { useState } from "react";
import { Users, GraduationCap, UserCheck, Settings } from "lucide-react";
import styles from "./Login.module.css";

export default function VolunteerLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student"); // Default role
  const [focused, setFocused] = useState(null);

  const handleLogin = (e) => {
    e.preventDefault();

    if (!username || !password) {
      alert("Please enter both username and password.");
      return;
    }

    if (username === "volunteer" && password === "1234") {
      alert(`Welcome back, ${username}! Role: ${role}`);
    } else {
      alert("Invalid username or password.");
      setPassword("");
    }
  };

  return (
    <div className={styles.vlPage}>
      {/* LEFT PANEL - Maatram Volunteering Details */}
      <div className={styles.vlLeft}>
        <div className={styles.vlLeftContent}>
          <div className={styles.vlBadge}>
            MAATRAM VOLUNTEER COMMUNITY
          </div>

          <h1 className={styles.vlHeadline}>
            Give a little.
            <br />
            <span className={styles.vlHeadlineAccent}>
              Change a lot.
            </span>
          </h1>

          <p className={styles.vlInfoText}>
            Become part of a community of volunteers creating real impact. 
            Your time, skills, and experience can shape a student's future and 
            empower young minds to create a brighter tomorrow.
          </p>
        </div>
      </div>

      {/* RIGHT PANEL — LOGIN */}
      <div className={styles.vlRight}>
        <form className={styles.vlCard} onSubmit={handleLogin}>
          
          {/* Maatram Logo */}
          <div className={styles.vlLogoCircle}>M</div>

          <h2 className={styles.vlFormTitle}>VOLUNTEER LOGIN</h2>

          <p className={styles.vlFormSubtitle}>
            Log in to continue your journey
          </p>

        

          {/* USERNAME */}
          <label className={styles.vlLabel} htmlFor="username">
            Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onFocus={() => setFocused("user")}
            onBlur={() => setFocused(null)}
            placeholder="Enter your username"
            autoComplete="username"
            className={`${styles.vlInput} ${
              focused === "user" ? styles.vlInputFocused : ""
            }`}
          />

          {/* PASSWORD */}
          <label className={styles.vlLabel} htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() => setFocused("pass")}
            onBlur={() => setFocused(null)}
            placeholder="Enter your password"
            autoComplete="current-password"
            className={`${styles.vlInput} ${
              focused === "pass" ? styles.vlInputFocused : ""
            }`}
          />

            {/* NEW ROLE SELECTION BOXES */}
          <div className={styles.vlRoleSection}>
            <label className={styles.vlRoleLabel}>
              <Users size={16} strokeWidth={2.5} /> Select User Type *
            </label>
            
            <div className={styles.vlRoleGrid}>
              {/* STUDENT */}
              <div 
                className={`${styles.vlRoleBox} ${role === "student" ? styles.vlRoleBoxActive : ""}`}
                onClick={() => setRole("student")}
              >
                <div className={styles.vlRoleIconWrap}>
                  <GraduationCap size={22} />
                </div>
                <span>Student</span>
              </div>

              {/* ALUMNI / MENTOR */}
              <div 
                className={`${styles.vlRoleBox} ${role === "alumni" ? styles.vlRoleBoxActive : ""}`}
                onClick={() => setRole("alumni")}
              >
                <div className={styles.vlRoleIconWrap}>
                  <UserCheck size={22} />
                </div>
                <span>Alumni</span>
              </div>

              {/* ADMIN */}
              <div 
                className={`${styles.vlRoleBox} ${role === "admin" ? styles.vlRoleBoxActive : ""}`}
                onClick={() => setRole("admin")}
              >
                <div className={styles.vlRoleIconWrap}>
                  <Settings size={22} />
                </div>
                <span>Admin</span>
              </div>
            </div>
          </div>

          <button type="submit" className={styles.vlButton}>
            LOGIN
          </button>

        </form>
      </div>
    </div>
  );
}