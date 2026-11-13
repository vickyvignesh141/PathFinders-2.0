import React, { useState, useEffect, useRef, useCallback } from "react";
import styles from "./StudentDashboard.module.css";
import { getStudentRegistrations } from "../../services/eventService";
import { useNavigate } from "react-router-dom";

const studentData = {
  name: "Santhosh Kumar",
  role: "Student",
  college: "Anna University",
  batch: "2023-2027",
  department: "Computer Science",
  email: "santhosh@annauniv.edu",
  linkedin: "linkedin.com/in/santhoshk",
  bio: "Passionate about learning and community service.",
  points: 2450,
  badge: "Gold",
  eventsCompleted: 12,
  totalHours: 78,
  avatar: "S",
};

const leaderboardData = [
  {
    rank: 1,
    name: "Priya Ramesh",
    college: "Anna University",
    points: 4820,
    badge: "Diamond",
  },
  {
    rank: 2,
    name: "Karthik Vel",
    college: "Anna University",
    points: 4210,
    badge: "Diamond",
  },
  {
    rank: 3,
    name: "Meena Suresh",
    college: "Anna University",
    points: 3980,
    badge: "Gold",
  },
  {
    rank: 4,
    name: "Santhosh Kumar",
    college: "Anna University",
    points: 2450,
    badge: "Gold",
  },
  {
    rank: 5,
    name: "Arjun Kumar",
    college: "Anna University",
    points: 2210,
    badge: "Gold",
  },
  {
    rank: 6,
    name: "Divya Menon",
    college: "Anna University",
    points: 1980,
    badge: "Silver",
  },
  {
    rank: 7,
    name: "Ravi Shankar",
    college: "Anna University",
    points: 1740,
    badge: "Silver",
  },
  {
    rank: 8,
    name: "Anitha Raj",
    college: "Anna University",
    points: 1520,
    badge: "Silver",
  },
  {
    rank: 9,
    name: "Vignesh Babu",
    college: "Anna University",
    points: 1410,
    badge: "Silver",
  },
  {
    rank: 10,
    name: "Lakshmi Priya",
    college: "Anna University",
    points: 1350,
    badge: "Silver",
  },
  {
    rank: 11,
    name: "Hari Prasad",
    college: "Anna University",
    points: 1240,
    badge: "Silver",
  },
  {
    rank: 12,
    name: "Nandhini Devi",
    college: "Anna University",
    points: 1120,
    badge: "Silver",
  },
];

// Generate a full 200-student leaderboard
const generateFullLeaderboard = () => {
  const base = [...leaderboardData];
  const firstNames = [
    "Aarav",
    "Vivaan",
    "Aditya",
    "Vihaan",
    "Arjun",
    "Sai",
    "Reyansh",
    "Ayaan",
    "Krishna",
    "Ishaan",
    "Shaurya",
    "Atharv",
    "Advait",
    "Pranav",
    "Dhruv",
    "Kabir",
    "Ananya",
    "Diya",
    "Aadhya",
    "Saanvi",
    "Pari",
    "Anika",
    "Navya",
    "Myra",
    "Sara",
    "Ira",
    "Kiara",
    "Riya",
    "Aarohi",
    "Anvi",
    "Prisha",
    "Tanvi",
  ];
  const lastNames = [
    "Sharma",
    "Verma",
    "Reddy",
    "Nair",
    "Iyer",
    "Menon",
    "Pillai",
    "Rao",
    "Kumar",
    "Patel",
    "Gupta",
    "Singh",
    "Joshi",
    "Desai",
    "Kulkarni",
    "Mehta",
  ];
  const colleges = [
    "Anna University",
    "IIT Madras",
    "NIT Trichy",
    "VIT Vellore",
    "SRM University",
    "PSG Tech",
    "Amrita University",
    "SASTRA",
  ];

  const full = [];
  for (let i = 0; i < 200; i++) {
    if (i < base.length) {
      full.push(base[i]);
    } else {
      const fn = firstNames[i % firstNames.length];
      const ln = lastNames[Math.floor(i / 7) % lastNames.length];
      const badge = i < 20 ? "Diamond" : i < 80 ? "Gold" : "Silver";
      full.push({
        rank: i + 1,
        name: `${fn} ${ln}`,
        college: colleges[i % colleges.length],
        points: Math.max(200, 1100 - i * 5 + (i % 13) * 7),
        badge,
      });
    }
  }
  full.sort((a, b) => b.points - a.points);
  return full.map((s, i) => ({ ...s, rank: i + 1 }));
};

