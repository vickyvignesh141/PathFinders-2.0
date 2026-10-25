
import { useState } from "react";
import styles from "./Login.module.css";

export default function VolunteerLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [focused, setFocused] = useState(null);

  const handleLogin = (e) => {
    e.preventDefault();

    if (!username || !password) {
      alert("Please enter both username and password.");
      return;
    }

    if (username === "volunteer" && password === "1234") {
      alert(`Welcome back, ${username}! 🌱`);
    } else {
      alert("Invalid username or password.");
      setPassword("");
    }
  };

  return (
    <div className={styles.vlPage}>
      {/* LEFT PANEL */}
      <div className={styles.vlLeft}>
        <div className={`${styles.vlBlob} ${styles.vlBlobTop}`} />
        <div className={`${styles.vlBlob} ${styles.vlBlobBottom}`} />

        <span className={`${styles.vlLeaf} ${styles.vlLeaf1}`}>🍃</span>
        <span className={`${styles.vlLeaf} ${styles.vlLeaf2}`}>🌿</span>
        <span className={`${styles.vlLeaf} ${styles.vlLeaf3}`}>🌱</span>
        <span className={`${styles.vlLeaf} ${styles.vlLeaf4}`}>✦</span>

        <div className={styles.vlLeftContent}>
          <div className={styles.vlBadge}>
            🌍 Join the Movement
          </div>

          <h1 className={styles.vlHeadline}>
            Give a little.
            <br />
            <span className={styles.vlHeadlineAccent}>
              Change a lot.
            </span>
          </h1>

          <p className={styles.vlInfoText}>
            Become part of a community of volunteers creating real impact —
            one small act of kindness at a time. Plant trees, teach kids,
            feed the hungry, and grow together.
          </p>

          <ul className={styles.vlBulletList}>
            <li className={styles.vlBullet}>
              🌿 12,000+ active volunteers worldwide
            </li>
            <li className={styles.vlBullet}>
              🤝 480+ local community projects
            </li>
            <li className={styles.vlBullet}>
              ⏱️ Flexible hours — volunteer your way
            </li>
          </ul>

          <div className={styles.vlStatRow}>
            <div className={styles.vlStat}>
              <div className={styles.vlStatNum}>98%</div>
              <div className={styles.vlStatLabel}>
                Happy volunteers
              </div>
            </div>

            <div className={styles.vlStatDivider} />

            <div className={styles.vlStat}>
              <div className={styles.vlStatNum}>1.2M</div>
              <div className={styles.vlStatLabel}>
                Lives touched
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL — LOGIN */}
      <div className={styles.vlRight}>
        <form className={styles.vlCard} onSubmit={handleLogin}>
          <div className={styles.vlLogoCircle}>🌱</div>

          <h2 className={styles.vlFormTitle}>Welcome Back</h2>

          <p className={styles.vlFormSubtitle}>
            Log in to continue your volunteering journey
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

          <div className={styles.vlRowBetween}>
            <label className={styles.vlCheckboxLabel}>
              <input type="checkbox" />
              Remember me
            </label>

            <a href="#" className={styles.vlLink}>
              Forgot password?
            </a>
          </div>

          <button type="submit" className={styles.vlButton}>
            LOGIN
          </button>

          <p className={styles.vlSignupText}>
            New here?{" "}
            <a href="#" className={styles.vlLinkStrong}>
              Create an account
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
