import React, { useEffect, useMemo, useState } from "react";
import { getAllEvents } from "../../services/eventService";
import EventHistory from "./EventHistory";
import {
  LayoutDashboard,
  Calendar,
  History,
  Trash2,
  Trophy,
  Users,
  Mail,
  Plus,
  X,
  Send,
  MessageCircle,
  Sparkles,
  UserPlus,
  Clock,
  MapPin,
  RotateCcw,
  GraduationCap,
  UserCheck,
  UserX,
  FileText,
} from "lucide-react";

import styles from "./AdminDashboard.module.css";
import { useNavigate } from "react-router-dom";

/* ============================================================
   DATA
   ============================================================ */

const ZONES = ["Zone 1", "Zone 2", "Zone 3", "Zone 4", "Zone 5"];

const COLLEGES = [
  "Maatram Institute of Technology",
  "Green Valley College",
  "St. Xavier's College",
  "Sunrise Engineering College",
];

const BATCHES = [
  "2021-2025",
  "2022-2026",
  "2023-2027",
  "2024-2028",
];

const SKILLS = [
  "Event Management",
  "Logistics",
  "Registration Desk",
  "Technical Support",
  "Photography",
  "Design",
  "First Aid",
  "Crowd Control",
  "Teaching",
  "Public Speaking",
];

const VOLUNTEER_ROWS = [
  ["Santhosh Kumar", "Maatram Institute of Technology", "Zone 1", "2022-2026", "CSE", "Active", 14, 52, 4.8, ["Event Management", "Logistics"], [1, 2], 0],
  ["Priya Ramesh", "Green Valley College", "Zone 2", "2021-2025", "ECE", "Active", 11, 41, 4.6, ["Registration Desk", "Public Speaking"], [1, 3], 1],
  ["Karthik Vel", "St. Xavier's College", "Zone 3", "2023-2027", "MECH", "Active", 9, 33, 4.4, ["Logistics", "Crowd Control"], [1], 2],
  ["Meena Suresh", "Sunrise Engineering College", "Zone 4", "2022-2026", "IT", "Active", 12, 47, 4.7, ["Photography", "Design"], [2, 3], 0],
  ["Arjun Kumar", "Maatram Institute of Technology", "Zone 1", "2024-2028", "CSE", "Active", 6, 22, 4.2, ["Technical Support", "Event Management"], [1], 3],
  ["Divya Nair", "Green Valley College", "Zone 2", "2022-2026", "BBA", "Active", 15, 58, 4.9, ["Event Management", "Public Speaking", "Registration Desk"], [1, 2, 3], 0],
  ["Rahul Menon", "St. Xavier's College", "Zone 3", "2021-2025", "CSE", "Inactive", 8, 30, 4.1, ["Technical Support"], [2], 96],
  ["Ananya Iyer", "Sunrise Engineering College", "Zone 5", "2023-2027", "ECE", "Active", 10, 38, 4.5, ["First Aid", "Crowd Control"], [1, 2], 1],
  ["Vignesh Raj", "Maatram Institute of Technology", "Zone 1", "2022-2026", "MECH", "Active", 13, 50, 4.6, ["Logistics", "Crowd Control"], [2, 3], 2],
  ["Sneha Pillai", "Green Valley College", "Zone 2", "2024-2028", "IT", "Active", 5, 19, 4.0, ["Design", "Photography"], [3], 4],
  ["Ashwin Das", "St. Xavier's College", "Zone 3", "2023-2027", "BBA", "Inactive", 7, 26, 3.9, ["Registration Desk"], [1], 120],
  ["Nandini Rao", "Sunrise Engineering College", "Zone 4", "2022-2026", "CSE", "Active", 16, 61, 4.9, ["Event Management", "Teaching", "Public Speaking"], [1, 2, 3], 0],
  ["Hari Prasad", "Maatram Institute of Technology", "Zone 5", "2021-2025", "EEE", "Active", 9, 35, 4.3, ["Technical Support", "Logistics"], [2], 3],
  ["Lakshmi Devi", "Green Valley College", "Zone 2", "2023-2027", "ECE", "Active", 11, 44, 4.7, ["First Aid", "Registration Desk"], [1, 3], 1],
  ["Suresh Babu", "St. Xavier's College", "Zone 3", "2022-2026", "MECH", "Active", 8, 31, 4.2, ["Crowd Control", "Logistics"], [1, 2], 5],
  ["Kavya Menon", "Sunrise Engineering College", "Zone 4", "2024-2028", "IT", "Active", 4, 15, 4.1, ["Design", "Photography"], [3], 2],
  ["Ravi Shankar", "Maatram Institute of Technology", "Zone 1", "2021-2025", "CSE", "Inactive", 12, 45, 4.4, ["Technical Support", "Event Management"], [1, 2], 210],
  ["Deepa Krishnan", "Green Valley College", "Zone 2", "2022-2026", "BBA", "Active", 13, 49, 4.8, ["Public Speaking", "Event Management"], [1, 3], 0],
  ["Mohan Raj", "St. Xavier's College", "Zone 5", "2023-2027", "CSE", "Active", 6, 24, 4.0, ["Technical Support", "Photography"], [2], 6],
  ["Aarthi Selvam", "Sunrise Engineering College", "Zone 4", "2022-2026", "ECE", "Active", 10, 39, 4.6, ["Registration Desk", "First Aid"], [1, 2, 3], 1],
  ["Balaji Nair", "Maatram Institute of Technology", "Zone 1", "2024-2028", "MECH", "Active", 3, 11, 3.8, ["Logistics"], [3], 8],
  ["Ishwarya G", "Green Valley College", "Zone 3", "2023-2027", "IT", "Active", 9, 36, 4.5, ["Design", "Photography", "Public Speaking"], [2, 3], 2],
  ["Prakash V", "St. Xavier's College", "Zone 2", "2021-2025", "BBA", "Active", 14, 55, 4.7, ["Event Management", "Crowd Control", "Public Speaking"], [1, 2, 3], 0],
  ["Yamuna R", "Sunrise Engineering College", "Zone 5", "2022-2026", "CSE", "Inactive", 5, 18, 3.7, ["Registration Desk"], [], 150],
];

