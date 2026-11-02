
import React, { useState } from "react";
import styles from "./StudentHistory.module.css";

const eventsData = [
  {
    id: 1,
    title: "National Level Hackathon 2026",
    category: "Technical",
    date: "15 March 2026",
    location: "Chennai",
    organizer: "Department of Computer Science",
    role: "Participant",
    status: "Selected",
    description:
      "A national level hackathon where students develop innovative solutions for real-world problems using technology.",
    team: "Code Warriors",
    certificate: "Yes",
    duration: "24 Hours",
    image:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800",
  },
  {
    id: 2,
    title: "Smart India Hackathon",
    category: "Technical",
    date: "20 February 2026",
    location: "Coimbatore",
    organizer: "AICTE",
    role: "Team Leader",
    status: "Completed",
    description:
      "A nationwide initiative to provide students with a platform to solve pressing problems faced by government departments and industries.",
    team: "Tech Titans",
    certificate: "Yes",
    duration: "36 Hours",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800",
  },
  {
    id: 3,
    title: "Community Awareness Program",
    category: "Volunteering",
    date: "10 January 2026",
    location: "Chennai",
    organizer: "Maatram Foundation",
    role: "Volunteer",
    status: "Completed",
    description:
      "Participated in a community awareness program focused on education, social responsibility and creating positive changes in society.",
    team: "Social Impact Team",
    certificate: "Yes",
    duration: "5 Hours",
    image:
      "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800",
  },
  {
    id: 4,
    title: "Web Development Workshop",
    category: "Workshop",
    date: "05 December 2025",
    location: "College Campus",
    organizer: "IT Department",
    role: "Participant",
    status: "Completed",
    description:
      "A hands-on workshop covering React, modern frontend development and practical web application building.",
    team: "Individual",
    certificate: "Yes",
    duration: "6 Hours",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800",
  },
  {
    id: 5,
    title: "Inter College Coding Contest",
    category: "Competition",
    date: "18 November 2025",
    location: "Madurai",
    organizer: "Coding Club",
    role: "Participant",
    status: "Completed",
    description:
      "An inter-college coding competition designed to test programming knowledge, logical thinking and problem-solving skills.",
    team: "Individual",
    certificate: "No",
    duration: "3 Hours",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800",
  },
  {
    id: 6,
    title: "Green Campus Initiative",
    category: "Volunteering",
    date: "12 October 2025",
    location: "College Campus",
    organizer: "Eco Club",
    role: "Volunteer",
    status: "Completed",
    description:
      "Participated in a campus cleanliness and tree plantation initiative to promote environmental awareness.",
    team: "Green Team",
    certificate: "Yes",
    duration: "4 Hours",
    image:
      "https://images.unsplash.com/photo-1472396961693-142e6e269027?w=800",
  },
];

const  StudentHistory = () => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const filters = ["All", "Technical", "Volunteering", "Workshop", "Competition"];

  const filteredEvents = eventsData.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(search.toLowerCase()) ||
      event.category.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      activeFilter === "All" || event.category === activeFilter;

    return matchesSearch && matchesFilter;
  });

  const completedCount = eventsData.filter(
    (event) => event.status === "Completed"
  ).length;

  const volunteeringCount = eventsData.filter(
    (event) => event.category === "Volunteering"
  ).length;

  return (
    <div className={styles.historyPage}>
      <div className={styles.historyContainer}>

        {/* Header */}
        <div className={styles.pageHeader}>
          <div>
            <span className={styles.eyebrow}>STUDENT ACTIVITIES</span>
            <h1>My Event History<span>.</span></h1>
            <p>
              Explore all the events, competitions and volunteering
              activities you have participated in.
            </p>
          </div>

          <div className={styles.headerIcon}>✦</div>
        </div>

        {/* Statistics */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>▣</div>
            <div>
              <h2>{eventsData.length}</h2>
              <p>Total Events</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>✓</div>
            <div>
              <h2>{completedCount}</h2>
              <p>Completed Events</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>♧</div>
            <div>
              <h2>{volunteeringCount}</h2>
              <p>Volunteering Events</p>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className={styles.filterSection}>
          <div className={styles.sectionTitle}>
            <h2>Participation History</h2>
            <span>{filteredEvents.length} Events</span>
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

            <div className={styles.filterButtons}>
              {filters.map((filter) => (
                <button
                  key={filter}
                  className={
                    activeFilter === filter
                      ? styles.activeFilter
                      : styles.filterButton
                  }
                  onClick={() => setActiveFilter(filter)}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Event Cards */}
        <div className={styles.eventGrid}>
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              className={styles.eventCard}
              onClick={() => setSelectedEvent(event)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter") setSelectedEvent(event);
              }}
            >
              <div className={styles.eventImage}>
                <img src={event.image} alt={event.title} />

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
                  <span
                    className={
                      event.status === "Selected"
                        ? styles.selectedStatus
                        : styles.completedStatus
                    }
                  >
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

        {/* Empty State */}
        {filteredEvents.length === 0 && (
          <div className={styles.emptyState}>
            <div>⌕</div>
            <h3>No events found</h3>
            <p>Try searching with another event name or category.</p>
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

              <h2 id="event-modal-title">{selectedEvent.title}</h2>

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
                  <span>Team Name</span>
                  <strong>{selectedEvent.team}</strong>
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
