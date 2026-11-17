
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./StudentHistory.module.css";

const API_URL = "http://localhost:5000/api/events/";

const StudentHistory = () => {
  const navigate = useNavigate();

  const [eventsData, setEventsData] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const filters = [
    "All",
    "Volunteering",
  ];

  // Format event date
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
      return date;
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  // Convert attendance duration into readable hours
  const formatDuration = (seconds) => {
    if (seconds === null || seconds === undefined) {
      return "Not available";
    }

    const totalSeconds = Number(seconds);

    if (!Number.isFinite(totalSeconds) || totalSeconds < 0) {
      return "Not available";
    }

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    if (hours > 0 && minutes > 0) {
      return `${hours} Hours ${minutes} Minutes`;
    }

    if (hours > 0) {
      return `${hours} Hours`;
    }

    return `${minutes} Minutes`;
  };

  // Fetch only completed and admin-verified attendance
  useEffect(() => {
    const fetchStudentHistory = async () => {
      try {
        setLoading(true);
        setError("");

        const token =
          localStorage.getItem("token") ||
          localStorage.getItem("accessToken") ||
          localStorage.getItem("authToken") ||
          localStorage.getItem("access_token");

        // Get student attendance
        const attendanceResponse = await fetch(
          `${API_URL}student/attendance/timers`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              ...(token
                ? { Authorization: `Bearer ${token}` }
                : {}),
            },
            credentials: "include",
          }
        );

        const attendanceData = await attendanceResponse.json();

        if (!attendanceResponse.ok || !attendanceData.success) {
          throw new Error(
            attendanceData.message || "Unable to fetch attendance history"
          );
        }

        // Get event details
        const eventsResponse = await fetch(API_URL, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        let allEvents = [];

        if (eventsResponse.ok) {
          const eventsDataResponse = await eventsResponse.json();

          if (eventsDataResponse.success) {
            allEvents = eventsDataResponse.events || [];
          }
        }

        // Match attendance with event details
        const eventMap = new Map(
          allEvents.map((event) => [
            String(event._id),
            event,
          ])
        );

        // IMPORTANT:
        // Only Completed + adminVerified attendance is displayed
        const attendedEvents = (attendanceData.attendance || [])
          .filter(
            (record) =>
              record.attendanceStatus === "Completed" &&
              record.adminVerified === true
          )
          .map((record) => {
            const eventDetails = eventMap.get(
              String(record.eventId)
            );

            return {
              id: record._id,
              eventId: record.eventId,

              title:
                eventDetails?.eventTitle ||
                record.eventTitle ||
                "Volunteering Event",

              category: "Volunteering",

              date: formatDate(
                eventDetails?.date || record.scannedAt
              ),

              location:
                eventDetails?.location || "Not available",

              organizer:
                eventDetails?.organizer ||
                eventDetails?.organization ||
                "Maatram Foundation",

              role: "Volunteer",

              status: "Completed",

              description:
                eventDetails?.eventDescription ||
                eventDetails?.volunteerWork ||
                "Volunteering event successfully completed.",

              team: "—",

              certificate: "Not specified",

              duration: formatDuration(
                record.durationSeconds
              ),

              image:
                eventDetails?.image ||
                "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800",

              scannedAt: record.scannedAt,
              completedAt: record.completedAt,

              volunteerWork:
                eventDetails?.volunteerWork || "Not available",

              instructions:
                eventDetails?.instructions || "Not available",

              zone:
                eventDetails?.zone || "Not available",
            };
          });

        // Remove duplicate events using eventId
        const uniqueEvents = Array.from(
          new Map(
            attendedEvents.map((event) => [
              event.eventId,
              event,
            ])
          ).values()
        );

        setEventsData(uniqueEvents);

      } catch (err) {
        console.error("Student History Error:", err);
        setError(
          err.message || "Something went wrong while loading history."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStudentHistory();
  }, []);

  // Search and filter
  const filteredEvents = eventsData.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(search.toLowerCase()) ||
      event.category.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      activeFilter === "All" ||
      event.category === activeFilter;

    return matchesSearch && matchesFilter;
  });

  const completedCount = eventsData.length;

  const volunteeringCount = eventsData.filter(
    (event) => event.category === "Volunteering"
  ).length;

  return (
    <div className={styles.historyPage}>
      <div className={styles.historyContainer}>

        {/* Header */}
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

          {/* Back to Dashboard - Right Side */}
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

        {/* Search and Filter */}
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
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className={styles.emptyState}>
            <h3>Loading your event history...</h3>
            <p>Please wait while we fetch your attended events.</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className={styles.emptyState}>
            <h3>Unable to Load Event History</h3>
            <p>{error}</p>
          </div>
        )}

        {/* Event Cards */}
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
                  if (e.key === "Enter") {
                    setSelectedEvent(event);
                  }
                }}
              >
                <div className={styles.eventImage}>
                  <img
                    src={event.image}
                    alt={event.title}
                  />

                  <span className={styles.categoryBadge}>
                    {event.category}
                  </span>
                </div>

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

        {/* Empty State */}
        {!loading && !error && filteredEvents.length === 0 && (
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

      {/* Event Details Modal */}
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
            <button
              className={styles.closeButton}
              onClick={() => setSelectedEvent(null)}
              aria-label="Close event details"
            >
              ×
            </button>

            <div className={styles.modalImage}>
              <img
                src={selectedEvent.image}
                alt={selectedEvent.title}
              />

              <span>{selectedEvent.category}</span>
            </div>

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
                  <span>Certificate</span>
                  <strong>{selectedEvent.certificate}</strong>
                </div>

                <div className={styles.detailItem}>
                  <span>Event Status</span>
                  <strong>{selectedEvent.status}</strong>
                </div>

                <div className={styles.detailItem}>
                  <span>Attendance Scanned At</span>
                  <strong>
                    {selectedEvent.scannedAt
                      ? new Date(
                          selectedEvent.scannedAt
                        ).toLocaleString("en-IN")
                      : "Not available"}
                  </strong>
                </div>

                <div className={styles.detailItem}>
                  <span>Admin Verified</span>
                  <strong>Yes</strong>
                </div>
              </div>

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
