import React, { useEffect, useMemo, useState } from "react";
import {
  Plus,
  PlusCircle,
  Trophy,
  Users,
  Mail,
  GraduationCap,
  UserCheck,
  UserX,
  FileText,
  Calendar,
  Clock,
  MapPin,
  Map as MapIcon,
  CheckCircle,
  Lock,
  Circle,
  X,
  ArrowRight,
  Hand,
  QrCode,
  History,
  Trash2,
  RotateCcw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import styles from "./AdminDashboard.module.css";

/* ============================================================
   SHARED DATA + CONSTANTS
   ============================================================ */
const ZONES = ["Zone 1", "Zone 2", "Zone 3", "Zone 4", "Zone 5"];

const COLLEGES = [
  "Maatram Institute of Technology",
  "Green Valley College",
  "St. Xavier's College",
  "Sunrise Engineering College",
];

const BATCHES = ["2021-2025", "2022-2026", "2023-2027", "2024-2028"];

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

const pad = (n) => String(n).padStart(2, "0");

const initialVolunteers = VOLUNTEER_ROWS.map((row, i) => {
  const [name, college, zone, batch, department, status, eventsAttended, hours, rating, skills, eventIds, lastActiveDays] = row;
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
const at = (minutes) => new Date(NOW + minutes * 60000).toISOString();

const initialEvents = [
  {
    id: 1,
    title: "Beach Cleanup Drive",
    description:
      "Join us to clean the Marina shoreline. Volunteers handle logistics, crowd control and the registration desk.",
    skills: ["Logistics", "Crowd Control", "Event Management"],
    zone: "Zone 1",
    colleges: ["Maatram Institute of Technology", "Green Valley College"],
    batches: ["2022-2026", "2023-2027"],
    venue: "Marina Beach, Chennai",
    startAt: at(-45),
    endAt: at(180),
    volunteersNeeded: 30,
    status: "Open",
    interested: [1, 2, 3, 5, 6, 9, 12, 13, 15, 18, 20, 21],
    selected: [],
    emailsSent: false,
    reminderSent: false,
    qrToken: null,
    qrGeneratedAt: null,
  },
  {
    id: 2,
    title: "Career Guidance Workshop",
    description:
      "Alumni-led workshop for final-year students. Volunteers manage the registration desk, session support and hospitality.",
    skills: ["Public Speaking", "Teaching", "Registration Desk"],
    zone: "Zone 2",
    colleges: ["Green Valley College", "St. Xavier's College"],
    batches: ["2021-2025", "2022-2026"],
    venue: "Green Valley Auditorium",
    startAt: at(60 * 26),
    endAt: at(60 * 26 + 300),
    volunteersNeeded: 15,
    status: "Open",
    interested: [2, 3, 4, 6, 7, 8, 9, 11, 12, 14, 17, 18, 22, 23],
    selected: [],
    emailsSent: false,
    reminderSent: false,
    qrToken: null,
    qrGeneratedAt: null,
  },
  {
    id: 3,
    title: "Blood Donation Camp",
    description:
      "Volunteers assist with donor registration, first-aid support and crowd management through the day.",
    skills: ["First Aid", "Registration Desk", "Crowd Control"],
    zone: "Zone 4",
    colleges: ["Sunrise Engineering College", "Maatram Institute of Technology"],
    batches: ["2022-2026", "2024-2028"],
    venue: "Sunrise Campus Hall",
    startAt: at(60 * 20),
    endAt: at(60 * 20 + 360),
    volunteersNeeded: 10,
    status: "Shortlisted",
    interested: [1, 4, 5, 8, 10, 12, 14, 16, 19, 20, 22, 24],
    selected: [4, 8, 12, 14, 20],
    emailsSent: true,
    emailsSentAt: at(-600),
    reminderSent: false,
    qrToken: null,
    qrGeneratedAt: null,
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
    emailsSent: true,
    emailsSentAt: at(-60 * 24 * 4),
    reminderSent: true,
    reminderSentAt: at(-60 * 24 * 3 - 60),
    qrToken: "MTM-4-TREEPLANT",
    qrGeneratedAt: at(-60 * 24 * 3 - 40),
  },
  {
    id: 5,
    title: "Winter Book Fair",
    description:
      "Assisted visitors, managed the registration desk and coordinated with stall owners during the fair.",
    skills: ["Registration Desk", "Public Speaking", "Logistics"],
    zone: "Zone 1",
    colleges: ["Maatram Institute of Technology", "St. Xavier's College"],
    batches: ["2021-2025", "2022-2026", "2023-2027"],
    venue: "Maatram Convention Hall",
    startAt: at(-60 * 24 * 12),
    endAt: at(-60 * 24 * 12 + 480),
    volunteersNeeded: 12,
    status: "Completed",
    interested: [1, 2, 6, 9, 12, 14, 18, 22],
    selected: [1, 2, 12, 18],
    emailsSent: true,
    emailsSentAt: at(-60 * 24 * 13),
    reminderSent: true,
    reminderSentAt: at(-60 * 24 * 12 - 120),
    qrToken: "MTM-5-WINTERBOOK",
    qrGeneratedAt: at(-60 * 24 * 12 - 40),
  },
];

const recentRegistrations = [
  { id: 1, name: "Santhosh Kumar", role: "Student", event: "Beach Cleanup Drive", date: "2 hrs ago" },
  { id: 2, name: "Priya Ramesh", role: "Alumni", event: "Career Guidance Workshop", date: "5 hrs ago" },
  { id: 3, name: "Karthik Vel", role: "Student", event: "Blood Donation Camp", date: "1 day ago" },
  { id: 4, name: "Meena Suresh", role: "Alumni", event: "Career Guidance Workshop", date: "1 day ago" },
  { id: 5, name: "Arjun Kumar", role: "Student", event: "Beach Cleanup Drive", date: "2 days ago" },
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
  lastLogin: "Just now",
  permissions: [
    "Post Events",
    "Shortlist Volunteers",
    "Send Emails",
    "Manage Students",
    "Generate QR",
    "View Reports",
  ],
};

/* ============================================================
   RAG-STYLE RECOMMENDER
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

      const skillOverlap = v.skills.filter((s) => event.skills.includes(s));
      const zoneOk = v.zone === event.zone;
      const collegeOk = event.colleges.length === 0 || event.colleges.includes(v.college);
      const batchOk = event.batches.length === 0 || event.batches.includes(v.batch);
      const eligible = zoneOk && collegeOk && batchOk;

      const clash = allEvents.some(
        (e) =>
          e.id !== event.id &&
          e.selected.includes(v.id) &&
          new Date(e.startAt).toDateString() === eventDay
      );

      let score = 0;

      score += skillOverlap.length * WEIGHT.skill;
      if (skillOverlap.length) reasons.push(`Skills: ${skillOverlap.join(", ")}`);

      score += Math.min(v.eventsAttended, WEIGHT.eventsCap) * WEIGHT.events;
      score += Math.min(v.hours, WEIGHT.hoursCap) * WEIGHT.hours;
      reasons.push(`${v.eventsAttended} events · ${v.hours}h`);

      score += Math.max(0, v.rating - 3.5) * WEIGHT.rating;
      if (v.rating >= 4.5) reasons.push(`Rating ${v.rating}★`);

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
      if (!eligible) score += WEIGHT.ineligible;

      return {
        ...v,
        score: Math.max(1, Math.min(99, Math.round(score))),
        reasons,
        eligible,
      };
    })
    .sort((a, b) => b.score - a.score);

  const eligibleCount = candidates.filter((c) => c.eligible).length;
  const summary =
    `Retrieved ${eligibleCount} matching volunteers out of ${candidates.length} active students. ` +
    `Ranking blends skill overlap, past participation, hours logged, rating, recent activity and schedule clashes.`;

  return { candidates, eligibleCount, activeCount: candidates.length, summary };
}

/* ============================================================
   HELPERS
   ============================================================ */
const QR_LEAD_MS = 30 * 60 * 1000;
const REMINDER_LEAD_MS = 24 * 60 * 60 * 1000;

const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

const fmtTime = (iso) =>
  new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

const fmtDateTime = (iso) => `${fmtDate(iso)} · ${fmtTime(iso)}`;

const countdown = (ms) => {
  if (!ms || ms <= 0) return "00:00:00";
  const total = Math.floor(ms / 1000);
  return `${pad(Math.floor(total / 3600))}:${pad(Math.floor((total % 3600) / 60))}:${pad(total % 60)}`;
};

const pointsOf = (v) => v.eventsAttended * 10 + v.hours * 2 + Math.round(v.rating * 20);

/* ============================================================
   GAMIFICATION HELPERS
   ============================================================ */
const getLevel = (v) => {
  const pts = pointsOf(v);
  if (pts >= 350) return { num: 5, name: "Legend" };
  if (pts >= 300) return { num: 4, name: "Champion" };
  if (pts >= 250) return { num: 3, name: "Expert" };
  if (pts >= 150) return { num: 2, name: "Contributor" };
  return { num: 1, name: "Rookie" };
};

const getBadges = (v) => {
  const badges = [];

  if (v.eventsAttended >= 15) badges.push({ id: "veteran", label: "Veteran", icon: "🎖️", tone: "purple" });
  else if (v.eventsAttended >= 10) badges.push({ id: "exp", label: "Experienced", icon: "🏅", tone: "blue" });
  else if (v.eventsAttended >= 5) badges.push({ id: "active", label: "Active", icon: "🎯", tone: "green" });

  if (v.hours >= 50) badges.push({ id: "marathon", label: "50h+", icon: "⏱️", tone: "orange" });
  else if (v.hours >= 25) badges.push({ id: "dedicated", label: "25h+", icon: "⏲️", tone: "cyan" });

  if (v.rating >= 4.7) badges.push({ id: "top", label: "Top Rated", icon: "⭐", tone: "yellow" });
  if (v.lastActiveDays <= 2) badges.push({ id: "hot", label: "On Fire", icon: "🔥", tone: "red" });
  if (v.skills.length >= 3) badges.push({ id: "versatile", label: "Versatile", icon: "🎨", tone: "pink" });

  return badges;
};

const getLastSeen = (days) => {
  if (days === 0) return { label: "Online now", tone: "live" };
  if (days === 1) return { label: "Yesterday", tone: "recent" };
  if (days <= 6) return { label: `${days}d ago`, tone: "recent" };
  if (days <= 30) return { label: `${Math.floor(days / 7)}w ago`, tone: "old" };
  if (days <= 365) return { label: `${Math.floor(days / 30)}mo ago`, tone: "old" };
  return { label: "Long inactive", tone: "stale" };
};

function getQrState(event, nowMs) {
  const start = new Date(event.startAt).getTime();
  const end = new Date(event.endAt).getTime();
  if (nowMs > end) return { phase: "expired", msLeft: 0 };
  if (nowMs < start - QR_LEAD_MS) return { phase: "locked", msLeft: start - QR_LEAD_MS - nowMs };
  return { phase: "active", msLeft: end - nowMs };
}

function reminderDue(event, nowMs) {
  const start = new Date(event.startAt).getTime();
  return nowMs >= start - REMINDER_LEAD_MS && nowMs < start;
}

function hashStr(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36).toUpperCase();
}

const makeEventToken = (event) => `MTM-${event.id}-${hashStr(event.startAt + event.title)}`;

function mulberry32(a) {
  return function rand() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildQrMatrix(value) {
  const N = 25;
  let seed = 7;
  for (let i = 0; i < value.length; i += 1) seed = (seed * 31 + value.charCodeAt(i)) >>> 0;
  const rand = mulberry32(seed);
  const m = Array.from({ length: N }, () => Array(N).fill(false));

  const drawFinder = (r0, c0) => {
    for (let r = 0; r < 7; r += 1) {
      for (let c = 0; c < 7; c += 1) {
        const edge = r === 0 || r === 6 || c === 0 || c === 6;
        const core = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        if (r0 + r < N && c0 + c < N) m[r0 + r][c0 + c] = edge || core;
      }
    }
  };
  drawFinder(0, 0);
  drawFinder(0, N - 7);
  drawFinder(N - 7, 0);

  const reserved = (r, c) => (r < 8 && c < 8) || (r < 8 && c >= N - 8) || (r >= N - 8 && c < 8);
  for (let r = 0; r < N; r += 1) {
    for (let c = 0; c < N; c += 1) {
      if (!reserved(r, c)) m[r][c] = rand() > 0.5;
    }
  }
  for (let i = 8; i < N - 8; i += 1) {
    m[6][i] = i % 2 === 0;
    m[i][6] = i % 2 === 0;
  }
  return m;
}

function PseudoQR({ value, size = 210 }) {
  const matrix = useMemo(() => buildQrMatrix(value), [value]);
  const n = matrix.length;
  const cell = size / n;
  return (
    <svg
      width={size}
      height={size}
      className={styles.qrSvg}
      role="img"
      aria-label={`Attendance QR ${value}`}
    >
      <rect width={size} height={size} fill="#ffffff" />
      {matrix.map((row, r) =>
        row.map((on, c) =>
          on ? (
            <rect
              key={`${r}-${c}`}
              x={c * cell}
              y={r * cell}
              width={cell}
              height={cell}
              fill="#111111"
            />
          ) : null
        )
      )}
    </svg>
  );
}

/* ============================================================
   EVENT FORM
   ============================================================ */
function EventForm({ onSubmit, onCancel }) {
  const today = new Date();
  const defaultDate = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

  const [form, setForm] = useState({
    title: "",
    description: "",
    date: defaultDate,
    startTime: "09:00",
    endTime: "17:00",
    venue: "",
    zone: ZONES[0],
    colleges: [],
    batches: [],
    skills: [],
    volunteersNeeded: 20,
  });
  const [error, setError] = useState("");

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const toggleIn = (key, value) =>
    setForm((f) => ({
      ...f,
      [key]: f[key].includes(value) ? f[key].filter((x) => x !== value) : [...f[key], value],
    }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return setError("Please enter the event title.");
    if (!form.venue.trim()) return setError("Please enter the venue.");
    const startAt = new Date(`${form.date}T${form.startTime}:00`);
    const endAt = new Date(`${form.date}T${form.endTime}:00`);
    if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime()))
      return setError("Invalid date or time.");
    if (endAt <= startAt) return setError("End time must be after the start time.");
    setError("");
    return onSubmit({ ...form, startAt: startAt.toISOString(), endAt: endAt.toISOString() });
  };

  return (
    <form className={styles.formCard} onSubmit={handleSubmit}>
      <h3 className={styles.sectionTitle}>Post a Volunteering Event</h3>

      <div className={styles.formGrid}>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Event title *</span>
          <input
            className={styles.input}
            value={form.title}
            onChange={(e) => setField("title", e.target.value)}
            placeholder="e.g. Beach Cleanup Drive"
          />
        </label>

        <label className={styles.field}>
          <span className={styles.fieldLabel}>Venue *</span>
          <input
            className={styles.input}
            value={form.venue}
            onChange={(e) => setField("venue", e.target.value)}
            placeholder="e.g. Marina Beach, Chennai"
          />
        </label>

        <label className={styles.field}>
          <span className={styles.fieldLabel}>Date *</span>
          <input
            type="date"
            className={styles.input}
            value={form.date}
            onChange={(e) => setField("date", e.target.value)}
          />
        </label>

        <label className={styles.field}>
          <span className={styles.fieldLabel}>Start time</span>
          <input
            type="time"
            className={styles.input}
            value={form.startTime}
            onChange={(e) => setField("startTime", e.target.value)}
          />
        </label>

        <label className={styles.field}>
          <span className={styles.fieldLabel}>End time</span>
          <input
            type="time"
            className={styles.input}
            value={form.endTime}
            onChange={(e) => setField("endTime", e.target.value)}
          />
        </label>

        <label className={styles.field}>
          <span className={styles.fieldLabel}>Zone</span>
          <select
            className={styles.select}
            value={form.zone}
            onChange={(e) => setField("zone", e.target.value)}
          >
            {ZONES.map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.field}>
          <span className={styles.fieldLabel}>Volunteers needed</span>
          <input
            type="number"
            min="1"
            className={styles.input}
            value={form.volunteersNeeded}
            onChange={(e) => setField("volunteersNeeded", e.target.value)}
          />
        </label>
      </div>

      <label className={styles.field} style={{ marginTop: 14 }}>
        <span className={styles.fieldLabel}>Description</span>
        <textarea
          className={styles.textarea}
          rows={3}
          value={form.description}
          onChange={(e) => setField("description", e.target.value)}
          placeholder="What will the volunteers do?"
        />
      </label>

      <div className={styles.formBlock}>
        <span className={styles.fieldLabel}>Required skills</span>
        <div className={styles.chipGroup}>
          {SKILLS.map((s) => (
            <button
              type="button"
              key={s}
              className={`${styles.chip} ${form.skills.includes(s) ? styles.chipOn : ""}`}
              onClick={() => toggleIn("skills", s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.formBlock}>
        <span className={styles.fieldLabel}>Preferred colleges</span>
        <div className={styles.chipGroup}>
          {COLLEGES.map((c) => (
            <button
              type="button"
              key={c}
              className={`${styles.chip} ${form.colleges.includes(c) ? styles.chipOn : ""}`}
              onClick={() => toggleIn("colleges", c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.formBlock}>
        <span className={styles.fieldLabel}>Preferred batches</span>
        <div className={styles.chipGroup}>
          {BATCHES.map((b) => (
            <button
              type="button"
              key={b}
              className={`${styles.chip} ${form.batches.includes(b) ? styles.chipOn : ""}`}
              onClick={() => toggleIn("batches", b)}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      {error && <p className={styles.formError}>{error}</p>}

      <div className={styles.formActions}>
        <button type="submit" className={styles.createBtn}>
          Publish Event
        </button>
        <button type="button" className={styles.ghostBtn} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

/* ============================================================
   EVENT CARD
   ============================================================ */
function EventCard({ event, now, onOpen, onShortlist, onDelete }) {
  const qr = getQrState(event, now.getTime());
  const qrLabel = qr.phase === "active" ? "Live" : qr.phase === "expired" ? "Closed" : "Locked";

  return (
    <article className={styles.eventCard}>
      <div className={styles.eventCardHead}>
        <h3 className={styles.eventTitle}>{event.title}</h3>
        <span
          className={`${styles.pill} ${
            event.status === "Completed"
              ? styles.pillGrey
              : event.status === "Shortlisted"
              ? styles.pillGreen
              : styles.pillBlue
          }`}
        >
          {event.status}
        </span>
      </div>

      <p className={styles.eventDesc}>{event.description}</p>

      <div className={styles.eventMeta}>
        <span className={styles.metaItem}>
          <Calendar size={14} /> {fmtDate(event.startAt)}
        </span>
        <span className={styles.metaItem}>
          <Clock size={14} /> {fmtTime(event.startAt)} – {fmtTime(event.endAt)}
        </span>
        <span className={styles.metaItem}>
          <MapPin size={14} /> {event.venue}
        </span>
        <span className={styles.metaItem}>
          <MapIcon size={14} /> {event.zone}
        </span>
      </div>

      <div className={styles.eventStats}>
        <div>
          <strong>{event.interested.length}</strong>
          <span>Interested</span>
        </div>
        <div>
          <strong>
            {event.selected.length}/{event.volunteersNeeded}
          </strong>
          <span>Selected</span>
        </div>
        <div>
          <strong>{qrLabel}</strong>
          <span>QR</span>
        </div>
      </div>

      <div className={styles.eventCardActions}>
        <button className={styles.approveBtn} onClick={onOpen}>
          Manage
        </button>
        <button className={styles.ghostBtn} onClick={onShortlist}>
          AI Shortlist
        </button>
        <button className={styles.deleteBtn} onClick={onDelete}>
          Delete
        </button>
      </div>
    </article>
  );
}

/* ============================================================
   SHORTLIST MODAL (RAG)
   ============================================================ */
function ShortlistModal({ event, volunteers, events, onClose, onConfirm }) {
  const { candidates, summary } = useMemo(
    () => buildShortlist(volunteers, event, events),
    [volunteers, event, events]
  );

  const [showAll, setShowAll] = useState(false);
  const [selectedIds, setSelectedIds] = useState(() => {
    if (event.selected.length) return event.selected;
    return candidates
      .filter((c) => c.eligible)
      .slice(0, event.volunteersNeeded)
      .map((c) => c.id);
  });

  const visible = showAll ? candidates : candidates.filter((c) => c.eligible);

  const toggle = (id) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const autoPick = () =>
    setSelectedIds(
      candidates
        .filter((c) => c.eligible)
        .slice(0, event.volunteersNeeded)
        .map((c) => c.id)
    );

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHead}>
          <div>
            <h3 className={styles.modalTitle}>AI Shortlist · {event.title}</h3>
            <p className={styles.modalSub}>
              {event.interested.length} volunteers expressed interest · need {event.volunteersNeeded}
            </p>
          </div>
          <button className={styles.modalClose} onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <div className={styles.modalBody}>
          <p className={styles.ragSummary}>{summary}</p>

          <div className={styles.filterBar}>
            <label className={styles.checkRow}>
              <input
                type="checkbox"
                checked={showAll}
                onChange={(e) => setShowAll(e.target.checked)}
              />
              Show non-matching volunteers too
            </label>
            <button className={styles.ghostBtn} onClick={autoPick}>
              Auto-pick top {event.volunteersNeeded}
            </button>
          </div>

          <div className={styles.shortlistList}>
            {visible.map((c, idx) => {
              const checked = selectedIds.includes(c.id);
              return (
                <label
                  key={c.id}
                  className={`${styles.shortlistItem} ${checked ? styles.shortlistItemOn : ""}`}
                >
                  <input
                    type="checkbox"
                    className={styles.shortlistCheck}
                    checked={checked}
                    onChange={() => toggle(c.id)}
                  />
                  <span className={styles.rankBadge}>#{idx + 1}</span>
                  <span className={styles.shortlistInfo}>
                    <span className={styles.listName}>{c.name}</span>
                    <span className={styles.listSub}>
                      {c.rollNo} · {c.college} · {c.zone} · {c.batch}
                    </span>
                    <span className={styles.shortlistReasons}>{c.reasons.join(" • ")}</span>
                  </span>
                  <span className={styles.shortlistScore}>{c.score}</span>
                </label>
              );
            })}
            {visible.length === 0 && (
              <p className={styles.emptyText}>No matching volunteers. Enable "Show non-matching".</p>
            )}
          </div>
        </div>

        <div className={styles.modalFooter}>
          <span className={styles.selectedCount}>
            {selectedIds.length} / {event.volunteersNeeded} selected
          </span>
          <div className={styles.eventCardActions}>
            <button className={styles.ghostBtn} onClick={onClose}>
              Cancel
            </button>
            <button className={styles.createBtn} onClick={() => onConfirm(selectedIds)}>
              Confirm Selection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   EVENT DETAIL MODAL (QR + Emails)
   ============================================================ */
function EventDetailModal({ event, volunteers, now, onClose, onGenerateQr, onSendEmails, onSendReminder, onEditShortlist }) {
  const qr = getQrState(event, now.getTime());
  const due = reminderDue(event, now.getTime());
  const selectedVolunteers = event.selected
    .map((id) => volunteers.find((v) => v.id === id))
    .filter(Boolean);

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHead}>
          <div>
            <h3 className={styles.modalTitle}>{event.title}</h3>
            <p className={styles.modalSub}>
              {fmtDateTime(event.startAt)} – {fmtTime(event.endAt)} · {event.venue}
            </p>
          </div>
          <button className={styles.modalClose} onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <div className={styles.modalBody}>
          <p className={styles.eventDesc}>{event.description}</p>

          <div className={styles.eventStats}>
            <div>
              <strong>{event.interested.length}</strong>
              <span>Interested</span>
            </div>
            <div>
              <strong>
                {event.selected.length}/{event.volunteersNeeded}
              </strong>
              <span>Selected</span>
            </div>
            <div>
              <strong>{event.emailsSent ? "Sent" : "Not sent"}</strong>
              <span>Emails</span>
            </div>
            <div>
              <strong>{event.reminderSent ? "Sent" : due ? "Due" : "Waiting"}</strong>
              <span>Reminder</span>
            </div>
          </div>

          <div className={styles.qrPanel}>
            <h4 className={styles.sectionTitle}>
              <QrCode size={18} className={styles.inlineIcon} /> Attendance QR
            </h4>

            {qr.phase === "active" && (
              <>
                {event.qrToken ? (
                  <>
                    <PseudoQR value={event.qrToken} />
                    <p className={styles.qrToken}>{event.qrToken}</p>
                    <p className={styles.qrStatus}>
                      <CheckCircle size={16} className={styles.inlineIcon} /> QR is LIVE · closes in{" "}
                      <strong>{countdown(qr.msLeft)}</strong>
                    </p>
                    <p className={styles.qrHint}>
                      Volunteers scan this to mark attendance. Valid until {fmtTime(event.endAt)}.
                    </p>
                  </>
                ) : (
                  <>
                    <p className={styles.qrStatus}>
                      <CheckCircle size={16} className={styles.inlineIcon} /> QR window is open ·
                      closes in <strong>{countdown(qr.msLeft)}</strong>
                    </p>
                    <button className={styles.createBtn} onClick={() => onGenerateQr(event.id)}>
                      Generate QR
                    </button>
                  </>
                )}
              </>
            )}

            {qr.phase === "locked" && (
              <>
                <p className={styles.qrStatus}>
                  <Lock size={16} className={styles.inlineIcon} /> QR unlocks 30 minutes before the
                  event · in <strong>{countdown(qr.msLeft)}</strong>
                </p>
                <p className={styles.qrHint}>
                  Opens at {fmtDateTime(new Date(new Date(event.startAt).getTime() - QR_LEAD_MS).toISOString())}
                </p>
                <button className={styles.ghostBtn} disabled>
                  Generate QR (locked)
                </button>
              </>
            )}

            {qr.phase === "expired" && (
              <>
                {event.qrToken ? (
                  <>
                    <PseudoQR value={event.qrToken} size={160} />
                    <p className={styles.qrToken}>{event.qrToken}</p>
                  </>
                ) : null}
                <p className={styles.qrStatus}>
                  <Circle size={16} className={styles.inlineIcon} /> QR window closed at{" "}
                  {fmtTime(event.endAt)}
                </p>
              </>
            )}
          </div>

          <div className={styles.formBlock}>
            <h4 className={styles.sectionTitle}>Selected Volunteers ({selectedVolunteers.length})</h4>
            {selectedVolunteers.length === 0 ? (
              <p className={styles.emptyText}>No volunteers selected yet. Run the AI shortlist.</p>
            ) : (
              <div className={styles.listWrap}>
                {selectedVolunteers.map((v) => (
                  <div key={v.id} className={styles.listItem}>
                    <div className={styles.listAvatar}>{v.name.charAt(0)}</div>
                    <div className={styles.listInfo}>
                      <span className={styles.listName}>{v.name}</span>
                      <span className={styles.listSub}>{v.email}</span>
                    </div>
                    <span className={`${styles.pill} ${styles.pillGreen}`}>{v.zone}</span>
                  </div>
                ))}
              </div>
            )}

            <div className={styles.formActions}>
              <button className={styles.ghostBtn} onClick={onEditShortlist}>
                Edit Shortlist
              </button>
              <button
                className={styles.approveBtn}
                disabled={selectedVolunteers.length === 0}
                onClick={() => onSendEmails(event.id)}
              >
                {event.emailsSent ? "Resend Selection Emails" : "Send Selection Emails"}
              </button>
              <button
                className={styles.createBtn}
                disabled={selectedVolunteers.length === 0 || event.reminderSent || !due}
                onClick={() => onSendReminder(event.id)}
              >
                {event.reminderSent ? "Reminder Sent" : "Send Reminder"}
              </button>
            </div>
            {!due && !event.reminderSent && (
              <p className={styles.qrHint}>Reminder can be sent 24 hours before the event.</p>
            )}
          </div>
        </div>

        <div className={styles.modalFooter}>
          <span className={styles.selectedCount}>
            Created QR: {event.qrGeneratedAt ? fmtDateTime(event.qrGeneratedAt) : "—"}
          </span>
          <button className={styles.ghostBtn} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   VOLUNTEER PROFILE MODAL
   ============================================================ */
function ProfileModal({ volunteer, events, onClose }) {
  const attended = volunteer.eventIds
    .map((id) => events.find((e) => e.id === id))
    .filter(Boolean);

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHead}>
          <div className={styles.profileHeader}>
            <div className={styles.avatarLg}>{volunteer.name.charAt(0)}</div>
            <div>
              <h3 className={styles.modalTitle}>{volunteer.name}</h3>
              <p className={styles.modalSub}>
                {volunteer.rollNo} · {volunteer.department} · {volunteer.batch}
              </p>
            </div>
          </div>
          <button className={styles.modalClose} onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.profileGrid}>
            <div className={styles.profileRow}>
              <span className={styles.profileLabel}>Status</span>
              <span
                className={`${styles.pill} ${
                  volunteer.status === "Active" ? styles.pillGreen : styles.pillGrey
                }`}
              >
                {volunteer.status}
              </span>
            </div>
            <div className={styles.profileRow}>
              <span className={styles.profileLabel}>Email</span>
              <span className={styles.profileValue}>{volunteer.email}</span>
            </div>
            <div className={styles.profileRow}>
              <span className={styles.profileLabel}>Phone</span>
              <span className={styles.profileValue}>{volunteer.phone}</span>
            </div>
            <div className={styles.profileRow}>
              <span className={styles.profileLabel}>College</span>
              <span className={styles.profileValue}>{volunteer.college}</span>
            </div>
            <div className={styles.profileRow}>
              <span className={styles.profileLabel}>Zone</span>
              <span className={styles.profileValue}>{volunteer.zone}</span>
            </div>
            <div className={styles.profileRow}>
              <span className={styles.profileLabel}>Batch</span>
              <span className={styles.profileValue}>{volunteer.batch}</span>
            </div>
            <div className={styles.profileRow}>
              <span className={styles.profileLabel}>Joined</span>
              <span className={styles.profileValue}>{volunteer.joinedOn}</span>
            </div>
            <div className={styles.profileRow}>
              <span className={styles.profileLabel}>Events</span>
              <span className={styles.profileValue}>{volunteer.eventsAttended}</span>
            </div>
            <div className={styles.profileRow}>
              <span className={styles.profileLabel}>Hours</span>
              <span className={styles.profileValue}>{volunteer.hours} h</span>
            </div>
            <div className={styles.profileRow}>
              <span className={styles.profileLabel}>Rating</span>
              <span className={styles.profileValue}>{volunteer.rating} ★</span>
            </div>
            <div className={styles.profileRow}>
              <span className={styles.profileLabel}>Points</span>
              <span className={styles.profileValue}>{pointsOf(volunteer)}</span>
            </div>
            <div className={styles.profileRow}>
              <span className={styles.profileLabel}>Last Active</span>
              <span className={styles.profileValue}>{volunteer.lastActiveDays} day(s) ago</span>
            </div>
          </div>

          <div className={styles.formBlock}>
            <span className={styles.fieldLabel}>Skills</span>
            <div className={styles.chipGroup}>
              {volunteer.skills.map((s) => (
                <span key={s} className={`${styles.chip} ${styles.chipOn}`}>
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className={styles.formBlock}>
            <span className={styles.fieldLabel}>Events participated</span>
            {attended.length === 0 ? (
              <p className={styles.emptyText}>No events attended yet.</p>
            ) : (
              <div className={styles.listWrap}>
                {attended.map((e) => (
                  <div key={e.id} className={styles.listItem}>
                    <div className={styles.listInfo}>
                      <span className={styles.listName}>{e.title}</span>
                      <span className={styles.listSub}>
                        {fmtDate(e.startAt)} · {e.zone}
                      </span>
                    </div>
                    <span className={`${styles.pill} ${styles.pillBlue}`}>{e.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.ghostBtn} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   ADMIN PROFILE MODAL
   ============================================================ */
function AdminProfileModal({ admin, stats, onClose }) {
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHead}>
          <div className={styles.profileHeader}>
            <div className={styles.avatarLg}>{admin.initial}</div>
            <div>
              <h3 className={styles.modalTitle}>{admin.name}</h3>
              <p className={styles.modalSub}>
                {admin.role} · {admin.department}
              </p>
            </div>
          </div>
          <button className={styles.modalClose} onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.adminStatGrid}>
            <div className={styles.adminStat}>
              <span className={styles.adminStatNum}>{stats.events}</span>
              <span className={styles.adminStatLabel}>Events Posted</span>
            </div>
            <div className={styles.adminStat}>
              <span className={styles.adminStatNum}>{stats.selected}</span>
              <span className={styles.adminStatLabel}>Volunteers Picked</span>
            </div>
            <div className={styles.adminStat}>
              <span className={styles.adminStatNum}>{stats.emails}</span>
              <span className={styles.adminStatLabel}>Emails Sent</span>
            </div>
            <div className={styles.adminStat}>
              <span className={styles.adminStatNum}>{stats.qr}</span>
              <span className={styles.adminStatLabel}>QR Codes</span>
            </div>
          </div>

          <div className={styles.profileGrid}>
            <div className={styles.profileRow}>
              <span className={styles.profileLabel}>Email</span>
              <span className={styles.profileValue}>{admin.email}</span>
            </div>
            <div className={styles.profileRow}>
              <span className={styles.profileLabel}>Phone</span>
              <span className={styles.profileValue}>{admin.phone}</span>
            </div>
            <div className={styles.profileRow}>
              <span className={styles.profileLabel}>Role</span>
              <span className={styles.profileValue}>{admin.role}</span>
            </div>
            <div className={styles.profileRow}>
              <span className={styles.profileLabel}>Department</span>
              <span className={styles.profileValue}>{admin.department}</span>
            </div>
            <div className={styles.profileRow}>
              <span className={styles.profileLabel}>Location</span>
              <span className={styles.profileValue}>{admin.location}</span>
            </div>
            <div className={styles.profileRow}>
              <span className={styles.profileLabel}>Joined</span>
              <span className={styles.profileValue}>{admin.joinedOn}</span>
            </div>
            <div className={styles.profileRow}>
              <span className={styles.profileLabel}>Last Login</span>
              <span className={styles.profileValue}>{admin.lastLogin}</span>
            </div>
          </div>

          <div className={styles.formBlock}>
            <span className={styles.fieldLabel}>Permissions</span>
            <div className={styles.chipGroup}>
              {admin.permissions.map((p) => (
                <span key={p} className={`${styles.chip} ${styles.chipOn}`}>
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.ghostBtn} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   HISTORY CARD (completed events + volunteer details)
   ============================================================ */
function HistoryCard({ event, volunteers, onViewProfile }) {
  const [open, setOpen] = useState(false);
  const selected = event.selected
    .map((id) => volunteers.find((v) => v.id === id))
    .filter(Boolean);
  const totalHours = selected.reduce((s, v) => s + v.hours, 0);

  return (
    <div className={styles.historyCard}>
      <button
        type="button"
        className={styles.historyHeader}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <div className={styles.historyHeaderText}>
          <h4 className={styles.historyTitle}>{event.title}</h4>
          <p className={styles.historyMeta}>
            <Calendar size={12} className={styles.inlineIcon} />
            {fmtDate(event.startAt)} · {event.venue} · {event.zone}
          </p>
        </div>
        <div className={styles.historyStats}>
          <span className={`${styles.pill} ${styles.pillGreen}`}>
            <Users size={11} className={styles.inlineIcon} /> {selected.length} volunteers
          </span>
          <span className={`${styles.pill} ${styles.pillGrey}`}>Completed</span>
          <span className={styles.historyExpand}>
            {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </span>
        </div>
      </button>

      {open && (
        <div className={styles.historyBody}>
          <p className={styles.historyDesc}>{event.description}</p>

          <div className={styles.historyStatsRow}>
            <div className={styles.historyStatBox}>
              <strong>{event.interested.length}</strong>
              <span>Interested</span>
            </div>
            <div className={styles.historyStatBox}>
              <strong>
                {selected.length}/{event.volunteersNeeded}
              </strong>
              <span>Volunteers</span>
            </div>
            <div className={styles.historyStatBox}>
              <strong>{totalHours}</strong>
              <span>Total Hours</span>
            </div>
            <div className={styles.historyStatBox}>
              <strong>{event.emailsSent ? "Yes" : "No"}</strong>
              <span>Emails Sent</span>
            </div>
            <div className={styles.historyStatBox}>
              <strong>{event.reminderSent ? "Yes" : "No"}</strong>
              <span>Reminder Sent</span>
            </div>
          </div>

          <div className={styles.historyVolunteerWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Volunteer</th>
                  <th>Roll No</th>
                  <th>College</th>
                  <th>Zone</th>
                  <th>Batch</th>
                  <th>Events</th>
                  <th>Hours</th>
                  <th>Rating</th>
                  <th>Points</th>
                </tr>
              </thead>
              <tbody>
                {selected.length === 0 ? (
                  <tr>
                    <td colSpan="9" className={styles.emptyRow}>
                      No volunteers participated in this event.
                    </td>
                  </tr>
                ) : (
                  selected.map((v) => (
                    <tr key={v.id}>
                      <td>
                        <button
                          className={styles.linkBtn}
                          onClick={() => onViewProfile(v.id)}
                        >
                          {v.name}
                        </button>
                      </td>
                      <td>{v.rollNo}</td>
                      <td>{v.college}</td>
                      <td>{v.zone}</td>
                      <td>{v.batch}</td>
                      <td className={styles.tdCenter}>{v.eventsAttended}</td>
                      <td className={styles.tdCenter}>{v.hours}</td>
                      <td className={styles.tdCenter}>{v.rating}★</td>
                      <td className={styles.tdCenter}>
                        <strong>{pointsOf(v)}</strong>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   MAIN DASHBOARD
   ============================================================ */
const TABS = [
  { key: "overview", label: "Overview" },
  { key: "events", label: "Events" },
  { key: "history", label: "History" },
  { key: "deleted", label: "Deleted" },
  { key: "leaderboard", label: "Leaderboard" },
  { key: "volunteers", label: "Students" },
  { key: "emails", label: "Email Log" },
];

const AdminDashboard = () => {
  const [events, setEvents] = useState(initialEvents);
  const [deletedEvents, setDeletedEvents] = useState([]);
  const [volunteers] = useState(initialVolunteers);
  const [emailLogs, setEmailLogs] = useState([]);

  const [tab, setTab] = useState("overview");
  const [showForm, setShowForm] = useState(false);
  const [shortlistId, setShortlistId] = useState(null);
  const [detailId, setDetailId] = useState(null);
  const [profileId, setProfileId] = useState(null);
  const [now, setNow] = useState(() => new Date());
  const [showAdminProfile, setShowAdminProfile] = useState(false);

  const [lbFilters, setLbFilters] = useState({
    zone: "All",
    college: "All",
    event: "All",
    batch: "All",
  });
  const [volStatus, setVolStatus] = useState("All");
  const [volSearch, setVolSearch] = useState("");

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const totalRegistrations = events.reduce((sum, e) => sum + e.interested.length, 0);
  const activeCount = volunteers.filter((v) => v.status === "Active").length;
  const inactiveCount = volunteers.filter((v) => v.status === "Inactive").length;

  /* ---- history = all completed events (active + deleted) ---- */
  const historyEvents = useMemo(() => {
    const fromActive = events.filter((e) => e.status === "Completed");
    const fromDeleted = deletedEvents.filter((e) => e.status === "Completed");
    return [...fromActive, ...fromDeleted].sort(
      (a, b) => new Date(b.startAt) - new Date(a.startAt)
    );
  }, [events, deletedEvents]);

  const handleCreateEvent = (form) => {
    const newEvent = {
      id: Date.now(),
      ...form,
      volunteersNeeded: Number(form.volunteersNeeded) || 1,
      status: "Open",
      interested: [],
      selected: [],
      emailsSent: false,
      reminderSent: false,
      qrToken: null,
      qrGeneratedAt: null,
    };
    setEvents((prev) => [newEvent, ...prev]);
    setShowForm(false);
    setTab("events");
  };

  /* ---- Delete → move to recycle bin ---- */
  const handleDeleteEvent = (id) => {
    const ev = events.find((e) => e.id === id);
    if (ev) {
      setDeletedEvents((prev) => [
        { ...ev, deletedAt: new Date().toISOString() },
        ...prev,
      ]);
    }
    setEvents((prev) => prev.filter((e) => e.id !== id));
    if (detailId === id) setDetailId(null);
    if (shortlistId === id) setShortlistId(null);
  };

  /* ---- Restore from recycle bin ---- */
  const handleRestoreEvent = (id) => {
    const ev = deletedEvents.find((e) => e.id === id);
    if (!ev) return;
    const { deletedAt, ...rest } = ev;
    setEvents((prev) => [rest, ...prev]);
    setDeletedEvents((prev) => prev.filter((e) => e.id !== id));
  };

  /* ---- Permanent delete (cannot be undone) ---- */
  const handlePermanentDelete = (id) => {
    if (
      window.confirm(
        "Permanently delete this event? This action cannot be undone and will remove it from History too."
      )
    ) {
      setDeletedEvents((prev) => prev.filter((e) => e.id !== id));
    }
  };

  const handleConfirmShortlist = (id, ids) => {
    setEvents((prev) =>
      prev.map((e) =>
        e.id === id
          ? { ...e, selected: ids, status: ids.length ? "Shortlisted" : "Open" }
          : e
      )
    );
    setShortlistId(null);
  };

  const handleGenerateQr = (id) => {
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id !== id) return e;
        const state = getQrState(e, Date.now());
        if (state.phase !== "active") return e;
        return { ...e, qrToken: makeEventToken(e), qrGeneratedAt: new Date().toISOString() };
      })
    );
  };

  const handleSendEmails = (id) => {
    const ev = events.find((e) => e.id === id);
    if (!ev || ev.selected.length === 0) return;
    const recipients = ev.selected
      .map((vid) => volunteers.find((v) => v.id === vid)?.email)
      .filter(Boolean);
    const sentAt = new Date().toISOString();

    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, emailsSent: true, emailsSentAt: sentAt } : e))
    );
    setEmailLogs((prev) => [
      {
        id: Date.now(),
        type: "Selection",
        eventTitle: ev.title,
        count: recipients.length,
        recipients,
        sentAt,
        subject: `You are selected for ${ev.title}`,
      },
      ...prev,
    ]);
  };

  const handleSendReminder = (id) => {
    const ev = events.find((e) => e.id === id);
    if (!ev || ev.selected.length === 0) return;
    const recipients = ev.selected
      .map((vid) => volunteers.find((v) => v.id === vid)?.email)
      .filter(Boolean);
    const sentAt = new Date().toISOString();

    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, reminderSent: true, reminderSentAt: sentAt } : e))
    );
    setEmailLogs((prev) => [
      {
        id: Date.now(),
        type: "Reminder",
        eventTitle: ev.title,
        count: recipients.length,
        recipients,
        sentAt,
        subject: `Reminder: ${ev.title} is tomorrow`,
      },
      ...prev,
    ]);
  };

  const leaderboard = useMemo(
    () =>
      volunteers
        .filter((v) => lbFilters.zone === "All" || v.zone === lbFilters.zone)
        .filter((v) => lbFilters.college === "All" || v.college === lbFilters.college)
        .filter((v) => lbFilters.batch === "All" || v.batch === lbFilters.batch)
        .filter(
          (v) =>
            lbFilters.event === "All" || v.eventIds.includes(Number(lbFilters.event))
        )
        .sort((a, b) => pointsOf(b) - pointsOf(a)),
    [volunteers, lbFilters]
  );

  const filteredVolunteers = useMemo(() => {
    const term = volSearch.trim().toLowerCase();
    return volunteers
      .filter((v) => volStatus === "All" || v.status === volStatus)
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

  const shortlistEvent = events.find((e) => e.id === shortlistId) || null;
  const detailEvent = events.find((e) => e.id === detailId) || null;
  const profileVolunteer = volunteers.find((v) => v.id === profileId) || null;

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
            <p className={styles.brandSub}>Volunteer Control Panel</p>
          </div>
        </div>
        <button
          className={`${styles.userInfo} ${styles.userInfoBtn}`}
          onClick={() => setShowAdminProfile(true)}
          aria-label="Open admin profile"
        >
          <div className={styles.avatar}>A</div>
          <div className={styles.userText}>
            <span className={styles.userName}>Admin User</span>
            <span className={styles.userRole}>Super Admin</span>
          </div>
        </button>
      </header>

      {/* ===== TABS ===== */}
      <nav className={styles.tabs}>
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`${styles.tab} ${tab === t.key ? styles.tabActive : ""}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
            {t.key === "deleted" && deletedEvents.length > 0 && (
              <span className={styles.tabBadge}>{deletedEvents.length}</span>
            )}
          </button>
        ))}
      </nav>

      <main className={styles.main}>
        {/* ================= OVERVIEW ================= */}
        {tab === "overview" && (
          <>
            <section className={styles.welcome}>
              <div>
                <h2 className={styles.welcomeTitle}>
                  Welcome, <span className={styles.accent}>Admin</span>{" "}
                  <Hand size={24} className={styles.inlineIcon} />
                </h2>
                <p className={styles.welcomeText}>
                  You have <strong>{events.filter((e) => e.status === "Open").length}</strong>{" "}
                  open events and <strong>{activeCount}</strong> active volunteers.
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
                  <span className={styles.welcomeStatLabel}>Interests</span>
                </div>
                <div className={styles.welcomeStatDivider} />
                <div className={styles.welcomeStat}>
                  <span className={styles.welcomeStatNum}>{activeCount}</span>
                  <span className={styles.welcomeStatLabel}>Active</span>
                </div>
              </div>
            </section>

            <section className={styles.statsGrid}>
              <div className={styles.statCard}>
                <span className={styles.statIcon}>
                  <GraduationCap size={24} />
                </span>
                <div>
                  <span className={styles.statNum}>{volunteers.length}</span>
                  <span className={styles.statLabel}>Total Students</span>
                </div>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statIcon}>
                  <UserCheck size={24} />
                </span>
                <div>
                  <span className={styles.statNum}>{activeCount}</span>
                  <span className={styles.statLabel}>Active Volunteers</span>
                </div>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statIcon}>
                  <UserX size={24} />
                </span>
                <div>
                  <span className={styles.statNum}>{inactiveCount}</span>
                  <span className={styles.statLabel}>Inactive Volunteers</span>
                </div>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statIcon}>
                  <FileText size={24} />
                </span>
                <div>
                  <span className={styles.statNum}>{totalRegistrations}</span>
                  <span className={styles.statLabel}>Event Interests</span>
                </div>
              </div>
            </section>

            <section className={styles.quickSection}>
              <h3 className={styles.sectionTitle}>Quick Actions</h3>
              <div className={styles.quickGrid}>
                <button
                  className={styles.quickCard}
                  onClick={() => {
                    setTab("events");
                    setShowForm(true);
                  }}
                >
                  <span className={styles.quickIcon}>
                    <PlusCircle size={26} />
                  </span>
                  <span className={styles.quickLabel}>Post Event</span>
                  <span className={styles.quickDesc}>Create volunteering event</span>
                </button>
                <button className={styles.quickCard} onClick={() => setTab("leaderboard")}>
                  <span className={styles.quickIcon}>
                    <Trophy size={26} />
                  </span>
                  <span className={styles.quickLabel}>Leaderboard</span>
                  <span className={styles.quickDesc}>Rank volunteers</span>
                </button>
                <button className={styles.quickCard} onClick={() => setTab("volunteers")}>
                  <span className={styles.quickIcon}>
                    <Users size={26} />
                  </span>
                  <span className={styles.quickLabel}>Students</span>
                  <span className={styles.quickDesc}>Active / inactive list</span>
                </button>
                <button className={styles.quickCard} onClick={() => setTab("emails")}>
                  <span className={styles.quickIcon}>
                    <Mail size={26} />
                  </span>
                  <span className={styles.quickLabel}>Email Log</span>
                  <span className={styles.quickDesc}>Sent notifications</span>
                </button>
                <button className={styles.quickCard} onClick={() => setTab("history")}>
                  <span className={styles.quickIcon}>
                    <History size={26} />
                  </span>
                  <span className={styles.quickLabel}>History</span>
                  <span className={styles.quickDesc}>Completed events archive</span>
                </button>
                <button className={styles.quickCard} onClick={() => setTab("deleted")}>
                  <span className={styles.quickIcon}>
                    <Trash2 size={26} />
                  </span>
                  <span className={styles.quickLabel}>Deleted</span>
                  <span className={styles.quickDesc}>Recycle bin · {deletedEvents.length} items</span>
                </button>
              </div>
            </section>

            <section className={styles.tableSection}>
              <div className={styles.panelHeader}>
                <h3 className={styles.sectionTitle}>Upcoming Events</h3>
                <button className={styles.viewAllBtn} onClick={() => setTab("events")}>
                  View All <ArrowRight size={14} className={styles.inlineIcon} />
                </button>
              </div>
              <div className={styles.eventsGrid}>
                {events.slice(0, 3).map((ev) => (
                  <EventCard
                    key={ev.id}
                    event={ev}
                    now={now}
                    onOpen={() => setDetailId(ev.id)}
                    onShortlist={() => setShortlistId(ev.id)}
                    onDelete={() => handleDeleteEvent(ev.id)}
                  />
                ))}
              </div>
            </section>

            <section className={styles.bottomGrid}>
              <div className={styles.panel}>
                <div className={styles.panelHeader}>
                  <h3 className={styles.sectionTitle}>Recent Registrations</h3>
                  <button className={styles.viewAllBtn} onClick={() => setTab("volunteers")}>
                    View All <ArrowRight size={14} className={styles.inlineIcon} />
                  </button>
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

              <div className={styles.panel}>
                <div className={styles.panelHeader}>
                  <h3 className={styles.sectionTitle}>QR Status</h3>
                </div>
                <div className={styles.listWrap}>
                  {events.map((ev) => {
                    const q = getQrState(ev, now.getTime());
                    return (
                      <div key={ev.id} className={styles.listItem}>
                        <div className={styles.listInfo}>
                          <span className={styles.listName}>{ev.title}</span>
                          <span className={styles.listSub}>{fmtDateTime(ev.startAt)}</span>
                        </div>
                        <span
                          className={`${styles.pill} ${
                            q.phase === "active"
                              ? styles.pillGreen
                              : q.phase === "locked"
                              ? styles.pillAmber
                              : styles.pillGrey
                          }`}
                        >
                          {q.phase === "active" ? countdown(q.msLeft) : q.phase}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          </>
        )}

        {/* ================= EVENTS ================= */}
        {tab === "events" && (
          <>
            <div className={styles.panelHeader}>
              <h3 className={styles.sectionTitle}>Event Management</h3>
              <button className={styles.createBtn} onClick={() => setShowForm((s) => !s)}>
                {showForm ? (
                  "Close Form"
                ) : (
                  <>
                    <Plus size={14} className={styles.inlineIcon} /> Post Event
                  </>
                )}
              </button>
            </div>

            {showForm && (
              <EventForm onSubmit={handleCreateEvent} onCancel={() => setShowForm(false)} />
            )}

            <div className={styles.eventsGrid}>
              {events.map((ev) => (
                <EventCard
                  key={ev.id}
                  event={ev}
                  now={now}
                  onOpen={() => setDetailId(ev.id)}
                  onShortlist={() => setShortlistId(ev.id)}
                  onDelete={() => handleDeleteEvent(ev.id)}
                />
              ))}
            </div>

            {events.length === 0 && (
              <p className={styles.emptyText}>No events yet. Click "Post Event" to create one.</p>
            )}
          </>
        )}

        {/* ================= HISTORY ================= */}
        {tab === "history" && (
          <section className={styles.tableSection}>
            <div className={styles.panelHeader}>
              <h3 className={styles.sectionTitle}>
                <History size={20} className={styles.inlineIcon} /> Event History
              </h3>
              <span className={`${styles.pill} ${styles.pillGreen}`}>
                {historyEvents.length} completed
              </span>
            </div>

            {historyEvents.length === 0 ? (
              <p className={styles.emptyText}>
                No completed events yet. Completed events will appear here with full volunteer details.
              </p>
            ) : (
              <div className={styles.historyList}>
                {historyEvents.map((ev) => (
                  <HistoryCard
                    key={`${ev.id}-${ev.deletedAt || "active"}`}
                    event={ev}
                    volunteers={volunteers}
                    onViewProfile={(id) => setProfileId(id)}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* ================= DELETED ================= */}
        {tab === "deleted" && (
          <section className={styles.tableSection}>
            <div className={styles.panelHeader}>
              <h3 className={styles.sectionTitle}>
                <Trash2 size={20} className={styles.inlineIcon} /> Deleted Events
              </h3>
              <span className={`${styles.pill} ${styles.pillGrey}`}>
                {deletedEvents.length} in recycle bin
              </span>
            </div>

            {deletedEvents.length === 0 ? (
              <p className={styles.emptyText}>
                No deleted events. When you delete an event it moves here and can be restored.
              </p>
            ) : (
              <div className={styles.deletedList}>
                {deletedEvents.map((ev) => (
                  <div key={ev.id} className={styles.deletedCard}>
                    <div className={styles.deletedInfo}>
                      <div className={styles.eventCardHead}>
                        <h4 className={styles.historyTitle}>{ev.title}</h4>
                        <span
                          className={`${styles.pill} ${
                            ev.status === "Completed" ? styles.pillGrey : styles.pillBlue
                          }`}
                        >
                          {ev.status}
                        </span>
                      </div>
                      <p className={styles.historyMeta}>
                        <Calendar size={12} className={styles.inlineIcon} />
                        {fmtDate(ev.startAt)} · {ev.venue} · {ev.zone}
                      </p>
                      <p className={styles.deletedMeta}>
                        <Trash2 size={12} className={styles.inlineIcon} />
                        Deleted {fmtDateTime(ev.deletedAt)} · {ev.selected.length} volunteers selected ·{" "}
                        {ev.interested.length} interests
                      </p>
                    </div>
                    <div className={styles.deletedActions}>
                      <button
                        className={styles.ghostBtn}
                        onClick={() => handleRestoreEvent(ev.id)}
                      >
                        <RotateCcw size={14} className={styles.inlineIcon} /> Restore
                      </button>
                      <button
                        className={styles.deleteBtn}
                        onClick={() => handlePermanentDelete(ev.id)}
                      >
                        <Trash2 size={14} className={styles.inlineIcon} /> Delete Forever
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ================= LEADERBOARD (GAMIFIED) ================= */}
        {tab === "leaderboard" && (
          <section className={styles.tableSection}>
            <div className={styles.panelHeader}>
              <h3 className={styles.sectionTitle}>
                <Trophy size={20} className={styles.inlineIcon} /> Volunteer Leaderboard
              </h3>
            </div>

            <div className={styles.filterBar}>
              <label className={styles.filterGroup}>
                <span className={styles.filterLabel}>Zone</span>
                <select
                  className={styles.select}
                  value={lbFilters.zone}
                  onChange={(e) => setLbFilters((f) => ({ ...f, zone: e.target.value }))}
                >
                  <option value="All">All Zones</option>
                  {ZONES.map((z) => (<option key={z} value={z}>{z}</option>))}
                </select>
              </label>

              <label className={styles.filterGroup}>
                <span className={styles.filterLabel}>College</span>
                <select
                  className={styles.select}
                  value={lbFilters.college}
                  onChange={(e) => setLbFilters((f) => ({ ...f, college: e.target.value }))}
                >
                  <option value="All">All Colleges</option>
                  {COLLEGES.map((c) => (<option key={c} value={c}>{c}</option>))}
                </select>
              </label>

              <label className={styles.filterGroup}>
                <span className={styles.filterLabel}>Event</span>
                <select
                  className={styles.select}
                  value={lbFilters.event}
                  onChange={(e) => setLbFilters((f) => ({ ...f, event: e.target.value }))}
                >
                  <option value="All">All Events</option>
                  {events.map((ev) => (<option key={ev.id} value={ev.id}>{ev.title}</option>))}
                </select>
              </label>

              <label className={styles.filterGroup}>
                <span className={styles.filterLabel}>Batch</span>
                <select
                  className={styles.select}
                  value={lbFilters.batch}
                  onChange={(e) => setLbFilters((f) => ({ ...f, batch: e.target.value }))}
                >
                  <option value="All">All Batches</option>
                  {BATCHES.map((b) => (<option key={b} value={b}>{b}</option>))}
                </select>
              </label>
            </div>

            <div className={styles.tableWrap}>
              <table className={`${styles.table} ${styles.leaderboardTable}`}>
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Volunteer</th>
                    <th>Level</th>
                    <th>Badges</th>
                    <th>Stats</th>
                    <th>Points</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((v, idx) => {
                    const level = getLevel(v);
                    const badges = getBadges(v);
                    const lastSeen = getLastSeen(v.lastActiveDays);
                    return (
                      <tr key={v.id}>
                        <td>
                          <span
                            className={`${styles.rankBadge} ${
                              idx === 0 ? styles.rank1 : idx === 1 ? styles.rank2 : idx === 2 ? styles.rank3 : ""
                            }`}
                          >
                            {idx + 1}
                          </span>
                        </td>
                        <td>
                          <div className={styles.volunteerCell}>
                            <div className={styles.volunteerAvatar}>{v.name.charAt(0)}</div>
                            <div className={styles.volunteerInfo}>
                              <button className={styles.linkBtn} onClick={() => setProfileId(v.id)}>
                                {v.name}
                              </button>
                              <span className={styles.volunteerMeta}>
                                <span className={`${styles.statusDot} ${styles[`statusDot_${lastSeen.tone}`]}`} />
                                {lastSeen.label} · {v.zone}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`${styles.levelBadge} ${styles[`level_${level.num}`]}`}>
                            <span className={styles.levelNum}>Lv {level.num}</span>
                            <span className={styles.levelName}>{level.name}</span>
                          </span>
                        </td>
                        <td>
                          <div className={styles.achWrap}>
                            {badges.slice(0, 2).map((b) => (
                              <span key={b.id} className={`${styles.achBadge} ${styles[`ach_${b.tone}`]}`}>
                                <span className={styles.achIcon}>{b.icon}</span>
                                {b.label}
                              </span>
                            ))}
                            {badges.length > 2 && (
                              <span className={styles.achMore}>+{badges.length - 2}</span>
                            )}
                            {badges.length === 0 && <span className={styles.achEmpty}>—</span>}
                          </div>
                        </td>
                        <td>
                          <div className={styles.statsCell}>
                            <span className={styles.statPill}><strong>{v.eventsAttended}</strong> ev</span>
                            <span className={styles.statPill}><strong>{v.hours}</strong> hr</span>
                            <span className={styles.statPill}><strong>{v.rating}</strong>★</span>
                          </div>
                        </td>
                        <td className={styles.tdCenter}>
                          <span className={styles.pointsPill}>{pointsOf(v)}</span>
                        </td>
                      </tr>
                    );
                  })}
                  {leaderboard.length === 0 && (
                    <tr>
                      <td colSpan="6" className={styles.emptyRow}>
                        No volunteers match the selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ================= STUDENTS ================= */}
        {tab === "volunteers" && (
          <section className={styles.tableSection}>
            <div className={styles.panelHeader}>
              <h3 className={styles.sectionTitle}>Student Directory</h3>
              <span className={`${styles.pill} ${styles.pillGreen}`}>
                Active {activeCount}
              </span>
              <span className={`${styles.pill} ${styles.pillGrey}`}>
                Inactive {inactiveCount}
              </span>
            </div>

            <div className={styles.filterBar}>
              <label className={styles.filterGroup}>
                <span className={styles.filterLabel}>Status</span>
                <select
                  className={styles.select}
                  value={volStatus}
                  onChange={(e) => setVolStatus(e.target.value)}
                >
                  <option value="All">All Students</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </label>

              <label className={styles.filterGroup} style={{ flex: 1 }}>
                <span className={styles.filterLabel}>Search</span>
                <input
                  className={styles.input}
                  placeholder="Name, roll no, college, zone, batch..."
                  value={volSearch}
                  onChange={(e) => setVolSearch(e.target.value)}
                />
              </label>
            </div>

            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Roll No</th>
                    <th>Name</th>
                    <th>College</th>
                    <th>Zone</th>
                    <th>Batch</th>
                    <th>Dept</th>
                    <th>Status</th>
                    <th>Events</th>
                    <th>Hours</th>
                    <th>Points</th>
                    <th>Last Active</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVolunteers.map((v) => (
                    <tr key={v.id}>
                      <td>{v.rollNo}</td>
                      <td>
                        <button className={styles.linkBtn} onClick={() => setProfileId(v.id)}>
                          {v.name}
                        </button>
                      </td>
                      <td>{v.college}</td>
                      <td>{v.zone}</td>
                      <td>{v.batch}</td>
                      <td>{v.department}</td>
                      <td>
                        <span
                          className={`${styles.pill} ${
                            v.status === "Active" ? styles.pillGreen : styles.pillGrey
                          }`}
                        >
                          {v.status}
                        </span>
                      </td>
                      <td className={styles.tdCenter}>{v.eventsAttended}</td>
                      <td className={styles.tdCenter}>{v.hours}</td>
                      <td className={styles.tdCenter}>{pointsOf(v)}</td>
                      <td>{v.lastActiveDays === 0 ? "Today" : `${v.lastActiveDays}d ago`}</td>
                    </tr>
                  ))}
                  {filteredVolunteers.length === 0 && (
                    <tr>
                      <td colSpan="11" className={styles.emptyRow}>
                        No students match the filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ================= EMAIL LOG ================= */}
        {tab === "emails" && (
          <section className={styles.tableSection}>
            <h3 className={styles.sectionTitle}>Email Log</h3>
            {emailLogs.length === 0 ? (
              <p className={styles.emptyText}>No emails sent yet.</p>
            ) : (
              emailLogs.map((log) => (
                <div key={log.id} className={styles.emailLogItem}>
                  <div className={styles.eventCardHead}>
                    <strong>
                      {log.type} · {log.eventTitle}
                    </strong>
                    <span className={`${styles.pill} ${styles.pillGreen}`}>
                      {log.count} sent
                    </span>
                  </div>
                  <p className={styles.emailStatus}>
                    {fmtDateTime(log.sentAt)} · {log.subject}
                  </p>
                  <p className={styles.emailStatus}>To: {log.recipients.join(", ")}</p>
                </div>
              ))
            )}
          </section>
        )}
      </main>

      {/* ================= MODALS ================= */}
      {shortlistEvent && (
        <ShortlistModal
          event={shortlistEvent}
          volunteers={volunteers}
          events={events}
          onClose={() => setShortlistId(null)}
          onConfirm={(ids) => handleConfirmShortlist(shortlistEvent.id, ids)}
        />
      )}

      {detailEvent && (
        <EventDetailModal
          event={detailEvent}
          volunteers={volunteers}
          now={now}
          onClose={() => setDetailId(null)}
          onGenerateQr={handleGenerateQr}
          onSendEmails={handleSendEmails}
          onSendReminder={handleSendReminder}
          onEditShortlist={() => setShortlistId(detailEvent.id)}
        />
      )}

      {profileVolunteer && (
        <ProfileModal
          volunteer={profileVolunteer}
          events={events}
          onClose={() => setProfileId(null)}
        />
      )}

      {showAdminProfile && (
        <AdminProfileModal
          admin={ADMIN_PROFILE}
          stats={{
            events: events.length,
            selected: events.reduce((s, e) => s + e.selected.length, 0),
            emails: emailLogs.length,
            qr: events.filter((e) => e.qrToken).length,
          }}
          onClose={() => setShowAdminProfile(false)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;