const initialVolunteers = VOLUNTEER_ROWS.map((row, i) => {
  const [
    name,
    college,
    zone,
    batch,
    department,
    status,
    eventsAttended,
    hours,
    rating,
    skills,
    eventIds,
    lastActiveDays,
  ] = row;

  return {
    id: i + 1,
    name,
    email: `${name.toLowerCase().replace(/[^a-z]+/g, ".")}@maatram.edu`,
    phone: `+91 9${String(800000000 + i * 137911).slice(0, 9)}`,
    rollNo: `${college.split(" ")[0].slice(0, 2).toUpperCase()}${batch.slice(0, 4)}${String(i + 1).padStart(3, "0")}`,
    college,
    zone,
    batch,
    year: batch.slice(5),
    department,
    status,
    eventsAttended,
    hours,
    rating,
    skills,
    eventIds,
    lastActiveDays,
    joinedOn: `${batch.slice(0, 4)}-07-15`,
  };
});

const NOW = Date.now();
const at = (minutes) =>
  new Date(NOW + minutes * 60000).toISOString();

const initialEvents = [
  {
    id: 1,
    title: "Beach Cleanup Drive",
    description:
      "Join us to clean the Marina shoreline. Volunteers handle logistics, crowd control and registration.",
    skills: ["Logistics", "Crowd Control", "Event Management"],
    zone: "Zone 1",
    colleges: [
      "Maatram Institute of Technology",
      "Green Valley College",
    ],
    batches: ["2022-2026", "2023-2027"],
    venue: "Marina Beach, Chennai",
    startAt: at(-45),
    endAt: at(180),
    volunteersNeeded: 30,
    status: "Open",
    interested: [1, 2, 3, 5, 6, 9, 12, 13, 15, 18, 20, 21],
    selected: [],
    whatsappLink: "",
    emailNote: "",
    emailsSent: false,
  },
  {
    id: 2,
    title: "Career Guidance Workshop",
    description:
      "Alumni-led workshop for final-year students. Volunteers manage the registration desk and session support.",
    skills: ["Public Speaking", "Teaching", "Registration Desk"],
    zone: "Zone 2",
    colleges: [
      "Green Valley College",
      "St. Xavier's College",
    ],
    batches: ["2021-2025", "2022-2026"],
    venue: "Green Valley Auditorium",
    startAt: at(60 * 26),
    endAt: at(60 * 26 + 300),
    volunteersNeeded: 15,
    status: "Open",
    interested: [2, 3, 4, 6, 7, 8, 9, 11, 12, 14, 17, 18, 22, 23],
    selected: [],
    whatsappLink: "",
    emailNote: "",
    emailsSent: false,
  },
  {
    id: 3,
    title: "Blood Donation Camp",
    description:
      "Volunteers assist with donor registration, first-aid support and crowd management through the day.",
    skills: ["First Aid", "Registration Desk", "Crowd Control"],
    zone: "Zone 4",
    colleges: [
      "Sunrise Engineering College",
      "Maatram Institute of Technology",
    ],
    batches: ["2022-2026", "2024-2028"],
    venue: "Sunrise Campus Hall",
    startAt: at(60 * 20),
    endAt: at(60 * 20 + 360),
    volunteersNeeded: 10,
    status: "Shortlisted",
    interested: [1, 4, 5, 8, 10, 12, 14, 16, 19, 20, 22, 24],
    selected: [4, 8, 12, 14, 20],
    whatsappLink: "",
    emailNote: "",
    emailsSent: true,
  },
  {
    id: 4,
    title: "Tree Plantation Drive",
    description: "Completed plantation drive across Zone 3 campuses.",
    skills: ["Logistics", "Crowd Control"],
    zone: "Zone 3",
    colleges: ["St. Xavier's College"],
    batches: ["2021-2025", "2022-2026"],
    venue: "St. Xavier's Grounds",
    startAt: at(-60 * 24 * 3),
    endAt: at(-60 * 24 * 3 + 300),
    volunteersNeeded: 20,
    status: "Completed",
    interested: [3, 7, 11, 15, 22],
    selected: [3, 7, 15],
    whatsappLink: "",
    emailNote: "",
    emailsSent: true,
  },
  {
    id: 5,
    title: "Winter Book Fair",
    description:
      "Assisted visitors, managed registration and coordinated with stall owners during the fair.",
    skills: ["Registration Desk", "Public Speaking", "Logistics"],
    zone: "Zone 1",
    colleges: [
      "Maatram Institute of Technology",
      "St. Xavier's College",
    ],
    batches: ["2021-2025", "2022-2026", "2023-2027"],
    venue: "Maatram Convention Hall",
    startAt: at(-60 * 24 * 12),
    endAt: at(-60 * 24 * 12 + 480),
    volunteersNeeded: 12,
    status: "Completed",
    interested: [1, 2, 6, 9, 12, 14, 18, 22],
    selected: [1, 2, 12, 18],
    whatsappLink: "",
    emailNote: "",
    emailsSent: true,
  },
];

