
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./StudentEvent.module.css";

import {
  getAllEvents,
  getStudentRegistrations,
  registerForEvent,
} from "../../services/eventService";

// Previous Student History records
const HISTORY = [
  {
    id: 1,
    title: "Web Development Bootcamp",
    type: "Workshop",
    date: "10 Jan 2026",
    status: "Completed",
    certificate: true,
  },
  {
    id: 2,
    title: "Inter-College Coding Contest",
    type: "Contest",
    date: "18 Dec 2025",
    status: "Completed",
    certificate: true,
  },
  {
    id: 3,
    title: "Cloud Computing Seminar",
    type: "Seminar",
    date: "05 Nov 2025",
    status: "Completed",
    certificate: false,
  },
  {
    id: 4,
    title: "Robotics Expo",
    type: "Expo",
    date: "20 Sep 2025",
    status: "Completed",
    certificate: true,
  },
];

const formatDate = (date) => {
  if (!date) return "Date not available";

  const [year, month, day] = date.split("T")[0].split("-");
  const parsed = new Date(Number(year), Number(month) - 1, Number(day));

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (time) => {
  if (!time) return "";

  const [hours, minutes] = time.split(":");
  const date = new Date();
  date.setHours(Number(hours), Number(minutes), 0, 0);

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const getEventTime = (event) => {
  let start = event.startTime;
  let end = event.endTime;

  if (!start && event.startAt) {
    const date = new Date(event.startAt);
    start = `${String(date.getHours()).padStart(2, "0")}:${String(
      date.getMinutes()
    ).padStart(2, "0")}`;
  }

  if (!end && event.endAt) {
    const date = new Date(event.endAt);
    end = `${String(date.getHours()).padStart(2, "0")}:${String(
      date.getMinutes()
    ).padStart(2, "0")}`;
  }

  if (!start && !end) return "Time not available";

  return `${formatTime(start)}${end ? ` – ${formatTime(end)}` : ""}`;
};

const normalizeStatus = (status) => {
  const value = String(status || "").toLowerCase();

  if (value === "approved" || value === "selected") return "Selected";
  if (value === "rejected") return "Rejected";
  if (
    value === "registered" ||
    value === "pending" ||
    value === "request sent"
  ) {
    return "Registered";
  }

  return "";
};

const StudentEvent = () => {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [registrationStatus, setRegistrationStatus] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Fetch admin-created upcoming events
  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);

      const result = await getAllEvents();

      if (!result.success) {
        throw new Error(result.message || "Unable to fetch events");
      }

      const upcoming = (result.events || []).filter((event) => {
        const eventDate = event.date
          ? new Date(`${event.date.split("T")[0]}T23:59:59`)
          : null;

        return (
          String(event.status || "").toLowerCase() !== "completed" &&
          (!eventDate || eventDate >= new Date())
        );
      });

      setEvents(upcoming);
      setError("");
    } catch (err) {
      console.error("Event fetch error:", err.response?.data || err);

      setError(
        err.response?.data?.message ||
        err.message ||
        "Unable to load events. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch registration statuses saved by backend
  const fetchRegistrationStatuses = useCallback(async () => {
    try {
      const result = await getStudentRegistrations();

      if (!result.success) {
        throw new Error(result.message || "Unable to fetch registrations");
      }

      const statusMap = {};

      (result.registrations || []).forEach((registration) => {
        const eventId =
          registration.eventId?._id ||
          registration.eventId ||
          registration.event?._id ||
          registration.event;

        if (eventId) {
          statusMap[eventId] = normalizeStatus(registration.status);
        }
      });

      setRegistrationStatus(statusMap);
    } catch (err) {
      console.error(
        "Registration status error:",
        err.response?.data || err
      );
    }
  }, []);

  useEffect(() => {
    fetchEvents();
    fetchRegistrationStatuses();

    // Refresh approval status periodically
    const interval = setInterval(() => {
      fetchRegistrationStatuses();
    }, 15000);

    return () => clearInterval(interval);
  }, [fetchEvents, fetchRegistrationStatuses]);

  const getStatus = (event) => {
    const id = event._id || event.id;
    return registrationStatus[id] || "";
  };

  const openEventDetails = (event) => {
    setSelectedEvent(event);
  };

  const closePopup = () => {
    if (!submitting) setSelectedEvent(null);
  };

  // Register event using backend
  const handleRegister = async () => {
    if (!selectedEvent || submitting) return;

    const eventId = selectedEvent._id || selectedEvent.id;

    if (getStatus(selectedEvent)) return;

    try {
      setSubmitting(true);

      const result = await registerForEvent(eventId);

      if (!result.success) {
        throw new Error(result.message || "Registration failed");
      }

      setRegistrationStatus((prev) => ({
        ...prev,
        [eventId]: "Registered",
      }));

      alert("Registration successful!");
      setSelectedEvent(null);

      // Get the latest status from backend
      fetchRegistrationStatuses();
    } catch (err) {
      console.error("Registration error:", err);
      alert(err.message || "Registration failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Selected students can enter the event details page
 const openSelectedEvent = (event) => {
  const eventId = event.eventId;

  navigate(`/student/eventdetails/${eventId}`);
};

  const renderStatus = (status) => {
    if (status === "Selected") {
      return <span className={styles.selectedBadge}>Selected</span>;
    }

    if (status === "Rejected") {
      return <span className={styles.rejectedBadge}>Rejected</span>;
    }

    if (status === "Registered") {
      return <span className={styles.registeredBadge}>Registered</span>;
    }

    return <span className={styles.openBadge}>Open</span>;
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>MAATRAM VOLUNTEERING</span>
          <h1>Upcoming Events</h1>
          <p>
            Discover opportunities and make a difference
            through volunteering.
          </p>
        </div>

        <div className={styles.eventCount}>
          <span>{events.length}</span>
          <small>Available Events</small>
        </div>
      </header>

      <main className={styles.main}>
        {/* Upcoming Events */}
        <div className={styles.sectionHeader}>
          <div>
            <h2>Explore Events</h2>
            <p>Choose an event that interests you.</p>
          </div>
        </div>

        {loading && (
          <div className={styles.message}>Loading upcoming events...</div>
        )}

        {error && <div className={styles.error}>{error}</div>}

        {!loading && !error && events.length === 0 && (
          <div className={styles.empty}>
            <span>📅</span>
            <h3>No Upcoming Events</h3>
            <p>New volunteering opportunities will appear here.</p>
          </div>
        )}

        <div className={styles.eventGrid}>
          {events.map((event) => {
            const eventId = event._id || event.id;
            const status = getStatus(event);

            return (
              <article className={styles.eventCard} key={eventId}>
                <h3 className={styles.eventTitle}>{event.eventTitle}</h3>

                <div className={styles.cardInfo}>
                  <div>
                    <span>📅</span>
                    <p>{formatDate(event.date)}</p>
                  </div>

                  <div>
                    <span>📍</span>
                    <p>{event.location}</p>
                  </div>

                  <div>
                    <span>🕒</span>
                    <p>{getEventTime(event)}</p>
                  </div>
                </div>

                <div className={styles.statusRow}>
                  {renderStatus(status)}
                </div>

                <div className={styles.cardFooter}>
                  <button
                    className={styles.viewBtn}
                    onClick={() => openEventDetails(event)}
                  >
                    View Details
                  </button>

                  {status === "Selected" ? (
                    <button
                      className={styles.selectedButton}
                      onClick={() => openSelectedEvent(event)}
                    >
                      Open Event →
                    </button>
                  ) : status === "Rejected" ? (
                    <button className={styles.disabledButton} disabled>
                      Rejected
                    </button>
                  ) : status === "Registered" ? (
                    <button className={styles.disabledButton} disabled>
                      Registered
                    </button>
                  ) : (
                    <button
                      className={styles.registerBtn}
                      onClick={() => openEventDetails(event)}
                    >
                      Register Event
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        {/* Student History */}
        <section className={styles.historySection}>
          <div className={styles.historyHeader}>
            <div>
              <h2>Student History</h2>
              <p>Your previously completed events.</p>
            </div>

            <span className={styles.historyCount}>
              {HISTORY.length} past events
            </span>
          </div>

          <div className={styles.meHistoryList}>
            {HISTORY.map((item) => (
              <div className={styles.historyItem} key={item.id}>
                <div className={styles.historyIcon}>📘</div>

                <div className={styles.historyInfo}>
                  <h3>{item.title}</h3>
                  <p>
                    {item.type} • {item.date}
                  </p>
                </div>

                <span className={styles.completedBadge}>
                  {item.status}
                </span>

                {item.certificate && (
                  <button
                    className={styles.certificateBtn}
                    type="button"
                    onClick={() =>
                      alert("Certificate feature will be connected soon.")
                    }
                  >
                    🎓 Certificate
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Event Details Popup */}
      {selectedEvent && (
        <div className={styles.overlay} onClick={closePopup}>
          <div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <div>
                <span className={styles.modalEyebrow}>
                  EVENT INFORMATION
                </span>
                <h2>Event Details</h2>
              </div>

              <button
                className={styles.closeBtn}
                onClick={closePopup}
                aria-label="Close popup"
              >
                ×
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.modalTitleArea}>
                <span className={styles.modalCategory}>
                  {selectedEvent.zone || "Volunteering"}
                </span>
                <h3>{selectedEvent.eventTitle}</h3>
              </div>

              <section className={styles.detailSection}>
                <h4>About This Event</h4>
                <p>
                  {selectedEvent.eventDescription ||
                    "No event description provided."}
                </p>
              </section>

              <section className={styles.detailSection}>
                <h4>Volunteer Work</h4>
                <p>
                  {selectedEvent.volunteerWork ||
                    "No volunteer work details provided."}
                </p>
              </section>

              <section className={styles.detailSection}>
                <h4>Event Information</h4>

                <div className={styles.detailsGrid}>
                  <div className={styles.detailBox}>
                    <span>📅 Date</span>
                    <strong>{formatDate(selectedEvent.date)}</strong>
                  </div>

                  <div className={styles.detailBox}>
                    <span>🕒 Time</span>
                    <strong>{getEventTime(selectedEvent)}</strong>
                  </div>

                  <div className={styles.detailBox}>
                    <span>📍 Location</span>
                    <strong>{selectedEvent.location}</strong>
                  </div>

                  <div className={styles.detailBox}>
                    <span>👥 Volunteers Needed</span>
                    <strong>{selectedEvent.volunteersNeeded}</strong>
                  </div>

                  <div className={styles.detailBox}>
                    <span>📌 Zone</span>
                    <strong>{selectedEvent.zone}</strong>
                  </div>
                </div>
              </section>

              <section className={styles.instructions}>
                <h4>Instructions for Volunteers</h4>
                <p>
                  {selectedEvent.instructions ||
                    "No special instructions provided."}
                </p>
              </section>

              {/* Show registration status inside popup */}
              {getStatus(selectedEvent) && (
                <div className={styles.modalStatus}>
                  Registration Status: {getStatus(selectedEvent)}
                </div>
              )}
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.cancelBtn}
                onClick={closePopup}
                disabled={submitting}
              >
                Close
              </button>

              {getStatus(selectedEvent) === "Selected" ? (
                <button
                  className={styles.selectedButton}
                  onClick={() => openSelectedEvent(selectedEvent)}
                >
                  Open Event →
                </button>
              ) : getStatus(selectedEvent) === "Rejected" ? (
                <button className={styles.disabledButton} disabled>
                  Registration Rejected
                </button>
              ) : getStatus(selectedEvent) === "Registered" ? (
                <button className={styles.disabledButton} disabled>
                  Registered
                </button>
              ) : (
                <button
                  className={styles.modalRegisterBtn}
                  onClick={handleRegister}
                  disabled={submitting}
                >
                  {submitting ? "Submitting..." : "Register Event →"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentEvent;
