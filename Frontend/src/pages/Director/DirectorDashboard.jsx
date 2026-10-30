import React, { useState } from "react";
import styles from "./DirectorDashboard.module.css";

const initialSlots = [
  {
    id: 1,
    date: "15 Nov 2025",
    day: "Saturday",
    startTime: "10:00 AM",
    endTime: "12:00 PM",
    sessionType: "Mock Interview",
    status: "Approved",
    adminNote: "Event created by Admin",
  },
  {
    id: 2,
    date: "18 Nov 2025",
    day: "Tuesday",
    startTime: "03:00 PM",
    endTime: "05:00 PM",
    sessionType: "Career Guidance",
    status: "Pending",
    adminNote: "Waiting for admin approval",
  },
  {
    id: 3,
    date: "22 Nov 2025",
    day: "Saturday",
    startTime: "11:00 AM",
    endTime: "01:00 PM",
    sessionType: "Mock Interview",
    status: "Approved",
    adminNote: "Event created by Admin",
  },
];

const sessionTypes = [
  "Mock Interview",
  "Career Guidance",
  "Resume Review",
  "Group Discussion",
  "Technical Mentoring",
  "Leadership Talk",
];

const DirectorDashboard = () => {
  const [slots, setSlots] = useState(initialSlots);
  const [form, setForm] = useState({
    date: "",
    startTime: "",
    endTime: "",
    sessionType: "Mock Interview",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleAddSlot = (e) => {
    e.preventDefault();

    if (!form.date || !form.startTime || !form.endTime) {
      setError("Please fill all fields before adding a slot.");
      return;
    }

    if (form.startTime >= form.endTime) {
      setError("End time must be after start time.");
      return;
    }

    const newSlot = {
      id: Date.now(),
      date: new Date(form.date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      day: new Date(form.date).toLocaleDateString("en-US", { weekday: "long" }),
      startTime: form.startTime,
      endTime: form.endTime,
      sessionType: form.sessionType,
      status: "Pending",
      adminNote: "Waiting for admin approval",
    };

    setSlots([newSlot, ...slots]);
    setForm({ date: "", startTime: "", endTime: "", sessionType: "Mock Interview" });
    setSuccess("✅ Availability slot added successfully!");
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleDelete = (id) => {
    setSlots(slots.filter((s) => s.id !== id));
    setSuccess("🗑️ Slot removed.");
    setTimeout(() => setSuccess(""), 2500);
  };

  const totalSlots = slots.length;
  const approvedSlots = slots.filter((s) => s.status === "Approved").length;
  const pendingSlots = slots.filter((s) => s.status === "Pending").length;

  return (
    <div className={styles.dashboard}>
      {/* ===== TOP BAR ===== */}
      <header className={styles.topbar}>
        <div className={styles.brand}>
          <div className={styles.logoIcon}>M</div>
          <div>
            <h1 className={styles.brandName}>
              Maatram <span>Director</span>
            </h1>
            <p className={styles.brandSub}>Volunteer Availability Panel</p>
          </div>
        </div>
        <div className={styles.userInfo}>
          <div className={styles.avatar}>D</div>
          <div className={styles.userText}>
            <span className={styles.userName}>Dr. Rajesh Kumar</span>
            <span className={styles.userRole}>Director • Volunteer</span>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        {/* ===== WELCOME BANNER ===== */}
        <section className={styles.welcome}>
          <div>
            <h2 className={styles.welcomeTitle}>
              Share your <span className={styles.accent}>availability</span> 🗓️
            </h2>
            <p className={styles.welcomeText}>
              Add your free time slots. Admin will create events based on your
              availability and students will register.
            </p>
          </div>
          <div className={styles.welcomeStats}>
            <div className={styles.welcomeStat}>
              <span className={styles.welcomeStatNum}>{totalSlots}</span>
              <span className={styles.welcomeStatLabel}>Total</span>
            </div>
            <div className={styles.welcomeStatDivider} />
            <div className={styles.welcomeStat}>
              <span className={styles.welcomeStatNum}>{approvedSlots}</span>
              <span className={styles.welcomeStatLabel}>Approved</span>
            </div>
            <div className={styles.welcomeStatDivider} />
            <div className={styles.welcomeStat}>
              <span className={styles.welcomeStatNum}>{pendingSlots}</span>
              <span className={styles.welcomeStatLabel}>Pending</span>
            </div>
          </div>
        </section>

        {/* ===== ADD SLOT FORM ===== */}
        <section className={styles.formSection}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>➕ Add New Availability Slot</h3>
            <p className={styles.sectionHint}>
              Choose when you're free and what session you'd like to conduct.
            </p>
          </div>

          <form className={styles.formGrid} onSubmit={handleAddSlot}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Date *</label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                className={styles.input}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Start Time *</label>
              <input
                type="time"
                name="startTime"
                value={form.startTime}
                onChange={handleChange}
                className={styles.input}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>End Time *</label>
              <input
                type="time"
                name="endTime"
                value={form.endTime}
                onChange={handleChange}
                className={styles.input}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Session Type</label>
              <select
                name="sessionType"
                value={form.sessionType}
                onChange={handleChange}
                className={styles.input}
              >
                {sessionTypes.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className={styles.formGroupBtn}>
              <button type="submit" className={styles.submitBtn}>
                ➕ Add Slot
              </button>
            </div>
          </form>

          {error && <p className={styles.errorMsg}>⚠️ {error}</p>}
          {success && <p className={styles.successMsg}>{success}</p>}
        </section>

        {/* ===== MY SLOTS ===== */}
        <section className={styles.slotsSection}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>My Availability Slots</h3>
            <p className={styles.sectionHint}>
              Admin will review these and create events accordingly.
            </p>
          </div>

          <div className={styles.slotsGrid}>
            {slots.map((slot) => (
              <div key={slot.id} className={styles.slotCard}>
                <div className={styles.slotHeader}>
                  <div className={styles.slotIcon}>🗓️</div>
                  <span
                    className={`${styles.status} ${
                      slot.status === "Approved"
                        ? styles.statusApproved
                        : styles.statusPending
                    }`}
                  >
                    {slot.status}
                  </span>
                </div>

                <h4 className={styles.slotDate}>{slot.date}</h4>
                <p className={styles.slotDay}>{slot.day}</p>

                <div className={styles.slotMeta}>
                  <div className={styles.metaItem}>
                    <span className={styles.metaIcon}>⏰</span>
                    <span>
                      {slot.startTime} – {slot.endTime}
                    </span>
                  </div>
                  <div className={styles.metaItem}>
                    <span className={styles.metaIcon}>💼</span>
                    <span>{slot.sessionType}</span>
                  </div>
                </div>

                <div
                  className={`${styles.adminNote} ${
                    slot.status === "Approved"
                      ? styles.adminNoteApproved
                      : styles.adminNotePending
                  }`}
                >
                  {slot.status === "Approved" ? "✅" : "⏳"} {slot.adminNote}
                </div>

                <button
                  className={styles.deleteBtn}
                  onClick={() => handleDelete(slot.id)}
                >
                  🗑️ Remove Slot
                </button>
              </div>
            ))}

            {slots.length === 0 && (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}>🗓️</span>
                <p className={styles.emptyText}>
                  No availability slots added yet.
                </p>
                <p className={styles.emptySub}>
                  Add your first slot above so admin can create events.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ===== INFO BANNER ===== */}
        <section className={styles.infoBanner}>
          <div className={styles.infoIcon}>💡</div>
          <div>
            <h4 className={styles.infoTitle}>How it works</h4>
            <p className={styles.infoText}>
              1️⃣ You add your free time slots &nbsp;→&nbsp; 2️⃣ Admin reviews and
              creates events &nbsp;→&nbsp; 3️⃣ Students register &nbsp;→&nbsp; 4️⃣
              You conduct the session
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default DirectorDashboard;