const ADMIN_PROFILE = {
  name: "Admin User",
  initial: "A",
  email: "admin@maatram.edu",
  phone: "+91 98765 43210",
  role: "Super Admin",
  department: "Volunteer Operations",
  location: "Chennai, Tamil Nadu",
  joinedOn: "01 Jun 2023",
};

const NAV = [
  { key: "overview", label: "Overview", Icon: LayoutDashboard },
  //{ key: "events", label: "Events", Icon: Calendar },
  { key: "history", label: "History", Icon: History },
  { key: "leaderboard", label: "Leaderboard", Icon: Trophy },
  { key: "volunteers", label: "Students", Icon: Users },
  { key: "emails", label: "Emails", Icon: Mail },
];

/* ============================================================
   AI SHORTLIST
   ============================================================ */

const WEIGHT = {
  skill: 15,
  events: 1.2,
  eventsCap: 15,
  hours: 0.15,
  hoursCap: 60,
  rating: 10,
  zone: 8,
  college: 5,
  batch: 4,
  recent: 6,
  stale: -10,
  clash: -25,
  ineligible: -20,
};

function buildShortlist(volunteers, event, allEvents) {
  const eventDay = new Date(event.startAt).toDateString();

  const candidates = volunteers
    .filter((v) => v.status === "Active")
    .map((v) => {
      const reasons = [];

      const skillOverlap = v.skills.filter((s) =>
        event.skills.includes(s)
      );

      const zoneOk = v.zone === event.zone;

      const collegeOk =
        event.colleges.length === 0 ||
        event.colleges.includes(v.college);

      const batchOk =
        event.batches.length === 0 ||
        event.batches.includes(v.batch);

      const eligible = zoneOk && collegeOk && batchOk;

      const clash = allEvents.some(
        (e) =>
          e.id !== event.id &&
          e.selected.includes(v.id) &&
          new Date(e.startAt).toDateString() === eventDay
      );

      let score = 0;

      score += skillOverlap.length * WEIGHT.skill;

      if (skillOverlap.length) {
        reasons.push(`Skills: ${skillOverlap.join(", ")}`);
      }

      score +=
        Math.min(v.eventsAttended, WEIGHT.eventsCap) *
        WEIGHT.events;

      score +=
        Math.min(v.hours, WEIGHT.hoursCap) *
        WEIGHT.hours;

      reasons.push(`${v.eventsAttended} events · ${v.hours}h`);

      score += Math.max(0, v.rating - 3.5) * WEIGHT.rating;

      if (v.rating >= 4.5) {
        reasons.push(`Rating ${v.rating}★`);
      }

      if (zoneOk) {
        score += WEIGHT.zone;
        reasons.push(v.zone);
      }

      if (collegeOk) score += WEIGHT.college;
      if (batchOk) score += WEIGHT.batch;

      if (v.lastActiveDays <= 7) {
        score += WEIGHT.recent;
        reasons.push("Active this week");
      } else if (v.lastActiveDays > 60) {
        score += WEIGHT.stale;
        reasons.push("Low recent activity");
      }

      if (clash) {
        score += WEIGHT.clash;
        reasons.push("Clashes with another event");
      }

      if (!eligible) {
        score += WEIGHT.ineligible;
      }

      return {
        ...v,
        score: Math.max(1, Math.min(99, Math.round(score))),
        reasons,
        eligible,
      };
    })
    .sort((a, b) => b.score - a.score);

  return { candidates };
}

