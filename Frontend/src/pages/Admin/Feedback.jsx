
import React, { useState, useEffect } from "react";
import styles from "./Feedback.module.css";

const API_URL = "http://localhost:5000/api/feedback/admin/all";

const Feedback = () => {
  const [feedbackData, setFeedbackData] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedRating, setSelectedRating] = useState("All");
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch feedback from backend
  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        const response = await fetch(API_URL, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Unable to fetch feedback"
          );
        }

        const records = result.feedback || result.data || [];

        const formattedFeedback = records.map((item) => {
          const ratings = item.ratings || {};
          const answers = item.answers || {};

          const submittedDate = item.submittedAt
            ? new Date(item.submittedAt).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "Date unavailable";

          return {
            id: item.id || item._id || item.feedbackId,
            studentName: item.studentName || "Student",
            studentId: item.studentUsername || item.studentId || "N/A",
            eventName: item.eventName || "Volunteer Event",
            date: submittedDate,

            overall: Number(ratings["Overall Experience"] || 0),
            eventManagement: Number(ratings["Event Management"] || 0),
            volunteerCoordination: Number(
              ratings["Volunteer Coordination"] || 0
            ),

            food: answers[
              "How was the food and refreshment arrangement?"
            ] || "Not answered",

            venue: answers[
              "How was the venue and facilities?"
            ] || "Not answered",

            organization: answers[
              "Was the event well organized?"
            ] || "Not answered",

            coordination: answers[
              "Were your responsibilities and guidance clear?"
            ] || "Not answered",

            comment: item.overallExperience || "No comments provided",
            likedMost: item.likedMost || "Not answered",
            learning: item.learning || "Not answered",
          };
        });

        setFeedbackData(formattedFeedback);
      } catch (err) {
        console.error("Feedback fetch error:", err);
        setError(err.message || "Unable to load feedback.");
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, []);

  // Summary calculations
  const averageRating =
    feedbackData.length > 0
      ? feedbackData.reduce((sum, item) => sum + item.overall, 0) /
        feedbackData.length
      : 0;

  const fiveStarCount = feedbackData.filter(
    (item) => item.overall === 5
  ).length;

  const eventsReviewed = new Set(
    feedbackData.map((item) => item.eventName)
  ).size;

  // Search and rating filter
  const filteredFeedback = feedbackData.filter((item) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      item.studentName.toLowerCase().includes(searchText) ||
      item.studentId.toLowerCase().includes(searchText) ||
      item.eventName.toLowerCase().includes(searchText);

    const matchesRating =
      selectedRating === "All" ||
      item.overall === Number(selectedRating);

    return matchesSearch && matchesRating;
  });

  // Display stars
  const renderStars = (rating) => {
    const validRating = Math.max(0, Math.min(5, Number(rating) || 0));

    return (
      <span className={styles.stars}>
        {"★".repeat(validRating)}
        <span className={styles.emptyStars}>
          {"★".repeat(5 - validRating)}
        </span>
      </span>
    );
  };

  return (
    <div className={styles.page}>
      {/* HEADER */}
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>ADMIN PANEL</p>
          <h1>Student Feedback</h1>
          <p className={styles.subtitle}>
            View and manage feedback submitted by volunteers.
          </p>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>💬</div>
          <p>Total Feedback</p>
          <h2>{feedbackData.length}</h2>
          <span>Student responses</span>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>⭐</div>
          <p>Average Rating</p>
          <h2>{averageRating.toFixed(1)} / 5</h2>
          <span>Overall experience</span>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>🌟</div>
          <p>5-Star Feedback</p>
          <h2>{fiveStarCount}</h2>
          <span>Excellent experiences</span>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>📅</div>
          <p>Events Reviewed</p>
          <h2>{eventsReviewed}</h2>
          <span>Events with feedback</span>
        </div>
      </div>

      {/* FEEDBACK LIST */}
      <div className={styles.feedbackSection}>
        <div className={styles.sectionHeader}>
          <div>
            <h2>All Feedback</h2>
            <p>Student reviews and event experiences</p>
          </div>

          <span className={styles.countBadge}>
            {filteredFeedback.length} Responses
          </span>
        </div>

        {/* SEARCH AND FILTER */}
        <div className={styles.filters}>
          <input
            type="text"
            placeholder="Search student or event..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={selectedRating}
            onChange={(e) => setSelectedRating(e.target.value)}
          >
            <option value="All">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>

        {/* LOADING */}
        {loading && (
          <div className={styles.noFeedback}>
            Loading student feedback...
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div className={styles.noFeedback}>
            {error}
          </div>
        )}

        {/* FEEDBACK CARDS */}
        {!loading && !error && (
          <div className={styles.feedbackList}>
            {filteredFeedback.length > 0 ? (
              filteredFeedback.map((item) => (
                <div className={styles.feedbackCard} key={item.id}>
                  <div className={styles.cardTop}>
                    <div className={styles.studentInfo}>
                      <div className={styles.avatar}>
                        {item.studentName.charAt(0).toUpperCase()}
                      </div>

                      <div>
                        <h3>{item.studentName}</h3>
                        <p>{item.studentId}</p>
                      </div>
                    </div>

                    <div className={styles.rating}>
                      {renderStars(item.overall)}
                      <span>{item.overall}.0</span>
                    </div>
                  </div>

                  <div className={styles.eventInfo}>
                    <span>📌 {item.eventName}</span>
                    <span>📅 {item.date}</span>
                  </div>

                  <p className={styles.comment}>
                    "{item.comment}"
                  </p>

                  <div className={styles.cardBottom}>
                    <span className={styles.ratingLabel}>
                      Overall Experience: {item.overall}/5
                    </span>

                    <button
                      onClick={() => setSelectedFeedback(item)}
                    >
                      View Details →
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.noFeedback}>
                No feedback found.
              </div>
            )}
          </div>
        )}
      </div>

      {/* FEEDBACK DETAILS MODAL */}
      {selectedFeedback && (
        <div
          className={styles.modalOverlay}
          onClick={() => setSelectedFeedback(null)}
        >
          <div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={styles.closeBtn}
              onClick={() => setSelectedFeedback(null)}
            >
              ✕
            </button>

            <h2>Feedback Details</h2>
            <p className={styles.modalSubtitle}>
              Student event experience
            </p>

            {/* STUDENT DETAILS */}
            <div className={styles.modalStudent}>
              <div className={styles.avatar}>
                {selectedFeedback.studentName.charAt(0).toUpperCase()}
              </div>

              <div>
                <h3>{selectedFeedback.studentName}</h3>
                <p>{selectedFeedback.studentId}</p>
              </div>
            </div>

            {/* EVENT DETAILS */}
            <div className={styles.modalEvent}>
              <p>
                <strong>Event:</strong> {selectedFeedback.eventName}
              </p>
              <p>
                <strong>Submitted Date:</strong> {selectedFeedback.date}
              </p>
            </div>

            {/* STAR RATINGS */}
            <div className={styles.ratingDetails}>
              <div>
                <span>Overall Experience</span>
                {renderStars(selectedFeedback.overall)}
              </div>

              <div>
                <span>Event Management</span>
                {renderStars(selectedFeedback.eventManagement)}
              </div>

              <div>
                <span>Volunteer Coordination</span>
                {renderStars(selectedFeedback.volunteerCoordination)}
              </div>
            </div>

            {/* STUDENT ANSWERS */}
            <div className={styles.modalComment}>
              <h3>Food & Refreshments</h3>
              <p>{selectedFeedback.food}</p>
            </div>

            <div className={styles.modalComment}>
              <h3>Venue & Facilities</h3>
              <p>{selectedFeedback.venue}</p>
            </div>

            <div className={styles.modalComment}>
              <h3>Event Management</h3>
              <p>{selectedFeedback.organization}</p>
            </div>

            <div className={styles.modalComment}>
              <h3>Volunteer Coordination</h3>
              <p>{selectedFeedback.coordination}</p>
            </div>

            <div className={styles.modalComment}>
              <h3>Overall Experience & Comments</h3>
              <p>{selectedFeedback.comment}</p>
            </div>

            <div className={styles.modalComment}>
              <h3>What did you like most?</h3>
              <p>{selectedFeedback.likedMost}</p>
            </div>

            <div className={styles.modalComment}>
              <h3>What did you learn?</h3>
              <p>{selectedFeedback.learning}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Feedback;
