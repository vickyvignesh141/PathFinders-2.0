
import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./StudentEventdetails.module.css";
import { getAllEvents, verifyEventQR, getMyAttendanceTimers, } from "../../services/eventService";
import { Html5Qrcode } from "html5-qrcode";

// Convert backend UTC timestamp correctly
const normalizeUtcTime = (time) => {
  if (!time) return null;

  // If timezone is already specified, keep it.
  if (/[zZ]|[+-]\d{2}:\d{2}$/.test(time)) {
    return time;
  }

  // MongoDB naive datetime is treated as UTC.
  return `${time}Z`;
};

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

  // TIMER STATES
  // TIMER AND ATTENDANCE STATES
  const [checkInTime, setCheckInTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState("00:00:00");
  const [attendanceRecord, setAttendanceRecord] = useState(null);
  const [timerCompleted, setTimerCompleted] = useState(false);
  const [finalDuration, setFinalDuration] = useState(null);
  const scannerRef = useRef(null);
  const scanProcessingRef = useRef(false);

  // =====================================
  // FETCH EVENT DETAILS
  // =====================================

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




  // =====================================
  // FETCH STUDENT ATTENDANCE FROM BACKEND
  // =====================================

  const fetchMyAttendance = async () => {
    try {
      if (!eventData?._id) return;

      const result = await getMyAttendanceTimers();

      if (!result.success || !Array.isArray(result.attendance)) {
        return;
      }

      const myRecord = result.attendance.find(
        (record) => record.eventId === eventData._id
      );

      if (!myRecord) return;

      setAttendanceRecord(myRecord);
      setCheckInTime(normalizeUtcTime(myRecord.scannedAt));

      if (
        myRecord.attendanceStatus === "Completed" ||
        myRecord.adminVerified === true
      ) {
        setTimerCompleted(true);
        setFinalDuration(myRecord.durationSeconds ?? 0);
      } else {
        setTimerCompleted(false);
        setFinalDuration(null);
      }
    } catch (err) {
      console.error("Fetch my attendance error:", err);
    }
  };

  // =====================================
  // INITIAL FETCH + SYNC WITH ADMIN
  // =====================================

  useEffect(() => {
    if (!eventData?._id) return;

    fetchMyAttendance();

    const interval = setInterval(() => {
      fetchMyAttendance();
    }, 5000);

    return () => clearInterval(interval);
  }, [eventData?._id]);

  // =====================================
  // LIVE VOLUNTEERING TIMER
  // =====================================


  // =====================================
  // LIVE VOLUNTEERING TIMER
  // =====================================

  useEffect(() => {
    if (!checkInTime) return;

    const formatTime = (totalSeconds) => {
      const safeSeconds = Math.max(0, Number(totalSeconds) || 0);

      const hours = Math.floor(safeSeconds / 3600);
      const minutes = Math.floor((safeSeconds % 3600) / 60);
      const seconds = safeSeconds % 60;

      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    };

    // If admin has completed the event, show fixed duration
    if (timerCompleted) {
      setElapsedTime(formatTime(finalDuration));
      return;
    }

    const updateTimer = () => {
      const startTime = new Date(checkInTime).getTime();

      if (Number.isNaN(startTime)) return;

      const elapsedSeconds = Math.max(
        0,
        Math.floor((Date.now() - startTime) / 1000)
      );

      setElapsedTime(formatTime(elapsedSeconds));
    };

    updateTimer();

    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [checkInTime, timerCompleted, finalDuration]);


  // =====================================
  // FEEDBACK
  // =====================================

  const handleFeedbackSubmit = () => {
    if (rating > 0) {
      setIsSubmitted(true);
      setTimeout(() => setIsSubmitted(false), 3000);
    } else {
      alert("Please select a rating");
    }
  };

  // =====================================
  // QR CAMERA
  // =====================================

  const startCamera = async () => {
    try {
      setCameraError("");

      if (scannerRef.current) return;

      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        async (decodedText) => {
          if (scanProcessingRef.current) return;

          scanProcessingRef.current = true;

          console.log("Scanned QR:", decodedText);

          await stopCamera();
          setShowQR(false);

          try {
            if (!eventData?._id) {
              throw new Error("MongoDB event ID is missing.");
            }

            const result = await verifyEventQR(
              eventData._id,
              decodedText
            );

            if (result.success && result.scannedAt) {
              // Reset timer for this event
              setElapsedTime("00:00:00");

              setCheckInTime(normalizeUtcTime(result.scannedAt));
              setTimerCompleted(false);
              setFinalDuration(null);

              await fetchMyAttendance();

              alert(result.message || "Attendance check-in successful.");
            } else {
              alert(result.message || "Attendance verification failed.");
            }
          } catch (err) {
            console.error("Attendance verification error:", err);

            const message =
              err.response?.data?.message ||
              err.message ||
              "Attendance verification failed.";

            alert(message);
          } finally {
            scanProcessingRef.current = false;
          }
        },
        () => { }
      );

      setCameraOn(true);
    } catch (err) {
      console.error("QR scanner error:", err);

      scannerRef.current = null;
      setCameraOn(false);

      setCameraError(
        "Unable to start scanner. Please allow camera permission."
      );
    }
  };

  const stopCamera = async () => {
    const scanner = scannerRef.current;

    if (!scanner) return;

    scannerRef.current = null;

    try {
      if (scanner.isScanning) {
        await scanner.stop();
      }

      await scanner.clear();
    } catch (error) {
      console.error("Scanner stop error:", error);
    }

    setCameraOn(false);
  };

  const openQRModal = () => {
    setShowQR(true);
    setCameraError("");
  };

  const closeQRModal = () => {
    setShowQR(false);
  };

  // =====================================
  // QR SCANNER EFFECT
  // =====================================

  useEffect(() => {
    if (!showQR) return;

    let cancelled = false;

    const initializeScanner = async () => {
      await new Promise((resolve) =>
        requestAnimationFrame(resolve)
      );

      if (!cancelled) {
        await startCamera();
      }
    };

    initializeScanner();

    return () => {
      cancelled = true;
      stopCamera();
    };
  }, [showQR]);

  // =====================================
  // CLEANUP CAMERA ON UNMOUNT
  // =====================================

  useEffect(() => {
    return () => {
      const scanner = scannerRef.current;

      if (scanner) {
        scannerRef.current = null;

        if (scanner.isScanning) {
          scanner.stop()
            .then(() => scanner.clear())
            .catch((err) => console.error("Camera cleanup error:", err));
        } else {
          scanner.clear().catch((err) =>
            console.error("Camera cleanup error:", err)
          );
        }
      }
    };
  }, []);

  // =====================================
  // LOADING / ERROR
  // =====================================

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

  // =====================================
  // FORMAT DATE
  // =====================================

  const formattedDate = eventData.date
    ? new Date(`${eventData.date}T00:00:00`).toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    )
    : "Not specified";

  // =====================================
  // MAIN UI
  // =====================================

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

        {/* LIVE TIMER CARD */}


        {/* LIVE TIMER CARD */}

        <div className={styles.infoCard}>
          <div className={styles.infoIcon}>⏱️</div>

          <div>
            <p className={styles.infoLabel}>
              Your Volunteering Time
            </p>

            <p className={styles.infoValue}>
              {attendanceRecord
                ? elapsedTime
                : "Not Started"}
            </p>

            <small>
              {!attendanceRecord
                ? "Scan event QR to start"
                : timerCompleted
                  ? "Event Completed & Verified"
                  : "Attendance Running"}
            </small>
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
            disabled={!!attendanceRecord}          >
            {attendanceRecord
              ? "✓ Attendance Checked In"
              : "📱 Scan QR Code"}
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
                  className={`${styles.star} ${rating >= star ? styles.starActive : ""
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
                <div
                  id="qr-reader"
                  style={{
                    width: "100%",
                    maxWidth: "320px",
                    margin: "auto",
                  }}
                />
              )}
            </div>

            {cameraOn && (
              <p>
                Camera ready. Scan the QR code displayed by the event admin.
              </p>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default StudentEventdetails;
