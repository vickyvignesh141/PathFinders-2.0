import styles from "./EventHistory.module.css";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, LayoutDashboard } from "lucide-react";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock,
  Clock3,
  GraduationCap,
  History,
  Inbox,
  MapPin,
  RefreshCw,
  Search,
  UserCheck,
  Users,
  X,
} from "lucide-react";

import { getAdminEventHistory } from "../../services/eventService";

/* ------------------------------------------------------------------
   Formatting helpers
   ------------------------------------------------------------------ */
const formatDate = (value) => {
  if (!value) return "Date unavailable";
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return "Date unavailable";

  return new Date(year, month - 1, day).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (value) => {
  if (!value) return "Time unavailable";
  const [hour, minute] = value.split(":").map(Number);
  if (!Number.isInteger(hour) || !Number.isInteger(minute)) {
    return "Time unavailable";
  }



  const date = new Date();
  date.setHours(hour, minute, 0, 0);

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const formatTimestamp = (value) => {
  if (!value) return "—";

  const date = new Date(
    value.endsWith("Z") || /[+-]\d{2}:\d{2}$/.test(value)
      ? value
      : `${value}Z`
  );

  if (Number.isNaN(date.getTime())) return "—";

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

const getStatusClass = (status, styles) => {
  const s = (status || "").toLowerCase();
  if (s === "approved") return styles.approved;
  if (s === "rejected") return styles.rejected;
  return styles.pending;
};

/* ------------------------------------------------------------------
   Small presentational components
   ------------------------------------------------------------------ */
const StatCard = ({ icon, value, label }) => (
  <div className={styles.statCard}>
    <span className={styles.statIcon} aria-hidden="true">
      {icon}
    </span>
    <div className={styles.statText}>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  </div>
);

const SkeletonList = () => (
  <div
    className={styles.eventList}
    role="status"
    aria-label="Loading event history"
  >
    {[0, 1, 2].map((i) => (
      <div key={i} className={styles.skeletonCard}>
        <div className={styles.skeletonTitle} />
        <div className={styles.skeletonRow}>
          <span style={{ width: 80 }} />
          <span style={{ width: 110 }} />
          <span style={{ width: 130 }} />
        </div>
        <div className={styles.skeletonRow}>
          <span style={{ width: 60 }} />
          <span style={{ width: 95 }} />
        </div>
      </div>
    ))}
  </div>
);

/* ------------------------------------------------------------------
   Page
   ------------------------------------------------------------------ */
const AdminEventHistory = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [expandedEvent, setExpandedEvent] = useState(null);

  const searchInputRef = useRef(null);

  /* --- data fetching --------------------------------------------- */
  const fetchHistory = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError("");

      const result = await getAdminEventHistory();

      if (result.success) {
        setHistory(result.history || []);
      } else {
        setError(result.message || "Unable to load event history.");
      }
    } catch (err) {
      console.error("Admin History Error:", err);
      setError(
        err.response?.data?.message ||
        "Unable to load event history. Please try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  /* --- derived data --------------------------------------------- */
  const filteredHistory = useMemo(() => {
    const term = search.trim().toLowerCase();

    return history.filter((event) => {
      const matchesSearch =
        !term ||
        event.title?.toLowerCase().includes(term) ||
        event.eventId?.toLowerCase().includes(term) ||
        event.venue?.toLowerCase().includes(term) ||
        event.zone?.toLowerCase().includes(term);

      const matchesType =
        typeFilter === "all" || event.eventType === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [history, search, typeFilter]);

  const stats = useMemo(
    () => ({
      events: history.length,
      registrations: history.reduce(
        (sum, e) => sum + (e.totalRegistrations || 0),
        0
      ),
      selected: history.reduce((sum, e) => sum + (e.selectedCount || 0), 0),
      hours: history.reduce(
        (sum, e) => sum + (e.totalVerifiedHours || 0),
        0
      ),
    }),
    [history]
  );

  const hasActiveFilters = search.trim() !== "" || typeFilter !== "all";

  const clearFilters = () => {
    setSearch("");
    setTypeFilter("all");
  };

  const clearSearch = () => {
    setSearch("");
    searchInputRef.current?.focus();
  };

  /* --- render --------------------------------------------------- */
  return (
    <div className={styles.page}>
      {/* HEADER */}
      <header className={styles.header}>
        <button
          type="button"
          className={styles.backButton}
          onClick={() => navigate("/admin/dashboard")}
        >
          <LayoutDashboard size={18} />
          <span>Back to Dashboard</span>
        </button>
        <div className={styles.headerText}>
          <span className={styles.eyebrow}>
            <History size={13} strokeWidth={2.5} aria-hidden="true" />
            Admin records
          </span>
          <h2>Event History</h2>
          <p>
            Review completed events, registrations, selections and attendance.
          </p>
        </div>

        <button
          type="button"
          className={styles.refreshButton}
          onClick={() => fetchHistory(true)}
          disabled={loading || refreshing}
          aria-busy={loading || refreshing}
        >
          <RefreshCw
            size={16}
            className={refreshing ? styles.spinning : undefined}
            aria-hidden="true"
          />
          <span>{refreshing ? "Refreshing…" : "Refresh"}</span>
        </button>
      </header>

      {/* STATS */}
      <section className={styles.statsGrid} aria-label="History summary">
        <StatCard
          icon={<CalendarDays size={19} />}
          value={stats.events}
          label="Past events"
        />
        <StatCard
          icon={<Users size={19} />}
          value={stats.registrations}
          label="Registrations"
        />
        <StatCard
          icon={<UserCheck size={19} />}
          value={stats.selected}
          label="Selected students"
        />
        <StatCard
          icon={<Clock size={19} />}
          value={`${stats.hours.toFixed(2)}h`}
          label="Verified hours"
        />
      </section>

      {/* TOOLBAR */}
      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <Search size={16} aria-hidden="true" />
          <input
            ref={searchInputRef}
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search event, venue or zone…"
            aria-label="Search events"
          />
          {search && (
            <button
              type="button"
              className={styles.searchClear}
              onClick={clearSearch}
              aria-label="Clear search"
            >
              <X size={14} aria-hidden="true" />
            </button>
          )}
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          aria-label="Filter by event type"
          className={styles.filterSelect}
        >
          <option value="all">All event types</option>
          <option value="regular">Regular events</option>
          <option value="physical_verification">Physical verification</option>
        </select>
      </div>

      {/* BODY */}
      {loading ? (
        <SkeletonList />
      ) : error ? (
        <div className={styles.errorMessage} role="alert">
          <AlertTriangle size={22} aria-hidden="true" />
          <p>{error}</p>
          <button type="button" onClick={() => fetchHistory()}>
            Try again
          </button>
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className={styles.emptyState}>
          <Inbox size={36} strokeWidth={1.5} aria-hidden="true" />
          <h3>
            {hasActiveFilters ? "No matching events" : "No past events yet"}
          </h3>
          <p>
            {hasActiveFilters
              ? "Try a different keyword, or clear the filters to see everything."
              : "Completed events will appear here automatically."}
          </p>
          {hasActiveFilters && (
            <button type="button" onClick={clearFilters}>
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className={styles.eventList}>
          {filteredHistory.map((event) => {
            const isExpanded = expandedEvent === event.id;
            const isPV = event.eventType === "physical_verification";
            const registrations = event.registrations || [];
            const verifiedHours = (event.totalVerifiedHours || 0).toFixed(2);

            return (
              <article className={styles.eventCard} key={event.id}>
                <button
                  type="button"
                  className={styles.eventSummary}
                  onClick={() =>
                    setExpandedEvent(isExpanded ? null : event.id)
                  }
                  aria-expanded={isExpanded}
                  aria-controls={`details-${event.id}`}
                >
                  <div className={styles.eventMain}>
                    <div className={styles.eventTitleRow}>
                      <h3>{event.title}</h3>
                      <span
                        className={`${styles.completedBadge} ${isPV ? styles.pvBadge : ""
                          }`}
                      >
                        {event.status}
                      </span>
                    </div>

                    <div className={styles.eventMeta}>
                      <span>
                        <CalendarDays size={13} aria-hidden="true" />
                        {formatDate(event.date)}
                      </span>
                      <span>
                        <Clock3 size={13} aria-hidden="true" />
                        {formatTime(event.startTime)} –{" "}
                        {formatTime(event.endTime)}
                      </span>
                      <span>
                        <MapPin size={13} aria-hidden="true" />
                        {event.venue || "Venue unavailable"}
                      </span>
                    </div>

                    <div className={styles.eventTags}>
                      <span>{event.zone || "Zone not specified"}</span>
                      <span>
                        {isPV ? "Physical verification" : "Regular event"}
                      </span>
                    </div>
                  </div>

                  <div className={styles.eventNumbers}>
                    <div>
                      <strong>{event.totalRegistrations ?? 0}</strong>
                      <span>Registered</span>
                    </div>
                    <div>
                      <strong>{event.selectedCount ?? 0}</strong>
                      <span>Selected</span>
                    </div>
                    {!isPV && (
                      <div>
                        <strong>{event.verifiedAttendanceCount ?? 0}</strong>
                        <span>Verified</span>
                      </div>
                    )}
                  </div>

                  <span
                    className={`${styles.expandIcon} ${isExpanded ? styles.expandIconOpen : ""
                      }`}
                    aria-hidden="true"
                  >
                    <ChevronDown size={18} />
                  </span>
                </button>

                {isExpanded && (
                  <div className={styles.details} id={`details-${event.id}`}>
                    {event.description && (
                      <p className={styles.description}>{event.description}</p>
                    )}

                    <div className={styles.detailHeading}>
                      <h4>Student registrations</h4>
                      <span>{registrations.length} records</span>
                    </div>

                    {registrations.length === 0 ? (
                      <p className={styles.noStudents}>
                        No registrations found for this event.
                      </p>
                    ) : (
                      <div className={styles.tableWrap} tabIndex={0}>
                        <table>
                          <thead>
                            <tr>
                              <th scope="col">Student</th>
                              <th scope="col">Username</th>
                              <th scope="col">Registered</th>
                              <th scope="col">Selection</th>
                              {!isPV && <th scope="col">Attendance</th>}
                              {!isPV && <th scope="col">Hours</th>}
                            </tr>
                          </thead>
                          <tbody>
                            {registrations.map((student) => {
                              const attendance = student.attendance;

                              return (
                                <tr key={student.registrationId}>
                                  <td>
                                    <strong>
                                      {student.studentName || "—"}
                                    </strong>
                                    <small>{student.email || ""}</small>
                                  </td>
                                  <td>{student.studentUsername || "—"}</td>
                                  <td>
                                    {formatTimestamp(student.registeredAt)}
                                  </td>
                                  <td>
                                    <span
                                      className={`${styles.statusBadge
                                        } ${getStatusClass(
                                          student.status,
                                          styles
                                        )}`}
                                    >
                                      {student.status || "Pending"}
                                    </span>
                                  </td>

                                  {!isPV && (
                                    <td>
                                      <div
                                        className={styles.attendanceCell}
                                      >
                                        <span
                                          className={
                                            styles.attendanceStatus
                                          }
                                        >
                                          {attendance?.status ||
                                            "Not checked in"}
                                        </span>

                                        {attendance?.adminVerified && (
                                          <small>
                                            <CheckCircle2
                                              size={12}
                                              aria-hidden="true"
                                            />
                                            Admin verified
                                          </small>
                                        )}

                                        {attendance?.scannedAt && (
                                          <small>
                                            Check-in:{" "}
                                            {formatTimestamp(
                                              attendance.scannedAt
                                            )}
                                          </small>
                                        )}

                                        {attendance?.completedAt && (
                                          <small>
                                            Completed:{" "}
                                            {formatTimestamp(
                                              attendance.completedAt
                                            )}
                                          </small>
                                        )}
                                      </div>
                                    </td>
                                  )}

                                  {!isPV && (
                                    <td>{attendance?.creditedHours || 0}h</td>
                                  )}
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {!isPV && (
                      <div className={styles.attendanceFooter}>
                        <span>
                          <CheckCircle2 size={15} aria-hidden="true" />
                          {event.verifiedAttendanceCount ?? 0} verified
                          attendance records
                        </span>
                        <strong>{verifiedHours} verified hours</strong>
                      </div>
                    )}

                    {isPV && (
                      <div className={styles.pvNotice}>
                        <GraduationCap size={17} aria-hidden="true" />
                        <span>
                          This is a Physical Verification event. QR attendance
                          is not used. PV verification details are not included
                          in the current backend response.
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminEventHistory;