import React from "react";
import styles from "./Dashboard.module.css";

const opportunities = [
  {
    title: "Student Verification",
    description:
      "Verify student applications and support deserving students in accessing educational opportunities.",
  },
  {
    title: "School Visits & Career Awareness",
    description:
      "Visit schools, introduce higher education opportunities, and guide students towards their career goals.",
  },
  {
    title: "Mock Interviews",
    description:
      "Conduct mock interviews and help students improve their communication and interview skills.",
  },
  {
    title: "Admission Panel Interviews",
    description:
      "Participate in student admission interviews and support the selection process.",
  },
  {
    title: "Mentoring & Skill Development",
    description:
      "Share your professional knowledge and mentor students in their personal and career development.",
  },
  {
    title: "Teaching & Community Support",
    description:
      "Contribute your time and knowledge to educational programmes and community initiatives.",
  },
];

export default function Dashboard() {
  return (
    <div className={styles.page}>
      {/* Simple Header */}
      <header className={styles.header}>
        <a href="#home" className={styles.brand}>
          <span className={styles.logo}>M</span>
          <span>
            <strong className={styles.brandName}>
              MAATRAM<span className={styles.dot}>.</span>
            </strong>
            <small className={styles.brandCaption}>
              VOLUNTEER COMMUNITY
            </small>
          </span>
        </a>

        <nav className={styles.nav}>
          <a href="/login" className={styles.loginBtn}>
            Login →
          </a>
        </nav>
      </header>

      {/* Main Content - Only Volunteering Details */}
      <main className={styles.opportunities} id="home">
        <div className={styles.sectionHeading}>
          <h2>Volunteering Opportunities</h2>
          <p>Choose an opportunity that matches your skills and interests.</p>
        </div>

        <div className={styles.grid}>
          {opportunities.map((item) => (
            <article className={styles.opportunityCard} key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </main>

      {/* Simple Footer */}
      <footer className={styles.footer}>
        <strong>
          MAATRAM
        </strong>
        <p>Volunteer Community Portal</p>
      </footer>
    </div>
  );
}