
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./StudentHistory.module.css";

const API_URL = "http://localhost:5000/api/feedback/student/certificates";

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800";

// ==========================================
// FORMAT DATE
// ==========================================

const formatDate = (date) => {
  if (!date) return "Date not available";

  const dateOnly = String(date).split("T")[0];

  if (/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) {
    const [year, month, day] = dateOnly.split("-");

    return new Date(
      Number(year),
      Number(month) - 1,
      Number(day)
    ).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return String(date);
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

// ==========================================
// FORMAT DURATION
// ==========================================

const formatDuration = (hoursText) => {
  if (
    hoursText === null ||
    hoursText === undefined ||
    hoursText === "" ||
    hoursText === "Not available"
  ) {
    return "Not available";
  }

  const hours = parseFloat(
    String(hoursText).replace("Hours", "").trim()
  );

  if (!Number.isFinite(hours) || hours < 0) {
    return "Not available";
  }

  const totalMinutes = Math.round(hours * 60);

  const fullHours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (fullHours > 0 && minutes > 0) {
    return `${fullHours} Hours ${minutes} Minutes`;
  }

  if (fullHours > 0) {
    return `${fullHours} Hours`;
  }

  return `${minutes} Minutes`;
};

// ==========================================
// STUDENT HISTORY COMPONENT
// ==========================================

const StudentHistory = () => {
  const navigate = useNavigate();

  const [eventsData, setEventsData] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const filters = ["All", "Volunteering"];

  // ==========================================
  // FETCH STUDENT EVENT HISTORY
  // ==========================================

  useEffect(() => {
    const fetchStudentHistory = async () => {
      try {
        setLoading(true);
        setError("");

        // Get login token
        const token =
          localStorage.getItem("token") ||
          localStorage.getItem("accessToken") ||
          localStorage.getItem("authToken") ||
          localStorage.getItem("access_token");

        if (!token) {
          throw new Error(
            "Login token not found. Please login again."
          );
        }

        // ======================================
        // FETCH CERTIFICATE API
        // Same API used in Student Certificate
        // ======================================

        const response = await fetch(API_URL, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        let responseData;

        try {
          responseData = await response.json();
        } catch {
          throw new Error(
            "Invalid response from server. Please check backend."
          );
        }

        if (!response.ok || !responseData.success) {
          throw new Error(
            responseData.message ||
            `Server error: ${response.status}`
          );
        }

        // ======================================
        // GET ATTENDED EVENTS
        // ======================================

        const attendedCertificates =
          Array.isArray(responseData.certificates)
            ? responseData.certificates
            : [];

        console.log(
          "STUDENT HISTORY API RESPONSE:",
          responseData
        );

        console.log(
          "STUDENT ATTENDED EVENTS:",
          attendedCertificates
        );

        // ======================================
        // MAP EVENTS
        // ======================================

        const attendedEvents = attendedCertificates.map(
          (record) => ({
            id: record.id || record.eventId,

            eventId: record.eventId,

            title:
              record.title ||
              "Volunteering Event",

            category:
              record.category ||
              "Volunteering",

            date: formatDate(record.date),

            location:
              record.location ||
              "Not available",

            organizer:
              record.organization ||
              "Maatram Foundation",

            role: "Volunteer",

            status: "Completed",

            description:
              record.description ||
              record.eventDescription ||
              record.category ||
              "Volunteering event successfully completed.",

            team: "—",

            certificate:
              record.certificateId ||
              "Feedback Required",

            duration: formatDuration(record.hours),

            image:
              record.image ||
              DEFAULT_IMAGE,

            scannedAt:
              record.scannedAt || null,

            completedAt:
              record.completedAt || null,

            volunteerWork:
              record.category ||
              "Not available",

            instructions:
              record.instructions ||
              "Not available",

            zone:
              record.zone ||
              "Not available",

            certificateId:
              record.certificateId || "",

            feedbackSubmitted:
              record.feedbackSubmitted === true,
          })
        );

        // ======================================
        // REMOVE DUPLICATE EVENTS
        // ======================================

        const uniqueEvents = Array.from(
          new Map(
            attendedEvents.map((event) => [
              String(event.eventId),
              event,
            ])
          ).values()
        );

        setEventsData(uniqueEvents);

      } catch (err) {
        console.error(
          "Student History Error:",
          err
        );

        setError(
          err.message ||
          "Unable to load your event history."
        );

      } finally {
        setLoading(false);
      }
    };

    fetchStudentHistory();
  }, []);

  // ==========================================
  // SEARCH AND FILTER
  // ==========================================

  const filteredEvents = eventsData.filter((event) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      event.title.toLowerCase().includes(searchText) ||
      event.category.toLowerCase().includes(searchText) ||
      event.location.toLowerCase().includes(searchText);

    const matchesFilter =
      activeFilter === "All" ||
      event.category === activeFilter;

    return matchesSearch && matchesFilter;
  });

  const completedCount = eventsData.length;

  const volunteeringCount = eventsData.filter(
    (event) =>
      event.category.toLowerCase() === "volunteering"
  ).length;

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className={styles.historyPage}>
      <div className={styles.historyContainer}>

        {/* HEADER */}

        <div
          className={styles.pageHeader}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            gap: "20px",
          }}
        >
          <div>
            <span className={styles.eyebrow}>
              STUDENT ACTIVITIES
            </span>

            <h1>
              My Event History<span>.</span>
            </h1>
          </div>

          <button
            type="button"
            onClick={() => navigate("/student/dashboard")}
            style={{
              padding: "10px 18px",
              background: "#f5c518",
              color: "#171717",
              border: "none",
              borderRadius: "6px",
              fontWeight: "600",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* SEARCH */}

        <div className={styles.filterSection}>
          <div className={styles.sectionTitle}>
          </div>

          <div className={styles.filterControls}>
            <div className={styles.searchBox}>
              <span>⌕</span>

              <input
                type="text"
                placeholder="Search events..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />
            </div>
          </div>
        </div>

        {/* LOADING */}

        {loading && (
          <div className={styles.emptyState}>
            <h3>Loading your event history...</h3>

            <p>
              Please wait while we fetch your attended events.
            </p>
          </div>
        )}

        {/* ERROR */}

        {!loading && error && (
          <div className={styles.emptyState}>
            <h3>Unable to Load Event History</h3>

            <p>{error}</p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              style={{
                marginTop: "15px",
                padding: "10px 20px",
                background: "#f5c518",
                color: "#171717",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              Try Again
            </button>
          </div>
        )}

        {/* EVENT CARDS */}

        {!loading && !error && (
          <div className={styles.eventGrid}>
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className={styles.eventCard}
                onClick={() => setSelectedEvent(event)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" ||
                    e.key === " "
                  ) {
                    e.preventDefault();
                    setSelectedEvent(event);
                  }
                }}
              >

                {/* IMAGE */}

                <div className={styles.eventImage}>
                  <img
                    src={event.image}
                    alt={event.title}
                    onError={(e) => {
                      e.currentTarget.src = DEFAULT_IMAGE;
                    }}
                  />

                  <span className={styles.categoryBadge}>
                    {event.category}
                  </span>
                </div>

                {/* CONTENT */}

                <div className={styles.eventContent}>
                  <div className={styles.eventDate}>
                    <span>◷</span> {event.date}
                  </div>

                  <h3>{event.title}</h3>

                  <p className={styles.eventLocation}>
                    <span>⌖</span> {event.location}
                  </p>

                  <div className={styles.cardFooter}>
                    <span className={styles.completedStatus}>
                      {event.status}
                    </span>

                    <button
                      className={styles.viewButton}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEvent(event);
                      }}
                    >
                      View Details <span>↗</span>
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

        {/* EMPTY STATE */}

        {!loading &&
          !error &&
          filteredEvents.length === 0 && (
            <div className={styles.emptyState}>
              <div>⌕</div>

              <h3>
                {eventsData.length === 0
                  ? "No Attended Events Yet"
                  : "No Events Found"}
              </h3>

              <p>
                {eventsData.length === 0
                  ? "Your completed and verified volunteering events will appear here."
                  : "Try searching with another event name or category."}
              </p>
            </div>
          )}

      </div>

      {/* ======================================
          EVENT DETAILS MODAL
      ====================================== */}

      {selectedEvent && (
        <div
          className={styles.modalOverlay}
          onClick={() => setSelectedEvent(null)}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="event-modal-title"
          >

            {/* CLOSE BUTTON */}

            <button
              className={styles.closeButton}
              onClick={() => setSelectedEvent(null)}
              aria-label="Close event details"
            >
              ×
            </button>

            {/* MODAL IMAGE */}

            <div className={styles.modalImage}>
              <img
                src={selectedEvent.image}
                alt={selectedEvent.title}
                onError={(e) => {
                  e.currentTarget.src = DEFAULT_IMAGE;
                }}
              />

              <span>{selectedEvent.category}</span>
            </div>

            {/* MODAL BODY */}

            <div className={styles.modalBody}>
              <span className={styles.modalLabel}>
                EVENT PARTICIPATION DETAILS
              </span>

              <h2 id="event-modal-title">
                {selectedEvent.title}
              </h2>

              <p className={styles.modalDescription}>
                {selectedEvent.description}
              </p>

              <div className={styles.detailsGrid}>

                <div className={styles.detailItem}>
                  <span>Event Date</span>
                  <strong>{selectedEvent.date}</strong>
                </div>

                <div className={styles.detailItem}>
                  <span>Location</span>
                  <strong>{selectedEvent.location}</strong>
                </div>

                <div className={styles.detailItem}>
                  <span>Organizer</span>
                  <strong>{selectedEvent.organizer}</strong>
                </div>

                <div className={styles.detailItem}>
                  <span>Participation Role</span>
                  <strong>{selectedEvent.role}</strong>
                </div>

                <div className={styles.detailItem}>
                  <span>Volunteer Work</span>
                  <strong>{selectedEvent.volunteerWork}</strong>
                </div>

                <div className={styles.detailItem}>
                  <span>Duration</span>
                  <strong>{selectedEvent.duration}</strong>
                </div>

                <div className={styles.detailItem}>
                  <span>Certificate ID</span>
                  <strong>
                    {selectedEvent.certificateId ||
                      "Feedback Required"}
                  </strong>
                </div>

                <div className={styles.detailItem}>
                  <span>Feedback Status</span>
                  <strong>
                    {selectedEvent.feedbackSubmitted
                      ? "Submitted"
                      : "Pending"}
                  </strong>
                </div>

                <div className={styles.detailItem}>
                  <span>Event Status</span>
                  <strong>{selectedEvent.status}</strong>
                </div>

                <div className={styles.detailItem}>
                  <span>Admin Verified</span>
                  <strong>Yes</strong>
                </div>

                <div className={styles.detailItem}>
                  <span>Zone</span>
                  <strong>{selectedEvent.zone}</strong>
                </div>

                <div className={styles.detailItem}>
                  <span>Instructions</span>
                  <strong>{selectedEvent.instructions}</strong>
                </div>

              </div>

              {/* MODAL FOOTER */}

              <div className={styles.modalFooter}>
                <button
                  className={styles.closeModalButton}
                  onClick={() => setSelectedEvent(null)}
                >
                  Close Details
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default StudentHistory;
