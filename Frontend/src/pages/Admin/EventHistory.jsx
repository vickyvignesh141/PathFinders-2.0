import React, { useMemo, useState } from "react";
import {
  History,
  Calendar,
  MapPin,
  Map as MapIcon,
  Users,
  Heart,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import styles from "./EventHistory.module.css";

/* ============================================================
   HELPERS
   ============================================================ */
const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

/* ============================================================
   VOLUNTEER TABLE (reusable for both tabs)
   ============================================================ */
function VolunteerTable({
  volunteers,
  selectedIds = [],
  onProfileClick,
  pointsOf,
  showStatus = false,
}) {
  if (volunteers.length === 0) {
    return <p className={styles.emptyText}>No volunteers in this list.</p>;
  }

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Volunteer</th>
            <th>Roll No</th>
            <th>College</th>
            <th>Zone</th>
            <th>Batch</th>
            <th className={styles.tdCenter}>Events</th>
            <th className={styles.tdCenter}>Hours</th>
            <th className={styles.tdCenter}>Rating</th>
            {showStatus && <th>Status</th>}
            <th className={styles.tdCenter}>Points</th>
          </tr>
        </thead>
        <tbody>
          {volunteers.map((v) => {
            const isSelected = selectedIds.includes(v.id);
            return (
              <tr key={v.id}>
                <td>
                  <div className={styles.volCell}>
                    <div className={styles.volAvatar}>{v.name.charAt(0)}</div>
                    <button
                      className={styles.linkBtn}
                      onClick={() => onProfileClick(v.id)}
                    >
                      {v.name}
                    </button>
                  </div>
                </td>
                <td className={styles.mono}>{v.rollNo}</td>
                <td>{v.college}</td>
                <td>{v.zone}</td>
                <td>{v.batch}</td>
                <td className={styles.tdCenter}>{v.eventsAttended}</td>
                <td className={styles.tdCenter}>{v.hours}</td>
                <td className={styles.tdCenter}>{v.rating}★</td>
                {showStatus && (
                  <td>
                    {isSelected ? (
                      <span className={styles.statusSelected}>✓ Selected</span>
                    ) : (
                      <span className={styles.statusNotSelected}>Not selected</span>
                    )}
                  </td>
                )}
                <td className={styles.tdCenter}>
                  <strong>{pointsOf(v)}</strong>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ============================================================
   EVENT CARD
   ============================================================ */
function EventHistoryCard({ event, volunteers, onProfileClick, pointsOf }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("selected");

  const selectedVolunteers = event.selected
    .map((id) => volunteers.find((v) => v.id === id))
    .filter(Boolean);

  const interestedVolunteers = event.interested
    .map((id) => volunteers.find((v) => v.id === id))
    .filter(Boolean);

  const totalHours = selectedVolunteers.reduce((s, v) => s + v.hours, 0);

  return (
    <article className={styles.card}>
      <button
        type="button"
        className={styles.cardHeader}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <div className={styles.headerLeft}>
          <h4 className={styles.eventTitle}>{event.title}</h4>
          <p className={styles.eventMeta}>
            <Calendar size={12} className={styles.inlineIcon} />
            {fmtDate(event.startAt)}
            <span className={styles.metaSep}>·</span>
            <MapPin size={12} className={styles.inlineIcon} />
            {event.venue}
            <span className={styles.metaSep}>·</span>
            <MapIcon size={12} className={styles.inlineIcon} />
            {event.zone}
          </p>
        </div>

        <div className={styles.headerRight}>
          <span className={`${styles.pill} ${styles.pillGreen}`}>
            <Users size={11} className={styles.inlineIcon} />
            {selectedVolunteers.length} volunteers
          </span>
          <span className={`${styles.pill} ${styles.pillGrey}`}>Completed</span>
          <span className={styles.expandIcon}>
            {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </span>
        </div>
      </button>

      {open && (
        <div className={styles.cardBody}>
          {event.description && (
            <p className={styles.desc}>{event.description}</p>
          )}

          <div className={styles.statsRow}>
            <div className={styles.statBox}>
              <strong className={styles.statNum}>{event.interested.length}</strong>
              <span className={styles.statLabel}>Interested</span>
            </div>
            <div className={styles.statBox}>
              <strong className={styles.statNum}>
                {selectedVolunteers.length}/{event.volunteersNeeded}
              </strong>
              <span className={styles.statLabel}>Volunteers</span>
            </div>
            <div className={styles.statBox}>
              <strong className={styles.statNum}>{totalHours}</strong>
              <span className={styles.statLabel}>Total Hours</span>
            </div>
            <div className={styles.statBox}>
              <strong className={styles.statNum}>
                {event.emailsSent ? "Yes" : "No"}
              </strong>
              <span className={styles.statLabel}>Emails Sent</span>
            </div>
            <div className={styles.statBox}>
              <strong className={styles.statNum}>
                {event.reminderSent ? "Yes" : "No"}
              </strong>
              <span className={styles.statLabel}>Reminder</span>
            </div>
          </div>

          <div className={styles.tabs} role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={tab === "selected"}
              className={`${styles.tab} ${tab === "selected" ? styles.tabActive : ""}`}
              onClick={() => setTab("selected")}
            >
              <Users size={14} className={styles.inlineIcon} />
              Volunteers Who Participated
              <span className={styles.tabCount}>{selectedVolunteers.length}</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === "interested"}
              className={`${styles.tab} ${tab === "interested" ? styles.tabActive : ""}`}
              onClick={() => setTab("interested")}
            >
              <Heart size={14} className={styles.inlineIcon} />
              Interested Volunteers
              <span className={styles.tabCount}>{interestedVolunteers.length}</span>
            </button>
          </div>

          <div className={styles.tabBody}>
            {tab === "selected" ? (
              <VolunteerTable
                volunteers={selectedVolunteers}
                onProfileClick={onProfileClick}
                pointsOf={pointsOf}
              />
            ) : (
              <VolunteerTable
                volunteers={interestedVolunteers}
                selectedIds={event.selected}
                showStatus
                onProfileClick={onProfileClick}
                pointsOf={pointsOf}
              />
            )}
          </div>
        </div>
      )}
    </article>
  );
}

/* ============================================================
   EVENT HISTORY (top-level)
   ============================================================ */
function EventHistory({
  events = [],
  volunteers = [],
  onProfileClick = () => {},
  pointsOf = (v) => v.eventsAttended * 10 + v.hours * 2 + Math.round(v.rating * 20),
}) {
  const completedEvents = useMemo(
    () =>
      events
        .filter((e) => e.status === "Completed")
        .sort((a, b) => new Date(b.startAt) - new Date(a.startAt)),
    [events]
  );

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          <History size={20} className={styles.inlineIcon} /> Event History
        </h3>
        <span className={`${styles.pill} ${styles.pillGreen}`}>
          {completedEvents.length} completed
        </span>
      </div>

      {completedEvents.length === 0 ? (
        <p className={styles.emptyText}>
          No completed events yet. Completed events will appear here with full
          volunteer details.
        </p>
      ) : (
        <div className={styles.list}>
          {completedEvents.map((event) => (
            <EventHistoryCard
              key={event.id}
              event={event}
              volunteers={volunteers}
              onProfileClick={onProfileClick}
              pointsOf={pointsOf}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default EventHistory;