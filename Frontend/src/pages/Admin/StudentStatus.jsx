import React, { useMemo, useState } from "react";
import {
  ArrowLeft,
  Search,
  Users,
  UserCheck,
  UserX,
  Clock,
  CalendarCheck,
  Trophy,
  Star,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  X,
  Activity,
  Award,
  ChevronRight,
} from "lucide-react";

import { useLocation, useNavigate } from "react-router-dom";
import styles from "./StudentStatus.module.css";

/* ============================================================
   FALLBACK DATA
   Used if the page is refreshed directly.
   ============================================================ */

const FALLBACK_VOLUNTEERS = [
  {
    id: 1,
    name: "Santhosh Kumar",
    email: "santhosh.kumar@maatram.edu",
    phone: "+91 98765 43210",
    rollNo: "MA2022001",
    college: "Maatram Institute of Technology",
    zone: "Zone 1",
    batch: "2022-2026",
    department: "CSE",
    status: "Active",
    eventsAttended: 14,
    hours: 52,
    rating: 4.8,
    skills: ["Event Management", "Logistics"],
    eventIds: [1, 2],
    lastActiveDays: 0,
    joinedOn: "2022-07-15",
  },

  {
    id: 2,
    name: "Priya Ramesh",
    email: "priya.ramesh@maatram.edu",
    phone: "+91 98765 43211",
    rollNo: "GR2021002",
    college: "Green Valley College",
    zone: "Zone 2",
    batch: "2021-2025",
    department: "ECE",
    status: "Active",
    eventsAttended: 11,
    hours: 41,
    rating: 4.6,
    skills: ["Registration Desk", "Public Speaking"],
    eventIds: [1, 3],
    lastActiveDays: 1,
    joinedOn: "2021-07-15",
  },

  {
    id: 3,
    name: "Karthik Vel",
    email: "karthik.vel@maatram.edu",
    phone: "+91 98765 43212",
    rollNo: "SX2023003",
    college: "St. Xavier's College",
    zone: "Zone 3",
    batch: "2023-2027",
    department: "MECH",
    status: "Active",
    eventsAttended: 9,
    hours: 33,
    rating: 4.4,
    skills: ["Logistics", "Crowd Control"],
    eventIds: [1],
    lastActiveDays: 2,
    joinedOn: "2023-07-15",
  },

  {
    id: 4,
    name: "Meena Suresh",
    email: "meena.suresh@maatram.edu",
    phone: "+91 98765 43213",
    rollNo: "SU2022004",
    college: "Sunrise Engineering College",
    zone: "Zone 4",
    batch: "2022-2026",
    department: "IT",
    status: "Active",
    eventsAttended: 12,
    hours: 47,
    rating: 4.7,
    skills: ["Photography", "Design"],
    eventIds: [2, 3],
    lastActiveDays: 0,
    joinedOn: "2022-07-15",
  },

  {
    id: 5,
    name: "Arjun Kumar",
    email: "arjun.kumar@maatram.edu",
    phone: "+91 98765 43214",
    rollNo: "MA2024005",
    college: "Maatram Institute of Technology",
    zone: "Zone 1",
    batch: "2024-2028",
    department: "CSE",
    status: "Active",
    eventsAttended: 6,
    hours: 22,
    rating: 4.2,
    skills: ["Technical Support", "Event Management"],
    eventIds: [1],
    lastActiveDays: 3,
    joinedOn: "2024-07-15",
  },

  {
    id: 6,
    name: "Divya Nair",
    email: "divya.nair@maatram.edu",
    phone: "+91 98765 43215",
    rollNo: "GR2022006",
    college: "Green Valley College",
    zone: "Zone 2",
    batch: "2022-2026",
    department: "BBA",
    status: "Active",
    eventsAttended: 15,
    hours: 58,
    rating: 4.9,
    skills: [
      "Event Management",
      "Public Speaking",
      "Registration Desk",
    ],
    eventIds: [1, 2, 3],
    lastActiveDays: 0,
    joinedOn: "2022-07-15",
  },

  {
    id: 7,
    name: "Rahul Menon",
    email: "rahul.menon@maatram.edu",
    phone: "+91 98765 43216",
    rollNo: "SX2021007",
    college: "St. Xavier's College",
    zone: "Zone 3",
    batch: "2021-2025",
    department: "CSE",
    status: "Inactive",
    eventsAttended: 8,
    hours: 30,
    rating: 4.1,
    skills: ["Technical Support"],
    eventIds: [2],
    lastActiveDays: 96,
    joinedOn: "2021-07-15",
  },

  {
    id: 8,
    name: "Ananya Iyer",
    email: "ananya.iyer@maatram.edu",
    phone: "+91 98765 43217",
    rollNo: "SU2023008",
    college: "Sunrise Engineering College",
    zone: "Zone 5",
    batch: "2023-2027",
    department: "ECE",
    status: "Active",
    eventsAttended: 10,
    hours: 38,
    rating: 4.5,
    skills: ["First Aid", "Crowd Control"],
    eventIds: [1, 2],
    lastActiveDays: 1,
    joinedOn: "2023-07-15",
  },

  {
    id: 9,
    name: "Vignesh Raj",
    email: "vignesh.raj@maatram.edu",
    phone: "+91 98765 43218",
    rollNo: "MA2022009",
    college: "Maatram Institute of Technology",
    zone: "Zone 1",
    batch: "2022-2026",
    department: "MECH",
    status: "Active",
    eventsAttended: 13,
    hours: 50,
    rating: 4.6,
    skills: ["Logistics", "Crowd Control"],
    eventIds: [2, 3],
    lastActiveDays: 2,
    joinedOn: "2022-07-15",
  },

  {
    id: 10,
    name: "Sneha Pillai",
    email: "sneha.pillai@maatram.edu",
    phone: "+91 98765 43219",
    rollNo: "GR2024010",
    college: "Green Valley College",
    zone: "Zone 2",
    batch: "2024-2028",
    department: "IT",
    status: "Active",
    eventsAttended: 5,
    hours: 19,
    rating: 4.0,
    skills: ["Design", "Photography"],
    eventIds: [3],
    lastActiveDays: 4,
    joinedOn: "2024-07-15",
  },

  {
    id: 11,
    name: "Ashwin Das",
    email: "ashwin.das@maatram.edu",
    phone: "+91 98765 43220",
    rollNo: "SX2023011",
    college: "St. Xavier's College",
    zone: "Zone 3",
    batch: "2023-2027",
    department: "BBA",
    status: "Inactive",
    eventsAttended: 7,
    hours: 26,
    rating: 3.9,
    skills: ["Registration Desk"],
    eventIds: [1],
    lastActiveDays: 120,
    joinedOn: "2023-07-15",
  },

  {
    id: 12,
    name: "Nandini Rao",
    email: "nandini.rao@maatram.edu",
    phone: "+91 98765 43221",
    rollNo: "SU2022012",
    college: "Sunrise Engineering College",
    zone: "Zone 4",
    batch: "2022-2026",
    department: "CSE",
    status: "Active",
    eventsAttended: 16,
    hours: 61,
    rating: 4.9,
    skills: [
      "Event Management",
      "Teaching",
      "Public Speaking",
    ],
    eventIds: [1, 2, 3],
    lastActiveDays: 0,
    joinedOn: "2022-07-15",
  },

  {
    id: 13,
    name: "Hari Prasad",
    email: "hari.prasad@maatram.edu",
    phone: "+91 98765 43222",
    rollNo: "MA2021013",
    college: "Maatram Institute of Technology",
    zone: "Zone 5",
    batch: "2021-2025",
    department: "EEE",
    status: "Active",
    eventsAttended: 9,
    hours: 35,
    rating: 4.3,
    skills: ["Technical Support", "Logistics"],
    eventIds: [2],
    lastActiveDays: 3,
    joinedOn: "2021-07-15",
  },

  {
    id: 14,
    name: "Lakshmi Devi",
    email: "lakshmi.devi@maatram.edu",
    phone: "+91 98765 43223",
    rollNo: "GR2023014",
    college: "Green Valley College",
    zone: "Zone 2",
    batch: "2023-2027",
    department: "ECE",
    status: "Active",
    eventsAttended: 11,
    hours: 44,
    rating: 4.7,
    skills: ["First Aid", "Registration Desk"],
    eventIds: [1, 3],
    lastActiveDays: 1,
    joinedOn: "2023-07-15",
  },

  {
    id: 15,
    name: "Ravi Shankar",
    email: "ravi.shankar@maatram.edu",
    phone: "+91 98765 43224",
    rollNo: "MA2021015",
    college: "Maatram Institute of Technology",
    zone: "Zone 1",
    batch: "2021-2025",
    department: "CSE",
    status: "Inactive",
    eventsAttended: 12,
    hours: 45,
    rating: 4.4,
    skills: ["Technical Support", "Event Management"],
    eventIds: [1, 2],
    lastActiveDays: 210,
    joinedOn: "2021-07-15",
  },
];