const fullLeaderboardData = generateFullLeaderboard();

const badgeColors = {
  Diamond: { bg: "#e0f2fe", color: "#075985", icon: "💎" },
  Gold: { bg: "#fef3c7", color: "#92400e", icon: "🥇" },
  Silver: { bg: "#f3f4f6", color: "#374151", icon: "🥈" },
};

/* ---------- Date helpers (no timezone surprises) ---------- */
const MONTHS_SHORT = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

const parseISO = (iso) => {
  const [y, m, d] = iso.split("-").map(Number);
  return { y, m: m - 1, d };
};
const getCalendarDate = (value) => {
  if (!value) return "";

  // Date-only value: keep it unchanged
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  // Datetime value: convert to Indian calendar date
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
};

const pad = (n) => String(n).padStart(2, "0");

const formatRange = (start, end) => {
  const s = parseISO(start);
  const e = parseISO(end || start);
  return `${pad(s.d)} ${MONTHS_SHORT[s.m]} - ${pad(e.d)} ${MONTHS_SHORT[e.m]}`;
};

const formatFullDate = (iso) => {
  const { y, m, d } = parseISO(iso);
  const name = MONTHS_SHORT[m];
  return `${pad(d)} ${name.charAt(0)}${name.slice(1).toLowerCase()} ${y}`;
};

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [eventError, setEventError] = useState("");
  const [profile] = useState(studentData);
  const [calDate, setCalDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [badgeFilter, setBadgeFilter] = useState("All");
  const [nameSearch, setNameSearch] = useState("");

  // Full leaderboard modal
  const [fullLbOpen, setFullLbOpen] = useState(false);
  const [fullLbFilter, setFullLbFilter] = useState("All");
  const [fullLbSearch, setFullLbSearch] = useState("");

  // Top-bar active section
  const [activeSection, setActiveSection] = useState("profile");

  // Events strip
  const trackRef = useRef(null);
  const [paused, setPaused] = useState(false);

  // Only upcoming (not completed) events in the strip
  const upcomingEvents = events.filter((e) => !e.completed);

 
useEffect(() => {
  const fetchEvents = async () => {
    try {
      // Fetch events and logged-in student's registrations
      const [eventsResponse, registrationResponse] = await Promise.all([
        fetch("http://localhost:5000/api/events/"),
        getStudentRegistrations(),
      ]);

      const result = await eventsResponse.json();

      if (!eventsResponse.ok || !result.success) {
        throw new Error(result.message || "Failed to fetch events");
      }

      const registrations =
        registrationResponse.registrations || [];

      console.log("My registrations:", registrations);

      const registrationMap = new Map(
        registrations.map((registration) => [
          String(registration.eventId),
          registration,
        ])
      );

      const formattedEvents = result.events.map((event) => {
        const start = new Date(event.startAt);
        const end = new Date(event.endAt);

        const myRegistration = registrationMap.get(
          String(event._id)
        );

        const status = myRegistration?.status || "";

        return {
          id: event._id,
          title: event.eventTitle,
          date: getCalendarDate(event.date || event.startAt),
endDate: getCalendarDate(event.endDate || event.date || event.endAt || event.startAt),
          time: start.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }),
          location: event.location,
          description: event.eventDescription,
          icon: "🤝",
          category: event.volunteerWork,
          seats: event.volunteersNeeded,

          // Actual registration from database
          registered: ["Registered", "Approved"].includes(status),
          registrationStatus:
            status === "Approved"
              ? "selected"
              : status === "Registered"
              ? "registered"
              : "",

          completed: event.status === "completed",
          hours: Math.max(0, (end - start) / (1000 * 60 * 60)),
          instructions: event.instructions,
          zone: event.zone,
          startTime: event.startTime,
          endTime: event.endTime,
        };
      });

      setEvents(formattedEvents);

    } catch (error) {
      console.error("Fetch Events Error:", error);
      setEventError("Unable to load events.");
    } finally {
      setLoadingEvents(false);
    }
  };

  fetchEvents();
}, []);


  // Scroll the strip one card at a time (wraps around at both ends)
  const slideBy = useCallback((dir) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector("[data-event-card]");
    const gap = 16;
    const step = card ? card.offsetWidth + gap : 300;
    const max = el.scrollWidth - el.clientWidth;

    if (dir > 0 && el.scrollLeft >= max - 4) {
      el.scrollTo({ left: 0, behavior: "smooth" });
    } else if (dir < 0 && el.scrollLeft <= 4) {
      el.scrollTo({ left: max, behavior: "smooth" });
    } else {
      el.scrollBy({ left: dir * step, behavior: "smooth" });
    }
  }, []);

  // Auto slide every 4 seconds (pauses on hover / touch)
  useEffect(() => {
    if (paused || upcomingEvents.length === 0) return;
    const timer = setInterval(() => slideBy(1), 2000);
    return () => clearInterval(timer);
  }, [paused, upcomingEvents.length, slideBy]);

  const handleRegister = (id) => {
    setEvents((prev) =>
      prev.map((ev) =>
        ev.id === id ? { ...ev, registered: !ev.registered } : ev,
      ),
    );

    setSelectedEvent((prev) =>
      prev && prev.id === id ? { ...prev, registered: !prev.registered } : prev,
    );
  };

  const totalRegistered = events.filter((e) => e.registered).length;
  const registeredEvents = events.filter((e) => e.registered);
  const completedEvents = events.filter((e) => e.completed);

  const certificateEvent =
    completedEvents.length > 0
      ? completedEvents[completedEvents.length - 1]
      : null;

  const filteredLeaderboard = leaderboardData.filter((s) => {
    const matchBadge = badgeFilter === "All" || s.badge === badgeFilter;
    const matchName = s.name.toLowerCase().includes(nameSearch.toLowerCase());
    return matchBadge && matchName;
  });

  const filteredFullLeaderboard = fullLeaderboardData.filter((s) => {
    const matchBadge = fullLbFilter === "All" || s.badge === fullLbFilter;
    const matchName = s.name.toLowerCase().includes(fullLbSearch.toLowerCase());
    return matchBadge && matchName;
  });

  // Calendar logic
  const year = calDate.getFullYear();
  const month = calDate.getMonth();
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const eventsByDay = {};
  registeredEvents.forEach((ev) => {
    const p = parseISO(ev.date);
    if (p.y === year && p.m === month) {
      if (!eventsByDay[p.d]) eventsByDay[p.d] = [];
      eventsByDay[p.d].push(ev);
    }
  });
  const calDays = [];
  for (let i = 0; i < firstDay; i++) calDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calDays.push(d);
  const weekDays = ["S", "M", "T", "W", "T", "F", "S"];

