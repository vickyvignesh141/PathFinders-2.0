import React, { useState } from "react";
import styles from "./AdminDashboard.module.css";

const initialEvents = [
  {
    id: 1,
    title: "Physical Verification",
    type: "Student",
    date: "12 Nov 2025",
    venue: "Main Campus",
    registrations: 84,
    status: "Approved",
  },
  {
    id: 2,
    title: "Annual Alumni Reunion",
    type: "Alumni",
    date: "20 Dec 2025",
    venue: "Main Auditorium",
    registrations: 312,
    status: "Approved",
  },
  {
    id: 3,
    title: "Boot Camp",
    type: "Student",
    date: "05 Dec 2025",
    venue: "Training Ground",
    registrations: 41,
    status: "Pending",
  },
  {
    id: 4,
    title: "Scholarship Fundraiser",
    type: "Alumni",
    date: "12 Jan 2026",
    venue: "Convention Center",
    registrations: 0,
    status: "Pending",
  },
  {
    id: 5,
    title: "Career Webinar",
    type: "Alumni",
    date: "18 Jan 2026",
    venue: "Online (Zoom)",
    registrations: 156,
    status: "Approved",
  },
];

const recentRegistrations = [
  { id: 1, name: "Santhosh Kumar", role: "Student", event: "Physical Verification", date: "2 hrs ago" },
  { id: 2, name: "Priya Ramesh", role: "Alumni", event: "Annual Alumni Reunion", date: "5 hrs ago" },
  { id: 3, name: "Karthik Vel", role: "Student", event: "Boot Camp", date: "1 day ago" },
  { id: 4, name: "Meena Suresh", role: "Alumni", event: "Career Webinar", date: "1 day ago" },
  { id: 5, name: "Arjun Kumar", role: "Student", event: "Physical Verification", date: "2 days ago" },
];

const quickActions = [
  { icon: "➕", label: "Create Event", desc: "Add new event" },
  { icon: "👤", label: "Add User", desc: "New student/alumni" },
  { icon: "✅", label: "Approve Requests", desc: "Review pending" },
  { icon: "📊", label: "View Reports", desc: "Analytics" },
];