/* ============================================================
   HELPERS
   ============================================================ */

const pointsOf = (student) =>
  student.eventsAttended * 10 +
  student.hours * 2 +
  Math.round(student.rating * 20);

const getActivityText = (days) => {
  if (days === 0) return "Active today";
  if (days === 1) return "Active yesterday";
  if (days <= 7) return `Active ${days} days ago`;
  return `Inactive for ${days} days`;
};

const getInitials = (name) => {
  return name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
};

/* ============================================================
   STUDENT PROFILE MODAL
   ============================================================ */

function StudentProfile({
  student,
  events,
  onClose,
}) {
  if (!student) return null;

  const attendedEvents = (student.eventIds || [])
    .map((id) =>
      events?.find((event) => event.id === id)
    )
    .filter(Boolean);

  return (
    <div
      className={styles.modalOverlay}
      onClick={onClose}
    >
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.profileIdentity}>
            <div className={styles.largeAvatar}>
              {getInitials(student.name)}
            </div>

            <div>
              <h2>{student.name}</h2>

              <p>
                {student.rollNo} ·{" "}
                {student.department}
              </p>

              <span
                className={
                  student.status === "Active"
                    ? styles.activeBadge
                    : styles.inactiveBadge
                }
              >
                <span className={styles.statusDot}></span>
                {student.status}
              </span>
            </div>
          </div>

          <button
            className={styles.closeButton}
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className={styles.modalBody}>
          {/* Quick Stats */}
          <div className={styles.profileStats}>
            <div className={styles.profileStat}>
              <CalendarCheck size={18} />
              <strong>
                {student.eventsAttended}
              </strong>
              <span>Events</span>
            </div>

            <div className={styles.profileStat}>
              <Clock size={18} />
              <strong>{student.hours}h</strong>
              <span>Hours</span>
            </div>

            <div className={styles.profileStat}>
              <Trophy size={18} />
              <strong>
                {pointsOf(student)}
              </strong>
              <span>Points</span>
            </div>

            <div className={styles.profileStat}>
              <Star size={18} />
              <strong>{student.rating}</strong>
              <span>Rating</span>
            </div>
          </div>

          {/* Personal Information */}
          <section className={styles.detailSection}>
            <div className={styles.sectionTitle}>
              <UserCheck size={17} />
              Personal Information
            </div>

            <div className={styles.detailGrid}>
              <div className={styles.detailItem}>
                <Mail size={15} />
                <div>
                  <small>Email</small>
                  <strong>{student.email}</strong>
                </div>
              </div>

              <div className={styles.detailItem}>
                <Phone size={15} />
                <div>
                  <small>Phone</small>
                  <strong>{student.phone}</strong>
                </div>
              </div>

              <div className={styles.detailItem}>
                <GraduationCap size={15} />
                <div>
                  <small>College</small>
                  <strong>{student.college}</strong>
                </div>
              </div>

              <div className={styles.detailItem}>
                <MapPin size={15} />
                <div>
                  <small>Zone</small>
                  <strong>{student.zone}</strong>
                </div>
              </div>

              <div className={styles.detailItem}>
                <Activity size={15} />
                <div>
                  <small>Batch</small>
                  <strong>{student.batch}</strong>
                </div>
              </div>

              <div className={styles.detailItem}>
                <Award size={15} />
                <div>
                  <small>Joined</small>
                  <strong>{student.joinedOn}</strong>
                </div>
              </div>
            </div>
          </section>

          {/* Skills */}
          <section className={styles.detailSection}>
            <div className={styles.sectionTitle}>
              <Award size={17} />
              Volunteer Skills
            </div>

            <div className={styles.skillList}>
              {student.skills.map((skill) => (
                <span
                  key={skill}
                  className={styles.skillChip}
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>

          {/* Activity */}
          <section className={styles.detailSection}>
            <div className={styles.sectionTitle}>
              <Activity size={17} />
              Activity Status
            </div>

            <div className={styles.activityBox}>
              <div
                className={
                  student.status === "Active"
                    ? styles.activityIconActive
                    : styles.activityIconInactive
                }
              >
                <Activity size={19} />
              </div>

              <div>
                <strong>
                  {getActivityText(
                    student.lastActiveDays
                  )}
                </strong>

                <p>
                  Last volunteering activity
                  recorded{" "}
                  {student.lastActiveDays === 0
                    ? "today."
                    : `${student.lastActiveDays} days ago.`}
                </p>
              </div>
            </div>
          </section>

          {/* Events */}
          <section className={styles.detailSection}>
            <div className={styles.sectionTitle}>
              <CalendarCheck size={17} />
              Events Participated
            </div>

            {attendedEvents.length === 0 ? (
              <div className={styles.emptyEvents}>
                No events participated yet.
              </div>
            ) : (
              <div className={styles.eventList}>
                {attendedEvents.map((event) => (
                  <div
                    key={event.id}
                    className={styles.eventRow}
                  >
                    <div className={styles.eventIcon}>
                      <CalendarCheck size={16} />
                    </div>

                    <div>
                      <strong>{event.title}</strong>
                      <span>
                        {event.zone} · Volunteer
                      </span>
                    </div>

                    <ChevronRight size={16} />
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Footer */}
        <div className={styles.modalFooter}>
          <button
            className={styles.closeFooterButton}
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
   MAIN PAGE
   ============================================================ */

const StudentStatus = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const passedVolunteers =
    location.state?.volunteers;

  const passedEvents = location.state?.events;

  const volunteers =
    passedVolunteers?.length
      ? passedVolunteers
      : FALLBACK_VOLUNTEERS;

  const events =
    passedEvents?.length
      ? passedEvents
      : [];

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [search, setSearch] = useState("");

  const [selectedStudent, setSelectedStudent] =
    useState(null);

  /* ----------------------------------------------------------
     COUNTS
     ---------------------------------------------------------- */

  const activeCount = volunteers.filter(
    (student) =>
      student.status === "Active"
  ).length;

  const inactiveCount = volunteers.filter(
    (student) =>
      student.status === "Inactive"
  ).length;

  /* ----------------------------------------------------------
     FILTER
     ---------------------------------------------------------- */

  const filteredStudents = useMemo(() => {
    const term = search
      .trim()
      .toLowerCase();

    return volunteers
      .filter((student) => {
        if (statusFilter === "All") {
          return true;
        }

        return (
          student.status === statusFilter
        );
      })
      .filter((student) => {
        if (!term) return true;

        return (
          student.name
            .toLowerCase()
            .includes(term) ||
          student.rollNo
            .toLowerCase()
            .includes(term) ||
          student.college
            .toLowerCase()
            .includes(term) ||
          student.department
            .toLowerCase()
            .includes(term) ||
          student.zone
            .toLowerCase()
            .includes(term) ||
          student.batch
            .toLowerCase()
            .includes(term)
        );
      });
  }, [
    volunteers,
    statusFilter,
    search,
  ]);

  /* ----------------------------------------------------------
     TOTAL HOURS
     ---------------------------------------------------------- */

  const totalHours = volunteers.reduce(
    (total, student) =>
      total + Number(student.hours || 0),
    0
  );

  const totalPoints = volunteers.reduce(
    (total, student) =>
      total + pointsOf(student),
    0
  );

  return (
    <div className={styles.page}>
      {/* ======================================================
          HEADER
      ====================================================== */}

      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button
            className={styles.backButton}
            onClick={() =>
              navigate("/admindashboard")
            }
          >
            <ArrowLeft size={17} />
          </button>

          <div>
            <h1>Student Status</h1>
            <p>
              Monitor volunteer activity and
              engagement
            </p>
          </div>
        </div>

        <div className={styles.headerBadge}>
          <Users size={16} />
          {volunteers.length} Students
        </div>
      </header>

      <main className={styles.main}>
        {/* ====================================================
            HERO
        ==================================================== */}

        <section className={styles.hero}>
          <div>
            <span className={styles.heroTag}>
              VOLUNTEER MANAGEMENT
            </span>

            <h2>
              Student Activity
              <span> Overview</span>
            </h2>

            <p>
              Track active and inactive
              volunteers, understand their
              contribution and quickly view
              individual student profiles.
            </p>
          </div>

          <div className={styles.heroDecoration}>
            <div className={styles.orbit}>
              <Users size={30} />
            </div>
          </div>
        </section>

        {/* ====================================================
            SUMMARY CARDS
        ==================================================== */}

        <section className={styles.statsGrid}>
          <div
            className={`${styles.statCard} ${styles.totalCard}`}
          >
            <div className={styles.statIcon}>
              <Users size={22} />
            </div>

            <div>
              <span>Total Students</span>
              <strong>{volunteers.length}</strong>
            </div>

            <div className={styles.statArrow}>
              →
            </div>
          </div>

          <button
            className={`${styles.statCard} ${styles.activeCard}`}
            onClick={() =>
              setStatusFilter("Active")
            }
          >
            <div className={styles.statIcon}>
              <UserCheck size={22} />
            </div>

            <div>
              <span>Active Volunteers</span>
              <strong>{activeCount}</strong>
            </div>

            <div className={styles.statArrow}>
              →
            </div>
          </button>

          <button
            className={`${styles.statCard} ${styles.inactiveCard}`}
            onClick={() =>
              setStatusFilter("Inactive")
            }
          >
            <div className={styles.statIcon}>
              <UserX size={22} />
            </div>

            <div>
              <span>Inactive Volunteers</span>
              <strong>{inactiveCount}</strong>
            </div>

            <div className={styles.statArrow}>
              →
            </div>
          </button>

          <div
            className={`${styles.statCard} ${styles.hoursCard}`}
          >
            <div className={styles.statIcon}>
              <Clock size={22} />
            </div>

            <div>
              <span>Total Hours</span>
              <strong>{totalHours}h</strong>
            </div>
          </div>

          <div
            className={`${styles.statCard} ${styles.pointsCard}`}
          >
            <div className={styles.statIcon}>
              <Trophy size={22} />
            </div>

            <div>
              <span>Community Points</span>
              <strong>{totalPoints}</strong>
            </div>
          </div>
        </section>

        {/* ====================================================
            DIRECTORY
        ==================================================== */}

        <section className={styles.directory}>
          <div className={styles.directoryHeader}>
            <div>
              <h3>
                Volunteer Directory
              </h3>

              <p>
                Click a student to view their
                complete volunteering profile.
              </p>
            </div>

            <div className={styles.resultCount}>
              {filteredStudents.length} shown
            </div>
          </div>

          {/* FILTERS */}

          <div className={styles.filterArea}>
            <div className={styles.searchBox}>
              <Search size={17} />

              <input
                type="text"
                placeholder="Search name, roll no, college, department..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />

              {search && (
                <button
                  onClick={() => setSearch("")}
                >
                  <X size={15} />
                </button>
              )}
            </div>

            <div className={styles.filterButtons}>
              <button
                className={
                  statusFilter === "All"
                    ? styles.filterActive
                    : styles.filterButton
                }
                onClick={() =>
                  setStatusFilter("All")
                }
              >
                All
                <span>{volunteers.length}</span>
              </button>

              <button
                className={
                  statusFilter === "Active"
                    ? styles.filterActive
                    : styles.filterButton
                }
                onClick={() =>
                  setStatusFilter("Active")
                }
              >
                <UserCheck size={14} />
                Active
                <span>{activeCount}</span>
              </button>

              <button
                className={
                  statusFilter === "Inactive"
                    ? styles.filterInactive
                    : styles.filterButton
                }
                onClick={() =>
                  setStatusFilter("Inactive")
                }
              >
                <UserX size={14} />
                Inactive
                <span>{inactiveCount}</span>
              </button>
            </div>
          </div>

          {/* TABLE */}

          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Roll No</th>
                  <th>College</th>
                  <th>Zone</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Events</th>
                  <th>Hours</th>
                  <th>Points</th>
                  <th>Activity</th>
                </tr>
              </thead>

              <tbody>
                {filteredStudents.map(
                  (student, index) => (
                    <tr
                      key={student.id}
                      style={{
                        "--delay": `${index * 0.04}s`,
                      }}
                      onClick={() =>
                        setSelectedStudent(
                          student
                        )
                      }
                    >
                      <td>
                        <div
                          className={
                            styles.studentCell
                          }
                        >
                          <div
                            className={
                              styles.avatar
                            }
                          >
                            {getInitials(
                              student.name
                            )}
                          </div>

                          <div>
                            <strong>
                              {student.name}
                            </strong>

                            <span>
                              {student.batch}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span
                          className={
                            styles.rollNumber
                          }
                        >
                          {student.rollNo}
                        </span>
                      </td>

                      <td>
                        {student.college}
                      </td>

                      <td>
                        <span
                          className={
                            styles.zoneBadge
                          }
                        >
                          {student.zone}
                        </span>
                      </td>

                      <td>
                        <span
                          className={
                            styles.department
                          }
                        >
                          {student.department}
                        </span>
                      </td>

                      <td>
                        <span
                          className={
                            student.status ===
                            "Active"
                              ? styles.statusActive
                              : styles.statusInactive
                          }
                        >
                          <span
                            className={
                              styles.statusDot
                            }
                          ></span>

                          {student.status}
                        </span>
                      </td>

                      <td>
                        <strong>
                          {student.eventsAttended}
                        </strong>
                      </td>

                      <td>
                        <strong>
                          {student.hours}h
                        </strong>
                      </td>

                      <td>
                        <span
                          className={
                            styles.points
                          }
                        >
                          <Trophy size={13} />
                          {pointsOf(student)}
                        </span>
                      </td>

                      <td>
                        <span
                          className={
                            student.lastActiveDays <=
                            7
                              ? styles.activityGood
                              : styles.activityBad
                          }
                        >
                          {getActivityText(
                            student.lastActiveDays
                          )}
                        </span>
                      </td>
                    </tr>
                  )
                )}

                {filteredStudents.length ===
                  0 && (
                  <tr>
                    <td
                      colSpan="10"
                      className={
                        styles.emptyRow
                      }
                    >
                      <Users size={30} />

                      <strong>
                        No students found
                      </strong>

                      <span>
                        Try changing the search
                        or status filter.
                      </span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* ======================================================
          STUDENT PROFILE
      ====================================================== */}

      {selectedStudent && (
        <StudentProfile
          student={selectedStudent}
          events={events}
          onClose={() =>
            setSelectedStudent(null)
          }
        />
      )}
    </div>
  );
};

export default StudentStatus;