/* ============================================================
   HELPERS
   ============================================================ */



// Convert backend event dates safely.
// Backend may return UTC timestamps with or without the Z marker.
const parseEventDate = (value) => {
  if (!value) return null;

  const normalized =
    typeof value === "string" &&
      !/(Z|[+-]\d{2}:\d{2})$/i.test(value)
      ? `${value}Z`
      : value;

  const date = new Date(normalized);

  return Number.isNaN(date.getTime()) ? null : date;
};

// Display the original event date without timezone conversion
const fmtDate = (dateString) => {
  if (!dateString) return "Date not available";

  const [year, month, day] = dateString.split("-").map(Number);

  if (!year || !month || !day) return "Date not available";

  return new Date(year, month - 1, day).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// Convert stored 24-hour time into 12-hour AM/PM format
const fmtTime = (timeString) => {
  if (!timeString) return "Time not available";

  const [hour, minute] = timeString.split(":").map(Number);

  if (
    !Number.isInteger(hour) ||
    !Number.isInteger(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return "Time not available";
  }

  const period = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;

  return `${String(hour12).padStart(2, "0")}:${String(minute).padStart(2, "0")} ${period}`;
};

const fmtDateTime = (date, time) =>
  `${fmtDate(date)} · ${fmtTime(time)}`;

// ADD THIS BELOW
const fmtTimestamp = (value) => {
  const date = parseEventDate(value);

  if (!date) return "Date unavailable";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });
};


/* ============================================================
   EVENT CARD — STUDENT DASHBOARD STYLE
   ============================================================ */