const AdminDashboard = () => {
  const [events, setEvents] = useState(initialEvents);

  const handleApprove = (id) => {
    setEvents((prev) =>
      prev.map((ev) => (ev.id === id ? { ...ev, status: "Approved" } : ev))
    );
  };

  const handleDelete = (id) => {
    setEvents((prev) => prev.filter((ev) => ev.id !== id));
  };

  const totalRegistrations = events.reduce((sum, e) => sum + e.registrations, 0);
  const pendingCount = events.filter((e) => e.status === "Pending").length;

  return (
    <div className={styles.dashboard}>
      {/* ===== TOP BAR ===== */}
      <header className={styles.topbar}>
        <div className={styles.brand}>
          <div className={styles.logoIcon}>M</div>
          <div>
            <h1 className={styles.brandName}>
              Maatram <span>Admin</span>
            </h1>
            <p className={styles.brandSub}>Control Panel</p>
          </div>
        </div>
        <div className={styles.userInfo}>
          <div className={styles.avatar}>A</div>
          <div className={styles.userText}>
            <span className={styles.userName}>Admin User</span>
            <span className={styles.userRole}>Super Admin</span>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        {/* ===== WELCOME BANNER ===== */}
        <section className={styles.welcome}>
          <div>
            <h2 className={styles.welcomeTitle}>
              Welcome, <span className={styles.accent}>Admin</span> 👋
            </h2>
            <p className={styles.welcomeText}>
              You have <strong>{pendingCount}</strong> pending event
              {pendingCount !== 1 ? "s" : ""} to review today.
            </p>
          </div>
          <div className={styles.welcomeStats}>
            <div className={styles.welcomeStat}>
              <span className={styles.welcomeStatNum}>{events.length}</span>
              <span className={styles.welcomeStatLabel}>Events</span>
            </div>
            <div className={styles.welcomeStatDivider} />
            <div className={styles.welcomeStat}>
              <span className={styles.welcomeStatNum}>{totalRegistrations}</span>
              <span className={styles.welcomeStatLabel}>Registrations</span>
            </div>
            <div className={styles.welcomeStatDivider} />
            <div className={styles.welcomeStat}>
              <span className={styles.welcomeStatNum}>{pendingCount}</span>
              <span className={styles.welcomeStatLabel}>Pending</span>
            </div>
          </div>
        </section>

        {/* ===== STAT CARDS ===== */}
        <section className={styles.statsGrid}>
          <div className={styles.statCard}>
            <span className={styles.statIcon}>🎓</span>
            <div>
              <span className={styles.statNum}>1,248</span>
              <span className={styles.statLabel}>Total Students</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statIcon}>🎉</span>
            <div>
              <span className={styles.statNum}>542</span>
              <span className={styles.statLabel}>Total Alumni</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statIcon}>📅</span>
            <div>
              <span className={styles.statNum}>{events.length}</span>
              <span className={styles.statLabel}>Total Events</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statIcon}>📝</span>
            <div>
              <span className={styles.statNum}>{totalRegistrations}</span>
              <span className={styles.statLabel}>Registrations</span>
            </div>
          </div>
        </section>

        {/* ===== QUICK ACTIONS ===== */}
        <section className={styles.quickSection}>
          <h3 className={styles.sectionTitle}>Quick Actions</h3>
          <div className={styles.quickGrid}>
            {quickActions.map((action, idx) => (
              <button key={idx} className={styles.quickCard}>
                <span className={styles.quickIcon}>{action.icon}</span>
                <span className={styles.quickLabel}>{action.label}</span>
                <span className={styles.quickDesc}>{action.desc}</span>
              </button>
            ))}
          </div>
        </section>

        {/* ===== EVENT MANAGEMENT TABLE ===== */}
        <section className={styles.tableSection}>
          <div className={styles.panelHeader}>
            <h3 className={styles.sectionTitle}>Event Management</h3>
            <button className={styles.createBtn}>+ Create Event</button>
          </div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Venue</th>
                  <th>Registrations</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((ev) => (
                  <tr key={ev.id}>
                    <td className={styles.tdTitle}>{ev.title}</td>
                    <td>
                      <span
                        className={`${styles.badge} ${
                          ev.type === "Student" ? styles.badgeStudent : styles.badgeAlumni
                        }`}
                      >
                        {ev.type}
                      </span>
                    </td>
                    <td>{ev.date}</td>
                    <td>{ev.venue}</td>
                    <td className={styles.tdCenter}>{ev.registrations}</td>
                    <td>
                      <span
                        className={`${styles.status} ${
                          ev.status === "Approved" ? styles.statusApproved : styles.statusPending
                        }`}
                      >
                        {ev.status}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        {ev.status === "Pending" && (
                          <button
                            className={styles.approveBtn}
                            onClick={() => handleApprove(ev.id)}
                          >
                            Approve
                          </button>
                        )}
                        <button className={styles.deleteBtn} onClick={() => handleDelete(ev.id)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {events.length === 0 && (
                  <tr>
                    <td colSpan="7" className={styles.emptyRow}>
                      No events available. Click "Create Event" to add one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* ===== BOTTOM GRID: Recent Registrations + Pending Approvals ===== */}
        <section className={styles.bottomGrid}>
          {/* Recent Registrations */}
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <h3 className={styles.sectionTitle}>Recent Registrations</h3>
              <button className={styles.viewAllBtn}>View All →</button>
            </div>
            <div className={styles.listWrap}>
              {recentRegistrations.map((r) => (
                <div key={r.id} className={styles.listItem}>
                  <div className={styles.listAvatar}>{r.name.charAt(0)}</div>
                  <div className={styles.listInfo}>
                    <span className={styles.listName}>{r.name}</span>
                    <span className={styles.listSub}>{r.event}</span>
                  </div>
                  <div className={styles.listMeta}>
                    <span
                      className={`${styles.badge} ${
                        r.role === "Student" ? styles.badgeStudent : styles.badgeAlumni
                      }`}
                    >
                      {r.role}
                    </span>
                    <span className={styles.listTime}>{r.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Approvals */}
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <h3 className={styles.sectionTitle}>Pending Approvals</h3>
              <button className={styles.viewAllBtn}>View All →</button>
            </div>
            <div className={styles.listWrap}>
              {events.filter((e) => e.status === "Pending").length === 0 ? (
                <p className={styles.emptyText}>✅ No pending approvals. All caught up!</p>
              ) : (
                events
                  .filter((e) => e.status === "Pending")
                  .map((ev) => (
                    <div key={ev.id} className={styles.approvalItem}>
                      <div className={styles.approvalInfo}>
                        <span className={styles.listName}>{ev.title}</span>
                        <span className={styles.listSub}>
                          {ev.type} • {ev.date}
                        </span>
                      </div>
                      <button
                        className={styles.approveBtn}
                        onClick={() => handleApprove(ev.id)}
                      >
                        Approve
                      </button>
                    </div>
                  ))
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;