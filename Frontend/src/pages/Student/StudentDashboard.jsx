import React, { useState } from "react";
import styles from "./StudentDashboard.module.css";

const eventsData = [
  {
    id: 1,
    title: "Physical Verification",
    date: "12 Nov 2025",
    time: "10:00 AM",
    location: "Main Campus",
    description: "Document verification and physical presence check for all enrolled students.",
    icon: "✅",
    category: "Verification",
    seats: 120,
    registered: false,
  },
  {
    id: 2,
    title: "School Visit",
    date: "18 Nov 2025",
    time: "09:00 AM",
    location: "Govt. Higher Sec. School",
    description: "Community outreach visit to nearby schools to spread awareness.",
    icon: "🏫",
    category: "Outreach",
    seats: 60,
    registered: false,
  },
  {
    id: 3,
    title: "Karpom Karpipom",
    date: "22 Nov 2025",
    time: "04:00 PM",
    location: "Community Hall",
    description: "Learn and teach session — share knowledge with fellow students.",
    icon: "📚",
    category: "Learning",
    seats: 80,
    registered: false,
  },
  {
    id: 4,
    title: "Santa Class",
    date: "25 Nov 2025",
    time: "11:00 AM",
    location: "Online (Zoom)",
    description: "Special interactive session with mentors and guest speakers.",
    icon: "🎅",
    category: "Workshop",
    seats: 200,
    registered: false,
  },
  {
    id: 5,
    title: "Palm Tree Plantation",
    date: "30 Nov 2025",
    time: "07:00 AM",
    location: "Green Field Area",
    description: "Environment drive — plant palm trees and support green initiatives.",
    icon: "🌴",
    category: "Environment",
    seats: 100,
    registered: false,
  },
  {
    id: 6,
    title: "Boot Camp",
    date: "05 Dec 2025",
    time: "08:00 AM",
    location: "Training Ground",
    description: "Intensive 2-day boot camp for skill development and team building.",
    icon: "🥾",
    category: "Training",
    seats: 50,
    registered: false,
  },
  {
    id: 7,
    title: "Sangamam",
    date: "10 Dec 2025",
    time: "05:00 PM",
    location: "Auditorium",
    description: "Annual cultural meet — celebrate talent and togetherness.",
    icon: "🎭",
    category: "Cultural",
    seats: 300,
    registered: false,
  },
  {
    id: 8,
    title: "Mock Interview",
    date: "15 Dec 2025",
    time: "10:00 AM",
    location: "Seminar Hall",
    description: "Practice interviews with industry experts and get feedback.",
    icon: "💼",
    category: "Career",
    seats: 40,
    registered: false,
  },
];

const StudentDashboard = () => {
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
              Maatram <span>Student</span>
            </h1>
            <p className={styles.brandSub}>Dashboard</p>
          </div>
        </div>
        <div className={styles.userInfo}>
          <div className={styles.avatar}>S</div>
          <div className={styles.userText}>
            <span className={styles.userName}>Santhosh</span>
            <span className={styles.userRole}>Student</span>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        {/* ===== WELCOME BANNER ===== */}
        <section className={styles.welcome}>
          <div>
            <h2 className={styles.welcomeTitle}>
              Welcome back, <span className={styles.accent}>Santhosh</span> 👋
            </h2>
            <p className={styles.welcomeText}>
              You have <strong>{totalRegistered}</strong> registered event
              {totalRegistered !== 1 ? "s" : ""}. Keep participating and grow!
            </p>
          </div>
          <div className={styles.welcomeStats}>
            <div className={styles.welcomeStat}>
              <span className={styles.welcomeStatNum}>{events.length}</span>
              <span className={styles.welcomeStatLabel}>Total Events</span>
            </div>
            <div className={styles.welcomeStatDivider} />
            <div className={styles.welcomeStat}>
              <span className={styles.welcomeStatNum}>{totalRegistered}</span>
              <span className={styles.welcomeStatLabel}>Registered</span>
            </div>
          </div>
        </section>

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
          <h3 className={styles.sectionTitle}>Upcoming Events</h3>
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
                  <span className={styles.seats}>
                    👥 {ev.seats} seats
                  </span>
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

export default StudentDashboard;