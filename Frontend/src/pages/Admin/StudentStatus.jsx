
import React, { useEffect, useMemo, useState } from "react";
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

import { useNavigate } from "react-router-dom";
import styles from "./StudentStatus.module.css";
import { getAdminStudentStatus } from "../../services/eventService";

/* ============================================================
   HELPERS
   ============================================================ */

const pointsOf = (student) => Number(student.points || 0);

const getActivityText = (days) => {
  if (days === null || days === undefined) {
    return "No activity date";
  }

  if (days === 0) return "Active today";
  if (days === 1) return "Active yesterday";
  if (days <= 7) return `Active ${days} days ago`;

  return `Inactive for ${days} days`;
};

const getInitials = (name = "") => {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
};

const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

/* ============================================================
   STUDENT PROFILE MODAL
   ============================================================ */

function StudentProfile({ student, onClose }) {
  if (!student) return null;

  const events = student.eventsBreakdown || [];
  const skills = student.skills || [];

  return (
    <div
      className={styles.modalOverlay}
      onClick={onClose}
    >
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <div className={styles.profileIdentity}>
            <div className={styles.largeAvatar}>
              {getInitials(student.name)}
            </div>

            <div>
              <h2>{student.name}</h2>

              <p>
                {student.rollNo} · {student.department || "-"}
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

        <div className={styles.modalBody}>
          {/* QUICK STATS */}
          <div className={styles.profileStats}>
            <div className={styles.profileStat}>
              <CalendarCheck size={18} />
              <strong>{student.eventsAttended}</strong>
              <span>Events</span>
            </div>

            <div className={styles.profileStat}>
              <Clock size={18} />
              <strong>{student.hours}h</strong>
              <span>Total Hours</span>
            </div>

            <div className={styles.profileStat}>
              <Trophy size={18} />
              <strong>{pointsOf(student)}</strong>
              <span>Points</span>
            </div>

            <div className={styles.profileStat}>
              <Star size={18} />
              <strong>{student.physicalVerificationCount || 0}</strong>
              <span>PV Count</span>
            </div>
          </div>

          {/* PERSONAL INFORMATION */}
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
                  <strong>{student.email || "-"}</strong>
                </div>
              </div>

              <div className={styles.detailItem}>
                <Phone size={15} />
                <div>
                  <small>Phone</small>
                  <strong>{student.phone || "-"}</strong>
                </div>
              </div>

              <div className={styles.detailItem}>
                <GraduationCap size={15} />
                <div>
                  <small>College</small>
                  <strong>{student.college || "-"}</strong>
                </div>
              </div>

              <div className={styles.detailItem}>
                <MapPin size={15} />
                <div>
                  <small>Zone</small>
                  <strong>{student.zone || "-"}</strong>
                </div>
              </div>

              <div className={styles.detailItem}>
                <Activity size={15} />
                <div>
                  <small>Batch</small>
                  <strong>{student.batch || "-"}</strong>
                </div>
              </div>

              <div className={styles.detailItem}>
                <Award size={15} />
                <div>
                  <small>Joined</small>
                  <strong>{formatDate(student.joinedOn)}</strong>
                </div>
              </div>

              <div className={styles.detailItem}>
                <GraduationCap size={15} />
                <div>
                  <small>Accommodation</small>
                  <strong>{student.accommodation || "-"}</strong>
                </div>
              </div>
            </div>
          </section>

          {/* VOLUNTEERING HOURS */}
          <section className={styles.detailSection}>
            <div className={styles.sectionTitle}>
              <Clock size={17} />
              Volunteering Contribution
            </div>

            <div className={styles.profileStats}>
              <div className={styles.profileStat}>
                <Clock size={18} />
                <strong>{student.regularHours || 0}h</strong>
                <span>Regular Hours</span>
              </div>

              <div className={styles.profileStat}>
                <Award size={18} />
                <strong>{student.physicalVerificationHours || 0}h</strong>
                <span>PV Hours</span>
              </div>
            </div>
          </section>

          {/* SKILLS */}
          <section className={styles.detailSection}>
            <div className={styles.sectionTitle}>
              <Award size={17} />
              Volunteer Skills
            </div>

            {skills.length === 0 ? (
              <div className={styles.emptyEvents}>
                No volunteer skills recorded.
              </div>
            ) : (
              <div className={styles.skillList}>
                {skills.map((skill, index) => (
                  <span
                    key={`${skill}-${index}`}
                    className={styles.skillChip}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </section>

          {/* ACTIVITY */}
          <section className={styles.detailSection}>
            <div className={styles.sectionTitle}>
              <Activity size={17} />
              Activity Status
            </div>

            <div className={styles.activityBox}>
              <div
                className={
                  student.lastActiveDays !== null &&
                    student.lastActiveDays <= 7
                    ? styles.activityIconActive
                    : styles.activityIconInactive
                }
              >
                <Activity size={19} />
              </div>

              <div>
                <strong>
                  {getActivityText(student.lastActiveDays)}
                </strong>

                <p>
                  Last verified activity:{" "}
                  {formatDate(student.lastActivityDate)}
                </p>
              </div>
            </div>
          </section>

          {/* EVENTS */}
          <section className={styles.detailSection}>
            <div className={styles.sectionTitle}>
              <CalendarCheck size={17} />
              Events Participated
            </div>

            {events.length === 0 ? (
              <div className={styles.emptyEvents}>
                No completed volunteering events recorded.
              </div>
            ) : (
              <div className={styles.eventList}>
                {events.map((event, index) => (
                  <div
                    key={`${event.event_name}-${index}`}
                    className={styles.eventRow}
                  >
                    <div className={styles.eventIcon}>
                      <CalendarCheck size={16} />
                    </div>

                    <div>
                      <strong>{event.event_name || "Volunteering Event"}</strong>
                      <span>
                        {Number(event.hours || 0)} hours ·{" "}
                        {Number(event.points || 0)} points
                      </span>
                    </div>

                    <ChevronRight size={16} />
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

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

  const [volunteers, setVolunteers] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ----------------------------------------------------------
     FETCH REAL STUDENT DATA
     ---------------------------------------------------------- */

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAdminStudentStatus();

      if (!response?.success) {
        throw new Error(
          response?.message || "Unable to load student data."
        );
      }

      const formattedStudents = (response.students || []).map(
        (student) => ({
          ...student,
          id: student.id || student.rollNo,
          name: student.name || "Unknown",
          rollNo: student.rollNo || "-",
          email: student.email || "",
          phone: student.phone || "",
          college: student.college || "-",
          zone: student.zone || "-",
          batch: student.batch || "-",
          department: student.department || "-",
          status: student.status || "Inactive",
          eventsAttended: Number(student.eventsAttended || 0),
          hours: Number(student.hours || 0),
          points: Number(student.points || 0),
          regularHours: Number(student.regularHours || 0),
          physicalVerificationHours: Number(
            student.physicalVerificationHours || 0
          ),
          physicalVerificationCount: Number(
            student.physicalVerificationCount || 0
          ),
          skills: Array.isArray(student.skills)
            ? student.skills
            : [],
          eventsBreakdown: Array.isArray(student.eventsBreakdown)
            ? student.eventsBreakdown
            : [],
          lastActiveDays:
            student.lastActiveDays === null ||
              student.lastActiveDays === undefined
              ? null
              : Number(student.lastActiveDays),
        })
      );

      setVolunteers(formattedStudents);
    } catch (err) {
      console.error("Student Status API Error:", err);

      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to load student data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  /* ----------------------------------------------------------
     COUNTS
     ---------------------------------------------------------- */

  const activeCount = volunteers.filter(
    (student) => student.status === "Active"
  ).length;

  const inactiveCount = volunteers.filter(
    (student) => student.status === "Inactive"
  ).length;

  const totalHours = volunteers.reduce(
    (total, student) => total + Number(student.hours || 0),
    0
  );

  const totalPoints = volunteers.reduce(
    (total, student) => total + pointsOf(student),
    0
  );

  /* ----------------------------------------------------------
     FILTER
     ---------------------------------------------------------- */

  const filteredStudents = useMemo(() => {
    const term = search.trim().toLowerCase();

    return volunteers
      .filter((student) => {
        if (statusFilter === "All") return true;
        return student.status === statusFilter;
      })
      .filter((student) => {
        if (!term) return true;

        return [
          student.name,
          student.rollNo,
          student.college,
          student.department,
          student.zone,
          student.batch,
        ].some((value) =>
          String(value || "").toLowerCase().includes(term)
        );
      });
  }, [volunteers, statusFilter, search]);

  /* ----------------------------------------------------------
     PAGE
     ---------------------------------------------------------- */

  return (
    <div className={styles.page}>
      {/* HEADER */}
      <header className={styles.header}>
        <button
          type="button"
          className={styles.backButton}
          onClick={() => navigate("/admin/dashboard")}
        >
          <span>←</span>
          <span>Back to Dashboard</span>
        </button>
        <div className={styles.headerLeft}>


          <div>
            <h1>Student Status</h1>
            <p>
              Monitor volunteer activity and engagement
            </p>
          </div>
        </div>

        <div className={styles.headerBadge}>
          <Users size={16} />
          {volunteers.length} Students
        </div>
      </header>

      <main className={styles.main}>
        {/* HERO */}
        

        {/* LOADING / ERROR */}
        {loading && (
          <div className={styles.emptyEvents}>
            Loading student records from database...
          </div>
        )}

        {!loading && error && (
          <div className={styles.emptyEvents}>
            <strong>Unable to load students</strong>
            <p>{error}</p>

            <button
              className={styles.closeFooterButton}
              onClick={fetchStudents}
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* SUMMARY CARDS */}
            

            {/* DIRECTORY */}
            <section className={styles.directory}>
              <div className={styles.directoryHeader}>
                <div>
                  <h3>Volunteer Directory</h3>
                  <p>
                    Click a student to view their complete
                    volunteering profile.
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
                    onChange={(e) => setSearch(e.target.value)}
                  />

                  {search && (
                    <button onClick={() => setSearch("")}>
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
                    onClick={() => setStatusFilter("All")}
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
                    onClick={() => setStatusFilter("Active")}
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
                    onClick={() => setStatusFilter("Inactive")}
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
                    {filteredStudents.map((student, index) => (
                      <tr
                        key={student.id}
                        style={{
                          "--delay": `${index * 0.04}s`,
                        }}
                        onClick={() => setSelectedStudent(student)}
                      >
                        <td>
                          <div className={styles.studentCell}>
                            <div className={styles.avatar}>
                              {getInitials(student.name)}
                            </div>

                            <div>
                              <strong>{student.name}</strong>
                              <span>{student.batch}</span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span className={styles.rollNumber}>
                            {student.rollNo}
                          </span>
                        </td>

                        <td>{student.college}</td>

                        <td>
                          <span className={styles.zoneBadge}>
                            {student.zone}
                          </span>
                        </td>

                        <td>
                          <span className={styles.department}>
                            {student.department}
                          </span>
                        </td>

                        <td>
                          <span
                            className={
                              student.status === "Active"
                                ? styles.statusActive
                                : styles.statusInactive
                            }
                          >
                            <span className={styles.statusDot}></span>
                            {student.status}
                          </span>
                        </td>

                        <td>
                          <strong>{student.eventsAttended}</strong>
                        </td>

                        <td>
                          <strong>{student.hours}h</strong>
                        </td>

                        <td>
                          <span className={styles.points}>
                            <Trophy size={13} />
                            {pointsOf(student)}
                          </span>
                        </td>

                        <td>
                          <span
                            className={
                              student.lastActiveDays !== null &&
                                student.lastActiveDays <= 7
                                ? styles.activityGood
                                : styles.activityBad
                            }
                          >
                            {getActivityText(student.lastActiveDays)}
                          </span>
                        </td>
                      </tr>
                    ))}

                    {filteredStudents.length === 0 && (
                      <tr>
                        <td colSpan="10" className={styles.emptyRow}>
                          <Users size={30} />

                          <strong>No students found</strong>

                          <span>
                            Try changing the search or status filter.
                          </span>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </main>

      {/* STUDENT PROFILE */}
      {selectedStudent && (
        <StudentProfile
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
      )}
    </div>
  );
};

export default StudentStatus;
