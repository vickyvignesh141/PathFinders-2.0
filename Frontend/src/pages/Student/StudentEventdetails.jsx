
import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./StudentEventdetails.module.css";
import { getAllEvents } from "../../services/eventService";

const StudentEventdetails = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [showQR, setShowQR] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState("");

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // FETCH REAL EVENT FROM MONGODB
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);

        const result = await getAllEvents();

        if (result.success) {
          const event = result.events.find(
            (item) => item.eventId === eventId
          );

          if (event) {
            setEventData(event);
          } else {
            setError("Event not found");
          }
        } else {
          setError("Unable to fetch event details");
        }
      } catch (err) {
        console.error("Fetch event error:", err);
        setError("Unable to load event details");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  const handleFeedbackSubmit = () => {
    if (rating > 0) {
      setIsSubmitted(true);
      setTimeout(() => setIsSubmitted(false), 3000);
    } else {
      alert("Please select a rating");
    }
  };

  // CAMERA
  const startCamera = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Camera is not supported");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });

      streamRef.current = stream;
      setCameraOn(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err) {
      console.error("Camera error:", err);
      setCameraOn(false);
      setCameraError(
        "Camera open aagala. Please allow camera permission or check your device."
      );
    }
  };

  const openQRModal = () => {
    setShowQR(true);
    setCameraError("");
  };

  useEffect(() => {
    if (showQR) {
      startCamera();
    }
  }, [showQR]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setCameraOn(false);
  };

  const closeQRModal = () => {
    stopCamera();
    setShowQR(false);
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  if (loading) {
    return <p>Loading event details...</p>;
  }

  if (error || !eventData) {
    return (
      <div className={styles.container}>
        <p>{error || "Event not found"}</p>
        <button onClick={() => navigate("/student/event")}>
          Back to Events
        </button>
      </div>
    );
  }

  // FORMAT DATE
  const formattedDate = eventData.date
    ? new Date(`${eventData.date}T00:00:00`).toLocaleDateString(
        "en-IN",
        {
          day: "numeric",
          month: "long",
          year: "numeric"
        }
      )
    : "Not specified";

  return (
    <div className={styles.container}>

      <button
        className={styles.backBtn}
        onClick={() => navigate("/student/event")}
      >
        ← Back to Events
      </button>

      {/* EVENT BANNER */}
      <div className={styles.bannerWrapper}>
        <div className={styles.bannerOverlay}>
          <span className={styles.category}>
            {eventData.zone}
          </span>

          <h1 className={styles.title}>
            {eventData.eventTitle}
          </h1>
        </div>
      </div>

      {/* EVENT INFORMATION */}
      <div className={styles.infoCards}>

        <div className={styles.infoCard}>
          <div className={styles.infoIcon}>📅</div>
          <div>
            <p className={styles.infoLabel}>Date</p>
            <p className={styles.infoValue}>{formattedDate}</p>
          </div>
        </div>

        <div className={styles.infoCard}>
          <div className={styles.infoIcon}>⏰</div>
          <div>
            <p className={styles.infoLabel}>Time</p>
            <p className={styles.infoValue}>
              {eventData.startTime} - {eventData.endTime}
            </p>
          </div>
        </div>

        <div className={styles.infoCard}>
          <div className={styles.infoIcon}>📍</div>
          <div>
            <p className={styles.infoLabel}>Venue</p>
            <p className={styles.infoValue}>
              {eventData.location}
            </p>
          </div>
        </div>

        <div className={styles.infoCard}>
          <div className={styles.infoIcon}>👥</div>
          <div>
            <p className={styles.infoLabel}>Volunteers Needed</p>
            <p className={styles.infoValue}>
              {eventData.volunteersNeeded}
            </p>
          </div>
        </div>

      </div>

      <main className={styles.mainContent}>

        {/* ABOUT EVENT */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            About This Event
          </h2>

          <p className={styles.description}>
            {eventData.eventDescription}
          </p>
        </section>

        {/* VOLUNTEER WORK */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            Volunteer Work
          </h2>

          <p className={styles.description}>
            {eventData.volunteerWork}
          </p>
        </section>

        {/* INSTRUCTIONS */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            Event Instructions
          </h2>

          <p className={styles.description}>
            {eventData.instructions}
          </p>
        </section>

        {/* EVENT INFORMATION */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            Event Information
          </h2>

          <p className={styles.infoValue}>
            Event ID: {eventData.eventId}
          </p>

          <p className={styles.infoValue}>
            Zone: {eventData.zone}
          </p>

          <p className={styles.infoValue}>
            Volunteers Needed: {eventData.volunteersNeeded}
          </p>

          <p className={styles.infoValue}>
            Status: {eventData.status}
          </p>
        </section>

        {/* REGISTRATION / QR */}
        <div className={styles.stickyCard}>

          <button
            className={styles.btnQR}
            onClick={openQRModal}
          >
            📱 Scan QR Code
          </button>

          {/* FEEDBACK */}
          <div className={styles.feedbackBox}>
            <h3 className={styles.organizerTitle}>
              Event Feedback
            </h3>

            <p className={styles.feedbackSubtitle}>
              How was your experience?
            </p>

            <div className={styles.stars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  className={`${styles.star} ${
                    rating >= star ? styles.starActive : ""
                  }`}
                  onClick={() => setRating(star)}
                >
                  ★
                </button>
              ))}
            </div>

            <div className={styles.feedbackForm}>
              <textarea
                className={styles.feedbackTextarea}
                placeholder="Leave a comment..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />

              {isSubmitted ? (
                <div className={styles.successMsg}>
                  Thank you for your feedback!
                </div>
              ) : (
                <button
                  className={styles.btnSubmitFeedback}
                  style={{ width: "100%", padding: "10px" }}
                  onClick={handleFeedbackSubmit}
                >
                  Submit Feedback
                </button>
              )}
            </div>
          </div>

        </div>
      </main>

      {/* QR CAMERA MODAL */}
      {showQR && (
        <div
          className={styles.modalOverlay}
          onClick={closeQRModal}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={styles.modalClose}
              onClick={closeQRModal}
            >
              ✕
            </button>

            <h2 className={styles.modalTitle}>
              Scan to Register
            </h2>

            <p className={styles.modalSubtitle}>
              Point your camera at the QR code
            </p>

            <div className={styles.qrWrapper}>
              {cameraError ? (
                <div style={{ padding: "16px", color: "#c00" }}>
                  {cameraError}
                </div>
              ) : (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    width: "100%",
                    maxWidth: "320px",
                    borderRadius: "12px",
                    background: "#000"
                  }}
                />
              )}
            </div>

            {cameraOn && (
              <p>
                Camera ready. QR scanning is not connected yet.
              </p>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default StudentEventdetails;
