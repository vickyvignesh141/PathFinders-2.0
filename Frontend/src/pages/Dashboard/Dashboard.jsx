
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



  {
    title: "Aptitude",
    description:
      "Participate in aptitude training sessions designed to improve logical thinking, quantitative skills, problem-solving abilities and analytical reasoning.",
  },
  {
    title: "Freshers Day",
    description:
      "Welcome new students into the Maatram community through an engaging celebration filled with activities, interactions and memorable experiences.",
  },
  {
    title: "School Visit",
    description:
      "Visit schools to motivate students, create awareness about higher education and inspire them to pursue their dreams.",
  },
  {
    title: "College Visit",
    description:
      "Engage with college students, introduce Maatram initiatives and encourage them to participate in volunteering and social activities.",
  },
  {
    title: "Anchor Workshop",
    description:
      "Develop public speaking, stage management, communication and anchoring skills through interactive workshop sessions.",
  },
  {
    title: "Immersion Program",
    description:
      "Experience community-based learning, understand real-world challenges and develop a deeper connection with social impact initiatives.",
  },
  {
    title: "Hackforge",
    description:
      "Bring together innovative minds to collaborate, develop creative solutions and build technology-driven ideas through a hackathon experience.",
  },
  {
    title: "Sangamam",
    description:
      "Celebrate unity, teamwork and cultural diversity through an event that brings together students and volunteers.",
  },
  {
    title: "Leadership Camp",
    description:
      "Build leadership qualities, teamwork, decision-making and problem-solving skills through engaging activities and practical challenges.",
  },
  {
    title: "Palm Tree Plantation",
    description:
      "Promote environmental sustainability by participating in palm tree plantation activities and creating awareness about protecting nature.",
  },
  {
    title: "Siragugal",
    description:
      "Support and inspire students through educational activities, mentoring and initiatives that help them discover their potential.",
  },
  {
    title: "Joy of Giving",
    description:
      "Spread happiness through donation drives, sharing initiatives and community service activities that support people in need.",
  },
  {
    title: "Kadhaipoma",
    description:
      "Encourage storytelling, creativity and communication by sharing meaningful stories, experiences and ideas.",
  },
  {
    title: "Karppom Karppipom",
    description:
      "Promote the importance of education by engaging in teaching activities, knowledge sharing and educational support for students.",
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
            Sign in Volunteer →
          </a>
          <a href="/login" className={styles.loginBtn}>
            Sign in Admin →
          </a>
        </nav>
      </header>

      {/* Main Content - Volunteering Details */}
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

      {/* Events Section */}
      

      {/* Simple Footer */}
      <footer className={styles.footer}>
        <strong>MAATRAM</strong>
        <p>Volunteer Community Portal</p>
      </footer>
    </div>
  );
}