function EventCard({ event, onOpen, style }) {
  return (
    <article
      className={styles.eventCard}
      style={style}
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
    >
      <div className={styles.eventCardHead}>
        <h3 className={styles.eventTitle}>
          {event.title}
        </h3>
      </div>

      <div className={styles.eventMeta}>
        <span className={styles.metaItem}>
          <Calendar size={14} />
        {fmtDate(event.date)}
        </span>

        <span className={styles.metaItem}>
          <Clock size={14} />
         {fmtTime(event.startTime)}
        </span>

        <span className={styles.metaItem}>
          <MapPin size={14} />
          {event.venue || "Venue not available"}
        </span>
      </div>

      <div className={styles.eventStats}>
        <div>
          <strong>{event.registrationCount || 0}</strong>
          <span>Registered</span>
        </div>

        <div>
          <strong>
            {(event.selected || []).length}/
            {event.volunteersNeeded || 0}
          </strong>
          <span>Selected</span>
        </div>
      </div>

      <div className={styles.eventClickHint}>
        View Details →
      </div>
    </article>
  );
}


/* ============================================================
   ADMIN PROFILE MODAL
   ============================================================ */

function AdminProfileModal({
  admin,
  stats,
  onClose,
}) {
  return (
    <div
      className={styles.modalOverlay}
      onClick={onClose}
    >
      <div
        className={`${styles.modal} ${styles.profileModal}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHead}>
          <div className={styles.profileHeader}>
            <div className={styles.avatarLg}>
              {admin.initial}
            </div>

            <div>
              <h3 className={styles.modalTitle}>
                {admin.name}
              </h3>

              <p className={styles.modalSub}>
                {admin.role}
              </p>
            </div>
          </div>

          <button
            className={styles.modalClose}
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.profileGrid}>
            <div className={styles.profileRow}>
              <span className={styles.profileLabel}>Email</span>
              <span className={styles.profileValue}>
                {admin.email}
              </span>
            </div>

            <div className={styles.profileRow}>
              <span className={styles.profileLabel}>Phone</span>
              <span className={styles.profileValue}>
                {admin.phone}
              </span>
            </div>

            <div className={styles.profileRow}>
              <span className={styles.profileLabel}>Role</span>
              <span className={styles.profileValue}>
                {admin.role}
              </span>
            </div>

            <div className={styles.profileRow}>
              <span className={styles.profileLabel}>Department</span>
              <span className={styles.profileValue}>
                {admin.department}
              </span>
            </div>

            <div className={styles.profileRow}>
              <span className={styles.profileLabel}>Location</span>
              <span className={styles.profileValue}>
                {admin.location}
              </span>
            </div>

            <div className={styles.profileRow}>
              <span className={styles.profileLabel}>Joined</span>
              <span className={styles.profileValue}>
                {admin.joinedOn}
              </span>
            </div>

            <div className={styles.profileRow}>
              <span className={styles.profileLabel}>Events</span>
              <span className={styles.profileValue}>
                {stats.events}
              </span>
            </div>

            <div className={styles.profileRow}>
              <span className={styles.profileLabel}>Emails Sent</span>
              <span className={styles.profileValue}>
                {stats.emails}
              </span>
            </div>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button
            className={styles.ghostBtn}
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   MAIN DASHBOARD
   ============================================================ */

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [deletedEvents, setDeletedEvents] = useState([]);
  const [volunteers] = useState(initialVolunteers);
  const [emailLogs, setEmailLogs] = useState([]);

  const [tab, setTab] = useState("overview");
  const [profileId, setProfileId] = useState(null);
  const [showAdminProfile, setShowAdminProfile] = useState(false);

  const [volStatus, setVolStatus] = useState("All");
  const [volSearch, setVolSearch] = useState("");

  const activeCount = volunteers.filter(
    (v) => v.status === "Active"
  ).length;

  const inactiveCount = volunteers.filter(
    (v) => v.status === "Inactive"
  ).length;

  const totalRegistrations = events.reduce(
    (s, e) => s + (e.registrationCount || 0),
    0
  );

 const activeEvents = events.filter((e) => {
  const end = parseEventDate(e.endAt);

  return (
    e.status !== "Completed" &&
    (!end || end.getTime() > Date.now())
  );
});
  const filteredVolunteers = useMemo(() => {
    const term = volSearch.trim().toLowerCase();

    return volunteers
      .filter(
        (v) =>
          volStatus === "All" ||
          v.status === volStatus
      )
      .filter(
        (v) =>
          !term ||
          v.name.toLowerCase().includes(term) ||
          v.rollNo.toLowerCase().includes(term) ||
          v.college.toLowerCase().includes(term) ||
          v.zone.toLowerCase().includes(term) ||
          v.batch.toLowerCase().includes(term)
      );
  }, [volunteers, volStatus, volSearch]);


  // FETCH EVENTS FROM BACKEND
  useEffect(() => {
   const fetchEvents = async () => {
  try {
    setLoadingEvents(true);

    const result = await getAllEvents();

    if (result.success) {
      const formattedEvents = result.events.map((event) => ({
        // MongoDB ID
        id: event._id,
        eventId: event.eventId,
        eventCode: event.eventCode,

        // Event details
        title: event.eventTitle,
        description: event.eventDescription,
        volunteerWork: event.volunteerWork,
        instructions: event.instructions,

        // Location and schedule
        venue: event.location,
        date: event.date,
        startTime: event.startTime,
        endTime: event.endTime,
        startAt: event.startAt,
        endAt: event.endAt,

        // Volunteer requirements
        volunteersNeeded: event.volunteersNeeded,
        zone: event.zone,
        targetAudience: event.targetAudience,
        eventType: event.eventType || "regular",

        // Dashboard fields
        status:
          event.status === "upcoming"
            ? "Open"
            : event.status,

        interested: Array(
          event.registrationCount || 0
        ).fill(null),

        registrationCount: event.registrationCount || 0,
        selected: [],
        skills: [],
        colleges: [],
        batches: [],

        whatsappLink: "",
        emailNote: "",
        emailsSent: false,
      }));

      setEvents(
        formattedEvents.sort(
          (a, b) => new Date(b.startAt) - new Date(a.startAt)
        )
      );
    } else {
      console.error("Failed to fetch events:", result.message);
    }
  } catch (error) {
    console.error(
      "Fetch Events Error:",
      error.response?.data || error
    );
  } finally {
    setLoadingEvents(false);
  }
};

    fetchEvents();
  }, []);

  /* ============================================================
     EVENT NAVIGATION
     ============================================================ */

  const openManageEvent = (event) => {
    navigate(`/admin/manageevent/${event.eventId}`, {
      state: {
        event,
      },
    });
  };

  const openEditEvent = (event) => {
    navigate("/createevent", {
      state: {
        editMode: true,
        event,
      },
    });
  };

  /* ============================================================
     DELETE / RESTORE
     ============================================================ */

  const handleDeleteEvent = (id) => {
    const ev = events.find((e) => e.id === id);

    if (ev) {
      setDeletedEvents((prev) => [
        {
          ...ev,
          deletedAt: new Date().toISOString(),
        },
        ...prev,
      ]);
    }

    setEvents((prev) =>
      prev.filter((e) => e.id !== id)
    );
  };

  const handleRestoreEvent = (id) => {
    const ev = deletedEvents.find(
      (e) => e.id === id
    );

    if (!ev) return;

    const { deletedAt, ...rest } = ev;

    setEvents((prev) => [rest, ...prev]);

    setDeletedEvents((prev) =>
      prev.filter((e) => e.id !== id)
    );
  };

  const handlePermanentDelete = (id) => {
    if (
      window.confirm(
        "Permanently delete this event? This cannot be undone."
      )
    ) {
      setDeletedEvents((prev) =>
        prev.filter((e) => e.id !== id)
      );
    }
  };


  return (
    <div className={styles.dashboard}>
      <main className={styles.main}>

        {/* OVERVIEW */}
        {tab === "overview" && (
          <div className={styles.tabContent}>

            {/* WELCOME - ONLY ONCE */}
            <section className={styles.welcome}>
              <div>
                <h2 className={styles.welcomeTitle}>
                  Welcome,{" "}
                  <span className={styles.accent}>
                    {localStorage.getItem("name") || "Admin"}
                  </span>
                </h2>

                <p className={styles.welcomeText}>
                  You have{" "}
                  <strong>
                    {events.filter(
                      (e) => e.status === "Open"
                    ).length}
                  </strong>{" "}
                  open events. Keep managing your volunteering activities!
                </p>
              </div>


              <div className={styles.welcomeStats}>
                {/* Total Events */}
                <div className={styles.welcomeStat}>
                  <span className={styles.welcomeStatNum}>
                    {events.length}
                  </span>
                  <span className={styles.welcomeStatLabel}>
                    TOTAL EVENTS
                  </span>
                </div>

                {/* Upcoming Events */}
                <div className={styles.welcomeStat}>
                  <span className={styles.welcomeStatNum}>
                    {activeEvents.length}
                  </span>
                  <span className={styles.welcomeStatLabel}>
                    UPCOMING EVENTS
                  </span>
                </div>
              </div>

            </section>

            {/* UPCOMING EVENTS - ONLY ONCE */}
            <section className={styles.animatedSection}>
              <div className={styles.panelHeader}>
                <h3 className={styles.sectionTitle}>
                  Upcoming Events
                </h3>

                <button
                  className={styles.postBtn}
                  onClick={() => navigate("/admin/createevent")}
                >
                  <Plus size={16} />
                  Post Event
                </button>
              </div>

              {loadingEvents ? (
                <p className={styles.emptyText}>
                  Loading events...
                </p>
              ) : activeEvents.length === 0 ? (
                <p className={styles.emptyText}>
                  No upcoming events. Click Post Event to create one.
                </p>
              ) : (
                <div className={styles.carousel}>
                  <div className={styles.carouselTrack}>
                    {activeEvents.map((ev, i) => (
                      <div
                        className={styles.carouselItem}
                        key={ev.id}
                      >
                        <EventCard
                          event={ev}
                          style={{ "--stagger": i }}
                          onOpen={() => openManageEvent(ev)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

          </div>
        )}

        {/* EVENTS */}
        {tab === "events" && (
          <div className={styles.tabContent}>
            <div className={styles.panelHeader}>
              <h3 className={styles.sectionTitle}>
                Event Management
              </h3>

              <button
                className={styles.createBtn}
                onClick={() => navigate("/createevent")}
              >
                <Plus size={14} className={styles.inlineIcon} />
                Post Event
              </button>
            </div>

            <div className={styles.eventsGrid}>
              {events.map((ev, idx) => (
                <EventCard
                  key={ev.id}
                  event={ev}
                  style={{ "--stagger": idx }}
                  onOpen={() => openManageEvent(ev)}
                />
              ))}
            </div>

            {events.length === 0 && (
              <p className={styles.emptyText}>
                No events yet. Click Post Event to create one.
              </p>
            )}
          </div>
        )}

        

        {/* EMAILS */}
        {tab === "emails" && (
          <section
            className={`${styles.tableSection} ${styles.tabContent}`}
          >
            <h3 className={styles.sectionTitle}>
              <Mail
                size={20}
                className={styles.inlineIcon}
              />
              Email Log
            </h3>

            {emailLogs.length === 0 ? (
              <p className={styles.emptyText}>
                No emails sent yet.
              </p>
            ) : (
              <div className={styles.historyList}>
                {emailLogs.map((log) => (
                  <div
                    key={log.id}
                    className={styles.emailLogItem}
                  >
                    <div className={styles.eventCardHead}>
                      <strong>
                        {log.type} · {log.eventTitle}
                      </strong>

                      <span
                        className={`${styles.pill} ${styles.pillYellow}`}
                      >
                        {log.count} sent
                      </span>
                    </div>

                    <p className={styles.emailStatus}>
                      {fmtTimestamp(log.sentAt)} · {log.subject}
                    </p>

                    {log.whatsappLink && (
                      <p className={styles.emailStatus}>
                        <MessageCircle
                          size={12}
                          className={styles.inlineIcon}
                        />
                        WhatsApp:{" "}
                        <a
                          href={log.whatsappLink}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {log.whatsappLink}
                        </a>
                      </p>
                    )}

                    <p className={styles.emailStatus}>
                      To: {log.recipients.join(", ")}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

      </main>

      {/* ADMIN PROFILE */}
      {showAdminProfile && (
        <AdminProfileModal
          admin={ADMIN_PROFILE}
          stats={{
            events: events.length,
            emails: emailLogs.length,
          }}
          onClose={() => setShowAdminProfile(false)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