const scrollTo = (id) => {
  // Profile navigation
  if (id === "profile") {
    navigate("/studentprofile");
    return;
  }

  // History navigation
  if (id === "history") {
    navigate("/studenthistory");
    return;
  }

  // Certificate navigation
  if (id === "certificate") {
    navigate("/studentcertificate");
    return;
  }

  // Dashboard section scrolling
  setActiveSection(id);

  const el = document.getElementById(id);

  if (el) {
    el.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
};

  // Find current user's rank in full leaderboard
  const currentUserRank =
    fullLeaderboardData.find((s) => s.name === profile.name)?.rank || "—";

  return (
    <>
      

  
    <div className={styles.dashboard}>
      {/* ===== TOP BAR ===== */}
      

      <main className={styles.main}>
        {/* ===== WELCOME BANNER ===== */}
        <section className={styles.welcome}>
          <div>
            <h2 className={styles.welcomeTitle}>
              Welcome back,{" "}
              <span className={styles.accent}>
              {localStorage.getItem("name")}
              </span>{" "}
              
            </h2>
            <p className={styles.welcomeText}>
              You have <strong>{totalRegistered}</strong> registered event
              {totalRegistered !== 1 ? "s" : ""}. Keep participating and grow!
            </p>
          </div>
          <div className={styles.welcomeStats}>
            <div className={styles.welcomeStat}>
              <span className={styles.welcomeStatNum}>
                {upcomingEvents.length}
              </span>
              <span className={styles.welcomeStatLabel}>Upcoming</span>
            </div>
            <div className={styles.welcomeStatDivider} />
            <div className={styles.welcomeStat}>
              <span className={styles.welcomeStatNum}>{totalRegistered}</span>
              <span className={styles.welcomeStatLabel}>Registered</span>
            </div>
          </div>
        </section>

        {/* ===== EVENTS STRIP (multi-card, auto-sliding) ===== */}
       {/* ===== UPCOMING EVENTS STRIP ===== */}
<section
  className={styles.eventsSection}
  onMouseEnter={() => setPaused(true)}
  onMouseLeave={() => setPaused(false)}
  onTouchStart={() => setPaused(true)}
  onTouchEnd={() => setPaused(false)}
>
  <div className={styles.panelHeader}>
    <div>
      <h3 className={styles.sectionTitle}>
        <icon name="calendar-days" /> Upcoming Events
      </h3>
      <span className={styles.subtitle}>
        {upcomingEvents.length} events • Explore and register
      </span>
    </div>

    <div className={styles.calNav}>
      <button
        className={styles.navBtn}
        onClick={() => slideBy(-1)}
        aria-label="Previous events"
      >
        ‹
      </button>

      <button
        className={styles.navBtn}
        onClick={() => slideBy(1)}
        aria-label="Next events"
      >
        ›
      </button>
    </div>
  </div>

  {loadingEvents ? (
    <p className={styles.emptyText}>Loading events...</p>
  ) : eventError ? (
    <p className={styles.emptyText}>{eventError}</p>
  ) : upcomingEvents.length === 0 ? (
    <p className={styles.emptyText}>
      No upcoming events right now.
    </p>
  ) : (
    <div className={styles.eventsTrack} ref={trackRef}>
      {upcomingEvents.map((ev) => {
        const p = parseISO(ev.date);

        return (
          <article
            key={ev.id}
            data-event-card
            className={styles.eventCard}
            onClick={() =>
              navigate("/student/event", {
                state: { event: ev },
              })
            }
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                navigate("/student/event", {
                  state: { event: ev },
                });
              }
            }}
            role="button"
            tabIndex={0}
          >
            {/* Event Title */}
            <h4 className={styles.eventCardTitle}>
              {ev.title}
            </h4>

            {/* Event Information */}
            <div className={styles.eventInfoList}>

              <div className={styles.eventInfoItem}>
                <icon name="calendar-days" />
                <span>{formatRange(ev.date, ev.endDate)}</span>
              </div>

              <div className={styles.eventInfoItem}>
                <icon name="clock" />
                <span>{ev.time}</span>
              </div>

              <div className={styles.eventInfoItem}>
                <icon name="map-pin" />
                <span>{ev.location}</span>
              </div>

            </div>

            {/* View Details */}
            <div className={styles.eventCardFooter}>
              <span className={styles.eventLink}>
                View Details
                <icon name="arrow-up-right" />
              </span>

              <span
                className={`${styles.eventStatus} ${
                  ev.registered
                    ? styles.statusRegistered
                    : styles.statusOpen
                }`}
              >
                {ev.registered ? "✓ Registered" : "Open"}
              </span>
            </div>
          </article>
        );
      })}
    </div>
  )}
