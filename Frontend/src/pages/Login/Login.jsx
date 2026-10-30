import { useState } from "react";
import {
  Users,
  GraduationCap,
  UserCheck,
  Settings
} from "lucide-react";
import styles from "./Login.module.css";
import { loginUser } from "../../services/authService";
import { useNavigate } from "react-router-dom";

export default function VolunteerLogin() {
  // Login states
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [focused, setFocused] = useState(null);

  // Flip state
  const [isRegistering, setIsRegistering] = useState(false);

  // Registration states
  const [regName, setRegName] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const navigate = useNavigate();

  // LOGIN FUNCTION
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username.trim() || !password) {
      alert("Please enter both username and password.");
      return;
    }

    try {
      const data = await loginUser(username.trim(), password, role);

      if (data.success) {
        alert(`Welcome back, ${data.username}! Role: ${data.role}`);

        if (data.role === "student") {
          navigate("/student/StudentDashboard");
        } else if (data.role === "alumni") {
          navigate("/alumni/AlumniDashboard");
        } else if (data.role === "admin") {
          navigate("/Director/DirectorDashboard");
        }
      }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Unable to connect to the server. Please try again.";

      alert(message);
      setPassword("");
    }
  };

  // REGISTRATION FUNCTION WILL BE ADDED NEXT

  return (
    <div className={styles.vlPage}>

      {/* LEFT PANEL */}
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
            Your time, skills, and experience can shape a student's future
            and empower young minds to create a brighter tomorrow.
          </p>

        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className={styles.vlRight}>

        {/* FLIP CONTAINER */}
        <div className={styles.vlFlipContainer}>

          <div
            className={`${styles.vlFlipInner} ${
              isRegistering ? styles.vlFlipped : ""
            }`}
          >

            {/* ================= LOGIN FRONT ================= */}
            <div className={styles.vlFlipFront}>

              <form
                className={styles.vlForm}
                onSubmit={handleLogin}
              >

                <div className={styles.vlLogoCircle}>M</div>

                <h2 className={styles.vlFormTitle}>
                  VOLUNTEER LOGIN
                </h2>

                <p className={styles.vlFormSubtitle}>
                  Log in to continue your journey
                </p>

                {/* USERNAME */}
                <label className={styles.vlLabel}>
                  Username
                </label>

                <input
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
                <label className={styles.vlLabel}>
                  Password
                </label>

                <input
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

                {/* ROLE SELECTION */}
                <div className={styles.vlRoleSection}>

                  <label className={styles.vlRoleLabel}>
                    <Users size={16} strokeWidth={2.5} />
                    Select User Type *
                  </label>

                  <div className={styles.vlRoleGrid}>

                    <div
                      className={`${styles.vlRoleBox} ${
                        role === "student" ? styles.vlRoleBoxActive : ""
                      }`}
                      onClick={() => setRole("student")}
                    >
                      <div className={styles.vlRoleIconWrap}>
                        <GraduationCap size={22} />
                      </div>
                      <span>Student</span>
                    </div>

                    <div
                      className={`${styles.vlRoleBox} ${
                        role === "alumni" ? styles.vlRoleBoxActive : ""
                      }`}
                      onClick={() => setRole("alumni")}
                    >
                      <div className={styles.vlRoleIconWrap}>
                        <UserCheck size={22} />
                      </div>
                      <span>Alumni</span>
                    </div>

                    <div
                      className={`${styles.vlRoleBox} ${
                        role === "admin" ? styles.vlRoleBoxActive : ""
                      }`}
                      onClick={() => setRole("admin")}
                    >
                      <div className={styles.vlRoleIconWrap}>
                        <Settings size={22} />
                      </div>
                      <span>Admin</span>
                    </div>

                  </div>
                </div>

                <button
                  type="submit"
                  className={styles.vlButton}
                >
                  LOGIN
                </button>

                <p className={styles.vlRegisterText}>
                  New user?{" "}
                  <span onClick={() => setIsRegistering(true)}>
                    Register here
                  </span>
                </p>

              </form>
            </div>

            {/* ================= REGISTRATION BACK ================= */}
            <div className={styles.vlFlipBack}>

              <form
                className={styles.vlForm}
                onSubmit={(e) => e.preventDefault()}
              >

                <div className={styles.vlLogoCircle}>M</div>

                <h2 className={styles.vlFormTitle}>
                  VOLUNTEER REGISTRATION
                </h2>

                <p className={styles.vlFormSubtitle}>
                  Create your volunteer account
                </p>

                {/* NAME */}
                <label className={styles.vlLabel}>
                  Full Name
                </label>

                <input
                  type="text"
                  className={styles.vlInput}
                  placeholder="Enter your full name"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                />

                {/* USERNAME */}
                <label className={styles.vlLabel}>
                  Username
                </label>

                <input
                  type="text"
                  className={styles.vlInput}
                  placeholder="MAA0012345"
                  value={regUsername}
                  onChange={(e) =>
                    setRegUsername(e.target.value.toUpperCase())
                  }
                />

                {/* PHONE */}
                <label className={styles.vlLabel}>
                  Phone Number
                </label>

                <input
                  type="tel"
                  className={styles.vlInput}
                  placeholder="Enter phone number"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                />

                {/* EMAIL */}
                <label className={styles.vlLabel}>
                  Gmail Address
                </label>

                <input
                  type="email"
                  className={styles.vlInput}
                  placeholder="example@gmail.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                />

                {/* PASSWORD */}
                <label className={styles.vlLabel}>
                  Password (DOB - DDMMYYYY)
                </label>

                <input
                  type="password"
                  className={styles.vlInput}
                  placeholder="DDMMYYYY"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                />

                {/* CONFIRM PASSWORD */}
                <label className={styles.vlLabel}>
                  Confirm Password
                </label>

                <input
                  type="password"
                  className={styles.vlInput}
                  placeholder="Re-enter DDMMYYYY"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />

                <button
                  type="submit"
                  className={styles.vlButton}
                >
                  REGISTER
                </button>

                <p className={styles.vlRegisterText}>
                  Already registered?{" "}
                  <span onClick={() => setIsRegistering(false)}>
                    Login here
                  </span>
                </p>

              </form>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}