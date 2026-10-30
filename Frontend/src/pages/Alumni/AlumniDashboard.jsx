import React, { useState } from "react";
import styles from "./AlumniDashboard.module.css";

const eventsData = [
  {
    id: 1,
    title: "Annual Alumni Reunion",
    date: "20 Dec 2025",
    time: "06:00 PM",
    location: "Main Auditorium",
    description: "Reconnect with batchmates and celebrate memories together.",
    icon: "🎉",
    category: "Reunion",
    seats: 500,
    registered: false,
  },
  {
    id: 2,
    title: "Alumni Meetup - Chennai Chapter",
    date: "28 Dec 2025",
    time: "05:00 PM",
    location: "Hotel Grand, Chennai",
    description: "Regional alumni meetup to network and share experiences.",
    icon: "🤝",
    category: "Meetup",
    seats: 80,
    registered: false,
  },
  {
    id: 3,
    title: "Guest Lecture Series",
    date: "05 Jan 2026",
    time: "10:00 AM",
    location: "Seminar Hall",
    description: "Share your industry expertise with current students.",
    icon: "🎤",
    category: "Lecture",
    seats: 30,
    registered: false,
  },
  {
    id: 4,
    title: "Scholarship Fundraiser",
    date: "12 Jan 2026",
    time: "07:00 PM",
    location: "Convention Center",
    description: "Support scholarships for deserving students through donations.",
    icon: "💰",
    category: "Fundraiser",
    seats: 200,
    registered: false,
  },
  {
    id: 5,
    title: "Career Webinar",
    date: "18 Jan 2026",
    time: "04:00 PM",
    location: "Online (Zoom)",
    description: "Guide juniors on career paths and industry trends.",
    icon: "💻",
    category: "Webinar",
    seats: 300,
    registered: false,
  },
  {
    id: 6,
    title: "Alumni Sports Meet",
    date: "25 Jan 2026",
    time: "08:00 AM",
    location: "Sports Ground",
    description: "Annual sports day — relive your college days on the field.",
    icon: "🏆",
    category: "Sports",
    seats: 150,
    registered: false,
  },
];


const AlumniDashboard = () => {
  const [events, setEvents] = useState(eventsData);
  const [filter, setFilter] = useState("All");

  const categories = ["All", ...new Set(eventsData.map((e) => e.category))];

  const handleRegister = (id) => {
    setEvents((prev) =>
      prev.map((ev) => (ev.id === id ? { ...ev, registered: !ev.registered } : ev))
    );
  };

  const filteredEvents =
    filter === "All" ? events : events.filter((e) => e.category === filter);

  const totalRegistered = events.filter((e) => e.registered).length;

  return (
    <div className={styles.dashboard}>
      {/* ===== TOP BAR ===== */}
      <header className={styles.topbar}>
        <div className={styles.brand}>
          <div className={styles.logoIcon}>M</div>
          <div>
            <h1 className={styles.brandName}>
              Maatram <span>Alumni</span>
            </h1>
            <p className={styles.brandSub}>Dashboard</p>
          </div>
        </div>
        <div className={styles.userInfo}>
          <div className={styles.avatar}>R</div>
          <div className={styles.userText}>
            <span className={styles.userName}>Rahul Sharma</span>
            <span className={styles.userRole}>Alumni • Batch 2018</span>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        {/* ===== WELCOME BANNER ===== */}
        <section className={styles.welcome}>
          <div>
            <h2 className={styles.welcomeTitle}>
              Welcome back, <span className={styles.accent}>Rahul</span> 👋
            </h2>
            <p className={styles.welcomeText}>
              You have <strong>{totalRegistered}</strong> registered alumni event
              {totalRegistered !== 1 ? "s" : ""}. Stay connected with your alma mater!
            </p>
          </div>
          <div className={styles.welcomeStats}>
            <div className={styles.welcomeStat}>
              <span className={styles.welcomeStatNum}>{events.length}</span>
              <span className={styles.welcomeStatLabel}>Events</span>
            </div>
            <div className={styles.welcomeStatDivider} />
            <div className={styles.welcomeStat}>
              <span className={styles.welcomeStatNum}>{totalRegistered}</span>
              <span className={styles.welcomeStatLabel}>Registered</span>
            </div>
            <div className={styles.welcomeStatDivider} />
            <div className={styles.welcomeStat}>
              <span className={styles.welcomeStatNum}>12</span>
              <span className={styles.welcomeStatLabel}>Mentees</span>
            </div>
          </div>
        </section>

        {/* ===== QUICK ACTIONS ===== */}
        

        {/* ===== FILTER TABS ===== */}
        <div className={styles.filterBar}>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`${styles.filterBtn} ${
                filter === cat ? styles.filterBtnActive : ""
              }`}
              onClick={() => setFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* ===== EVENTS GRID ===== */}
        <section className={styles.eventsSection}>
          <h3 className={styles.sectionTitle}>Upcoming Alumni Events</h3>
          <div className={styles.eventsGrid}>
            {filteredEvents.map((ev) => (
              <div key={ev.id} className={styles.eventCard}>
                <div className={styles.eventHeader}>
                  <div className={styles.eventIcon}>{ev.icon}</div>
                  <span className={styles.eventCategory}>{ev.category}</span>
                </div>

                <h4 className={styles.eventTitle}>{ev.title}</h4>
                <p className={styles.eventDesc}>{ev.description}</p>

                <div className={styles.eventMeta}>
                  <div className={styles.metaItem}>
                    <span className={styles.metaIcon}>📅</span>
                    <span>{ev.date}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <span className={styles.metaIcon}>⏰</span>
                    <span>{ev.time}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <span className={styles.metaIcon}>📍</span>
                    <span>{ev.location}</span>
                  </div>
                </div>

                <div className={styles.eventFooter}>
                  <span className={styles.seats}>👥 {ev.seats} seats</span>
                  <button
                    className={`${styles.registerBtn} ${
                      ev.registered ? styles.registeredBtn : ""
                    }`}
                    onClick={() => handleRegister(ev.id)}
                  >
                    {ev.registered ? "✓ Registered" : "Register"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
};

export default AlumniDashboard;