</section>

        {/* ===== LEADERBOARD + PROFILE & CALENDAR ===== */}
        <div className={styles.profileLeaderboardGrid}>
          {/* Leaderboard */}
          <section id="leaderboard" className={styles.leaderboard}>
            <div className={styles.panelHeader}>
              <h3 className={styles.sectionTitle}>🏆 Leaderboard</h3>
              <div className={styles.panelHeaderRight}>
                <span className={styles.subtitle}>{profile.college}</span>
                <button
                  className={styles.viewMoreBtn}
                  onClick={() => setFullLbOpen(true)}
                >
                  View More →
                </button>
              </div>
            </div>

            <div className={styles.lbFilters}>
              <input
                type="text"
                placeholder="Search name…"
                value={nameSearch}
                onChange={(e) => setNameSearch(e.target.value)}
                className={styles.lbSearch}
              />
              <select
                value={badgeFilter}
                onChange={(e) => setBadgeFilter(e.target.value)}
                className={styles.lbSelect}
              >
                <option value="All">All Badges</option>
                <option value="Diamond">Diamond</option>
                <option value="Gold">Gold</option>
                <option value="Silver">Silver</option>
              </select>
            </div>

            <div className={styles.leaderboardList}>
              {filteredLeaderboard.length === 0 && (
                <p className={styles.emptyText}>
                  No students match your filter.
                </p>
              )}
              {filteredLeaderboard.map((student) => {
                const badge = badgeColors[student.badge];
                const isCurrent = student.name === profile.name;
                return (
                  <div
                    key={student.rank}
                    className={`${styles.leaderboardItem} ${
                      isCurrent ? styles.currentItem : ""
                    }`}
                  >
                    <span
                      className={`${styles.rank} ${
                        student.rank <= 3 ? styles.topRank : ""
                      }`}
                    >
                      {student.rank}
                    </span>
                    <div className={styles.leaderboardAvatar}>
                      {student.name.charAt(0)}
                    </div>
                    <div className={styles.leaderboardInfo}>
                      <span className={styles.leaderboardName}>
                        {student.name}
                        {isCurrent && (
                          <span className={styles.youTag}>You</span>
                        )}
                      </span>
                      <span className={styles.leaderboardCollege}>
                        {student.college}
                      </span>
                    </div>
                    <span
                      className={styles.badgePill}
                      style={{ background: badge.bg, color: badge.color }}
                    >
                      {badge.icon} {student.badge}
                    </span>
                    <span className={styles.points}>{student.points}</span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Right column: Profile + Calendar */}
          <div className={styles.rightColumn}>
            
            <section className={styles.calendar}>
              <div className={styles.calHeader}>
                <h3 className={styles.sectionTitle}>📅 My Calendar</h3>
                <div className={styles.calNav}>
                  <button
                    className={styles.navBtn}
                    onClick={() => setCalDate(new Date(year, month - 1, 1))}
                    aria-label="Previous month"
                  >
                    ‹
                  </button>
                  <span className={styles.monthLabel}>
                    {monthNames[month]} {year}
                  </span>
                  <button
                    className={styles.navBtn}
                    onClick={() => setCalDate(new Date(year, month + 1, 1))}
                    aria-label="Next month"
                  >
                    ›
                  </button>
                </div>
              </div>
              <div className={styles.weekDays}>
                {weekDays.map((d, i) => (
                  <div key={i} className={styles.weekDay}>
                    {d}
                  </div>
                ))}
              </div>
              <div className={styles.daysGrid}>
  {calDays.map((day, i) => {
    const dayEvents = day ? eventsByDay[day] || [] : [];

   const isSelected = dayEvents.some(
  (ev) => ev.registrationStatus === "selected"
);

const isRegistered = dayEvents.some(
  (ev) => ev.registrationStatus === "registered"
);

    return (
      <div
        key={i}
        className={`
  ${styles.dayCell}
  ${day ? "" : styles.emptyCell}
  ${
    isSelected
      ? styles.selectedEventDay
      : isRegistered
      ? styles.registeredEventDay
      : ""
  }
`}
        title={dayEvents.map((ev) => ev.title).join(", ")}
      >
        {day && <span>{day}</span>}

        {dayEvents.length > 0 && (
          <span className={styles.tickIcon}>✓</span>
        )}
      </div>
    );
  })}
</div>
             <div className={styles.legend}>
  <span className={styles.legendDot}></span>
  <span className={styles.legendText}>
    <span style={{ color: "#dc2626", fontWeight: 700 }}>
      Red
    </span>{" "}
    = Registered
  </span>

  <span
    className={styles.legendDot}
    style={{ background: "#22c55e" }}
  ></span>

  <span className={styles.legendText}>
    <span style={{ color: "#15803d", fontWeight: 700 }}>
      Green
    </span>{" "}
    = Admin Selected
  </span>
            </div>
          </section>
        </div>
      </div>
    </main>

    {/* ===== HAMBURGER SIDE DRAWER ===== */}fp


      {/* ===== HAMBURGER SIDE DRAWER ===== */}
      {drawerOpen && (
        <div
          className={styles.drawerOverlay}
          onClick={() => setDrawerOpen(false)}
        >
          <aside className={styles.drawer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.drawerHeader}>
              <h3 className={styles.drawerTitle}>My Account</h3>
              <button
                className={styles.closeBtn}
                onClick={() => setDrawerOpen(false)}
                aria-label="Close drawer"
              >
                ✕
              </button>
            </div>

            <div className={styles.drawerBody}>
              <div className={styles.drawerSection}>
                <div className={styles.drawerProfile}>
                  <div className={styles.drawerAvatar}>{profile.avatar}</div>
                  <div>
                    <h4 className={styles.drawerName}>{profile.name}</h4>
                    <p className={styles.drawerSub}>{profile.college}</p>
                    <p className={styles.drawerSub}>
                      {profile.batch} • {profile.department}
                    </p>
                  </div>
                </div>
                <div className={styles.drawerStats}>
                  <div className={styles.drawerStat}>
                    <span className={styles.drawerStatNum}>
                      {profile.points}
                    </span>
                    <span className={styles.drawerStatLabel}>Points</span>
                  </div>
                  <div className={styles.drawerStat}>
                    <span className={styles.drawerStatNum}>
                      {profile.eventsCompleted}
                    </span>
                    <span className={styles.drawerStatLabel}>Events</span>
                  </div>
                  <div className={styles.drawerStat}>
                    <span className={styles.drawerStatNum}>
                      {profile.totalHours}h
                    </span>
                    <span className={styles.drawerStatLabel}>Hours</span>
                  </div>
                </div>
                <span
                  className={styles.badgePill}
                  style={{
                    background: badgeColors[profile.badge].bg,
                    color: badgeColors[profile.badge].color,
                  }}
                >
                  {badgeColors[profile.badge].icon} {profile.badge} Badge
                </span>
              </div>

              <div className={styles.drawerSection}>
                <h4 className={styles.drawerSectionTitle}>🏆 My Rank</h4>
                <div className={styles.drawerRankRow}>
                  <span className={styles.rank}>{currentUserRank}</span>
                  <span>of {fullLeaderboardData.length} students</span>
                </div>
              </div>

              <div id="history" className={styles.drawerSection}>
                <h4 className={styles.drawerSectionTitle}>
                  📋 Completed Events
                </h4>
                <div className={styles.drawerHistoryList}>
                  {completedEvents.map((ev) => (
                    <div key={ev.id} className={styles.drawerHistoryItem}>
                      <div className={styles.historyIcon}>{ev.icon}</div>
                      <div className={styles.historyInfo}>
                        <span className={styles.historyTitle}>{ev.title}</span>
                        <span className={styles.historyMeta}>
                          {formatFullDate(ev.date)} • {ev.location}
                        </span>
                      </div>
                      <span
                        className={`${styles.historyStatus} ${styles.statusDone}`}
                      >
                        Done
                      </span>
                    </div>
                  ))}
                  {completedEvents.length === 0 && (
                    <p className={styles.emptyText}>No completed events yet.</p>
                  )}
                </div>
              </div>

              <div id="certificate" className={styles.drawerSection}>
                <h4 className={styles.drawerSectionTitle}>
                  🎖️ Volunteering Certificate
                </h4>
                {certificateEvent ? (
                  <div className={styles.certificateCard}>
                    <div className={styles.certificateIcon}>
                      {certificateEvent.icon}
                    </div>
                    <div className={styles.certificateInfo}>
                      <span className={styles.certificateLabel}>
                        Latest Completed
                      </span>
                      <span className={styles.certificateTitle}>
                        {certificateEvent.title}
                      </span>
                      <span className={styles.certificateMeta}>
                        {formatFullDate(certificateEvent.date)} •{" "}
                        {certificateEvent.hours}h credit
                      </span>
                    </div>
                    <button className={styles.certificateBtn}>View</button>
                  </div>
                ) : (
                  <p className={styles.emptyText}>
                    No completed events yet — complete one to unlock your
                    certificate.
                  </p>
                )}
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* ===== EVENT DETAILS MODAL ===== */}
      {selectedEvent && (
        <div
          className={styles.modalOverlay}
          onClick={() => setSelectedEvent(null)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Event Details</h3>
              <button
                className={styles.closeBtn}
                onClick={() => setSelectedEvent(null)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.eventDetailTop}>
                <div className={styles.eventIconLarge}>
                  {selectedEvent.icon}
                </div>
                <div>
                  <span className={styles.eventCategory}>
                    {selectedEvent.category}
                  </span>
                  <h4 className={styles.eventDetailTitle}>
                    {selectedEvent.title}
                  </h4>
                </div>
              </div>
              <p className={styles.eventDetailDesc}>
                {selectedEvent.description}
              </p>
              <div className={styles.eventDetailMeta}>
                <div className={styles.metaItem}>
                  <span className={styles.metaIcon}>📅</span>
                  <span>
                    {selectedEvent.endDate &&
                    selectedEvent.endDate !== selectedEvent.date
                      ? `${formatFullDate(selectedEvent.date)} – ${formatFullDate(selectedEvent.endDate)}`
                      : formatFullDate(selectedEvent.date)}
                  </span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaIcon}>⏰</span>
                  <span>{selectedEvent.time}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaIcon}>📍</span>
                  <span>{selectedEvent.location}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaIcon}>👥</span>
                  <span>{selectedEvent.seats} seats available</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaIcon}>⏳</span>
                  <span>{selectedEvent.hours} hours credit</span>
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button
                className={styles.cancelBtn}
                onClick={() => setSelectedEvent(null)}
              >
                Close
              </button>
              <button
                className={`${styles.saveBtn} ${
                  selectedEvent.registered ? styles.registeredBtn : ""
                }`}
                onClick={() => handleRegister(selectedEvent.id)}
              >
                {selectedEvent.registered
                  ? "✓ Registered — Unregister"
                  : "Register Now"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== FULL 200-STUDENT LEADERBOARD MODAL ===== */}
      {fullLbOpen && (
        <div
          className={styles.modalOverlay}
          onClick={() => setFullLbOpen(false)}
        >
          <div
            className={styles.fullLbModal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <div>
                <h3 className={styles.modalTitle}>🏆 Full Leaderboard</h3>
                <p className={styles.fullLbSub}>
                  {fullLeaderboardData.length} students • {profile.college}
                </p>
              </div>
              <button
                className={styles.closeBtn}
                onClick={() => setFullLbOpen(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className={styles.fullLbFilters}>
              <input
                type="text"
                placeholder="Search by name…"
                value={fullLbSearch}
                onChange={(e) => setFullLbSearch(e.target.value)}
                className={styles.lbSearch}
              />
              <select
                value={fullLbFilter}
                onChange={(e) => setFullLbFilter(e.target.value)}
                className={styles.lbSelect}
              >
                <option value="All">All Badges</option>
                <option value="Diamond">Diamond</option>
                <option value="Gold">Gold</option>
                <option value="Silver">Silver</option>
              </select>
            </div>

            <div className={styles.fullLbList}>
              {filteredFullLeaderboard.length === 0 && (
                <p className={styles.emptyText}>
                  No students match your filter.
                </p>
              )}
              {filteredFullLeaderboard.map((student) => {
                const badge = badgeColors[student.badge];
                const isCurrent = student.name === profile.name;
                return (
                  <div
                    key={student.rank}
                    className={`${styles.leaderboardItem} ${
                      isCurrent ? styles.currentItem : ""
                    }`}
                  >
                    <span
                      className={`${styles.rank} ${
                        student.rank <= 3 ? styles.topRank : ""
                      }`}
                    >
                      {student.rank}
                    </span>
                    <div className={styles.leaderboardAvatar}>
                      {student.name.charAt(0)}
                    </div>
                    <div className={styles.leaderboardInfo}>
                      <span className={styles.leaderboardName}>
                        {student.name}
                        {isCurrent && (
                          <span className={styles.youTag}>You</span>
                        )}
                      </span>
                      <span className={styles.leaderboardCollege}>
                        {student.college}
                      </span>
                    </div>
                    <span
                      className={styles.badgePill}
                      style={{ background: badge.bg, color: badge.color }}
                    >
                      {badge.icon} {student.badge}
                    </span>
                    <span className={styles.points}>{student.points}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
        
    </div>
    </>
  );
};

export default StudentDashboard;
