import { QRCodeSVG } from "qrcode.react";
import {
  getAllEvents,
  getEventRegistrations,
  updateRegistrationStatus,
  generateEventQR,
  getEventAttendance,
  completeAllStudentAttendance,
  confirmEventSelection,
  closeEventAttendance,
  generateRAGRecommendations,
} from "../../services/eventService";
import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  UserPlus,
  CheckCircle2,
  CheckCircle,
  QrCode,
  X,
  Sparkles,
  LoaderCircle
} from "lucide-react";

import { useLocation, useNavigate, useParams } from "react-router-dom";



import styles from "./EventManage.module.css";

// -----------------------------
// DATE HELPERS
// -----------------------------

const formatDate = (date) => {
  if (!date) return "Date not available";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (time, fallbackDate) => {
  if (time) {
    // Database time format: "09:00"
    const [hours, minutes] = time.split(":");
    const date = new Date();
    date.setHours(Number(hours), Number(minutes), 0, 0);

    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (!fallbackDate) return "Time not available";

  return new Date(fallbackDate).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};
const normalizeUtcTime = (time) => {
  if (!time) return null;

  // Keep timestamps that already contain a timezone
  if (/[zZ]|[+-]\d{2}:\d{2}$/.test(time)) {
    return time;
  }

  // MongoDB naive timestamps are treated as UTC
  return `${time}Z`;
};

const formatCheckInTime = (time) => {
  if (!time) return "N/A";

  return new Date(normalizeUtcTime(time)).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
};


const formatDuration = (seconds) => {
  if (seconds === null || seconds === undefined) return "N/A";

  const totalSeconds = Math.max(0, Number(seconds));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const remainingSeconds = totalSeconds % 60;

  return `${hours}h ${minutes}m ${remainingSeconds}s`;
};

const getEventDate = (event) => {
  return event?.startAt || event?.date || null;
};

// -----------------------------
// EVENT MANAGEMENT COMPONENT
// -----------------------------

const EventManage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { eventId } = useParams();

  // Event received from Admin Dashboard
  const stateEvent = location.state?.event;

  // Event details
  const [event, setEvent] = useState(stateEvent || null);
  const [loadingEvent, setLoadingEvent] = useState(!stateEvent);
  const [eventError, setEventError] = useState("");

  // Registered students
  const [registeredMembers, setRegisteredMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [memberError, setMemberError] = useState("");

  // Attendance records
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loadingAttendance, setLoadingAttendance] = useState(true);
  const [attendanceError, setAttendanceError] = useState("");

  const [completingAttendance, setCompletingAttendance] = useState(false);

  // Selected student profile
  const [activeVolunteer, setActiveVolunteer] = useState(null);

  // Status update loading
  const [updatingRegistration, setUpdatingRegistration] = useState(null);

  // AI Recommendation Loading State
  const [generatingSuggestions, setGeneratingSuggestions] = useState(false);

  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [recommendationResult, setRecommendationResult] = useState(null);
  const [recommendationError, setRecommendationError] = useState("");


  // Bulk student selection
  const [selectedRegistrationIds, setSelectedRegistrationIds] = useState([]);
  const [confirmingSelection, setConfirmingSelection] = useState(false);

  // QR modal
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrMessage, setQrMessage] = useState("");
  const [qrData, setQrData] = useState(null);
  const [generatingQR, setGeneratingQR] = useState(false);

  // Use MongoDB ObjectId for API requests
  const currentEventId = event?._id || event?.id;
  // -----------------------------
  // FETCH EVENT DETAILS
  // -----------------------------

  useEffect(() => {
    const fetchEventDetails = async () => {
      if (stateEvent) {
        setEvent(stateEvent);
        setLoadingEvent(false);
        return;
      }

      if (!eventId) {
        setEventError("Event ID is missing.");
        setLoadingEvent(false);
        return;
      }

      try {
        setLoadingEvent(true);
        setEventError("");

        const response = await getAllEvents();

        const events = Array.isArray(response)
          ? response
          : response.events || [];

        const foundEvent = events.find(
          (item) => String(item.eventId) === String(eventId)
        );

        if (!foundEvent) {
          setEventError("Event not found.");
          return;
        }

        setEvent(foundEvent);
      } catch (error) {
        console.error("Error fetching event:", error);

        setEventError(
          error.response?.data?.message ||
          "Unable to load event details."
        );
      } finally {
        setLoadingEvent(false);
      }
    };

    fetchEventDetails();
  }, [eventId, stateEvent]);

  // -----------------------------
  // FETCH EVENT REGISTRATIONS
  // -----------------------------

  // -----------------------------
  // FETCH EVENT ATTENDANCE
  // -----------------------------

  useEffect(() => {
    const fetchAttendance = async () => {
      if (!currentEventId) {
        setLoadingAttendance(false);
        return;
      }

      try {
        setLoadingAttendance(true);
        setAttendanceError("");

        console.log("Fetching attendance for:", currentEventId);

        const response = await getEventAttendance(currentEventId);

        console.log("Attendance API response:", response);

        setAttendanceRecords(response.attendance || []);
      } catch (error) {
        console.error("Attendance fetch error:", error);

        setAttendanceError(
          error.response?.data?.message ||
          "Unable to load attendance records."
        );
      } finally {
        setLoadingAttendance(false);
      }
    };

    fetchAttendance();
  }, [currentEventId]);

  useEffect(() => {
    const fetchRegistrations = async () => {
      if (!currentEventId) {
        setLoadingMembers(false);
        return;
      }

      try {
        setLoadingMembers(true);
        setMemberError("");

        console.log("Fetching registrations for:", currentEventId);

        const response = await getEventRegistrations(currentEventId);

        console.log("Registrations API response:", response);

        const members = Array.isArray(response)
          ? response
          : response.registrations || response.students || [];

        setRegisteredMembers(members);
      } catch (error) {
        console.error("Registration fetch error:", error);

        setMemberError(
          error.response?.data?.message ||
          "Unable to load registered students."
        );
      } finally {
        setLoadingMembers(false);
      }
    };

    fetchRegistrations();
  }, [currentEventId]);

  // -----------------------------
  // APPROVE / REJECT REGISTRATION
  // -----------------------------

  const handleRegistrationStatus = async (
    registrationId,
    status
  ) => {
    try {
      setUpdatingRegistration(registrationId);

      const response = await updateRegistrationStatus(
        registrationId,
        status
      );

      const updatedStatus = response.status || status;

      setRegisteredMembers((previousMembers) =>
        previousMembers.map((member) =>
          member._id === registrationId
            ? { ...member, status: updatedStatus }
            : member
        )
      );

      // Update selected profile also
      setActiveVolunteer((previous) =>
        previous?._id === registrationId
          ? { ...previous, status: updatedStatus }
          : previous
      );

      alert(response.message || `Student ${status.toLowerCase()} successfully.`);
    } catch (error) {
      console.error("Registration status update error:", error);

      alert(
        error.response?.data?.message ||
        "Unable to update registration status."
      );
    } finally {
      setUpdatingRegistration(null);
    }
  };


  // Toggle individual student selection
  const handleStudentSelection = (registrationId) => {
    setSelectedRegistrationIds((previous) =>
      previous.includes(registrationId)
        ? previous.filter((id) => id !== registrationId)
        : [...previous, registrationId]
    );
  };

  // Confirm all selected students
  const handleConfirmSelection = async () => {
    if (!currentEventId) {
      alert("Event ID is missing.");
      return;
    }

    if (selectedRegistrationIds.length === 0) {
      alert("Please select at least one student.");
      return;
    }

    const confirmed = window.confirm(
      `Confirm selection of ${selectedRegistrationIds.length} students and send selection emails?`
    );

    if (!confirmed) return;

    try {
      setConfirmingSelection(true);

      const response = await confirmEventSelection(
        currentEventId,
        selectedRegistrationIds
      );

      if (!response.success) {
        throw new Error(response.message || "Selection failed.");
      }

      alert(
        `Selection completed!\n\n` +
        `Approved: ${response.approvedCount}\n` +
        `Emails sent: ${response.emailsSent}\n` +
        `Emails failed: ${response.emailsFailed}\n` +
        `Emails skipped: ${response.emailsSkipped}`
      );

      setSelectedRegistrationIds([]);

      // Refresh registrations
      const updatedResponse = await getEventRegistrations(currentEventId);

      const members = Array.isArray(updatedResponse)
        ? updatedResponse
        : updatedResponse.registrations || updatedResponse.students || [];

      setRegisteredMembers(members);

    } catch (error) {
      console.error("Bulk selection error:", error);

      alert(
        error.response?.data?.message ||
        error.message ||
        "Unable to confirm selection."
      );
    } finally {
      setConfirmingSelection(false);
    }
  };

  // Generate AI Volunteer Suggestions
  const handleGenerateSuggestions = async () => {
    if (!currentEventId) {
      alert("Event ID is missing.");
      return;
    }

    try {
      setGeneratingSuggestions(true);
      setRecommendationError("");
      setAiRecommendations([]);
      setRecommendationResult(null);

      const response = await generateRAGRecommendations(currentEventId);

      if (!response?.success) {
        throw new Error(
          response?.message || "Unable to generate recommendations."
        );
      }

      setAiRecommendations(response.recommendations || []);
      setRecommendationResult(response);

      console.log("RAG + Groq recommendations:", response);

    } catch (error) {
      console.error("AI Recommendation Error:", error);

      setRecommendationError(
        error.response?.data?.message ||
        error.message ||
        "Unable to generate suggestions. Please try again."
      );

    } finally {
      setGeneratingSuggestions(false);
    }
  };
  // -----------------------------
  // REGISTRATION COUNTS
  // -----------------------------

  const totalRegistered = registeredMembers.length;

  const approvedCount = registeredMembers.filter(
    (member) => member.status === "Approved"
  ).length;

  const rejectedCount = registeredMembers.filter(
    (member) => member.status === "Rejected"
  ).length;

  const pendingCount = registeredMembers.filter(
    (member) =>
      member.status !== "Approved" &&
      member.status !== "Rejected"
  ).length;


  // -----------------------------
  // QR ATTENDANCE
  // -----------------------------

  const generateQR = async () => {
    try {
      setGeneratingQR(true);
      setQrMessage("");

      if (!currentEventId) {
        setQrMessage("Event ID is missing.");
        return;
      }

      const response = await generateEventQR(currentEventId);

      if (!response.success || !response.qrPayload) {
        setQrMessage(response.message || "Unable to generate QR.");
        return;
      }

      setQrData(response.qrPayload);
      setShowQRModal(true);
    } catch (error) {
      console.error("QR generation error:", error);

      setQrMessage(
        error.response?.data?.message ||
        "Unable to generate QR code. Please try again."
      );
    } finally {
      setGeneratingQR(false);
    }
  };

  const handleAttendanceClick = async () => {
    if (event?.eventType === "physical_verification") {
      setQrMessage("Physical Verification does not use QR attendance.");
      return;
    }



    const eventStart =
      event?.date && event?.startTime
        ? new Date(`${event.date}T${event.startTime}:00`)
        : event?.startAt
          ? new Date(event.startAt)
          : null;

    const eventEnd =
      event?.date && event?.endTime
        ? new Date(`${event.date}T${event.endTime}:00`)
        : event?.endAt
          ? new Date(event.endAt)
          : null;

    if (
      !eventStart ||
      !eventEnd ||
      Number.isNaN(eventStart.getTime()) ||
      Number.isNaN(eventEnd.getTime())
    ) {
      setQrMessage("Event date or time is not available.");
      return;
    }
    console.log("Event start:", eventStart);
    console.log("Event end:", eventEnd);
    console.log("Current time:", new Date());
    console.log("Event date:", event.date);
    console.log("Start time:", event.startTime);
    console.log("End time:", event.endTime);
    const now = Date.now();
    const qrStartTime = eventStart.getTime() - 30 * 60 * 1000;

    if (now < qrStartTime) {
      const minutesRemaining = Math.ceil(
        (qrStartTime - now) / 60000
      );

      setQrMessage(
        `Attendance QR will activate in ${minutesRemaining} minutes.`
      );
      return;
    }

    if (now > eventEnd.getTime()) {
      setQrMessage("This event has already ended.");
      return;
    }

    await generateQR();
  };



  const handleCompleteAllAttendance = async () => {
    if (!currentEventId) {
      alert("Event ID is missing.");
      return;
    }

    const pendingCount = attendanceRecords.filter(
      (record) => record.attendanceStatus === "Checked In"
    ).length;

    if (pendingCount === 0) {
      alert("No pending student attendance to complete.");
      return;
    }

    const confirmed = window.confirm(
      `Complete attendance for all ${pendingCount} checked-in students?`
    );

    if (!confirmed) return;

    try {
      setCompletingAttendance(true);

      const response = await completeAllStudentAttendance(
        currentEventId
      );

      if (!response.success) {
        throw new Error(response.message || "Unable to complete attendance.");
      }

      // Refresh the complete attendance list from backend
      const attendanceResponse = await getEventAttendance(currentEventId);

      setAttendanceRecords(attendanceResponse.attendance || []);

      alert(response.message);
    } catch (error) {
      console.error("Complete all attendance error:", error);

      alert(
        error.response?.data?.message ||
        error.message ||
        "Unable to complete attendance."
      );
    } finally {
      setCompletingAttendance(false);
    }
  };

  const handleCloseAttendance = async () => {
    if (!currentEventId) {
      alert("Event ID is missing.");
      return;
    }

    const eligibleCount = attendanceRecords.filter(
      (record) =>
        record.attendanceStatus === "Completed" &&
        record.adminVerified === true
    ).length;

    if (eligibleCount === 0) {
      alert("No completed and verified student attendance found.");
      return;
    }

    const confirmed = window.confirm(
      `Close attendance and send thank-you emails to ${eligibleCount} students?`
    );

    if (!confirmed) return;

    try {
      setCompletingAttendance(true);

      const response = await closeEventAttendance(currentEventId);

      alert(
        `Attendance closing process completed!\n\n` +
        `Emails sent: ${response.emailsSent}\n` +
        `Emails failed: ${response.emailsFailed}\n` +
        `Emails skipped: ${response.emailsSkipped}`
      );

      const attendanceResponse = await getEventAttendance(currentEventId);

      setAttendanceRecords(attendanceResponse.attendance || []);

    } catch (error) {
      console.error("Close attendance error:", error);

      alert(
        error.response?.data?.message ||
        error.message ||
        "Unable to close attendance."
      );
    } finally {
      setCompletingAttendance(false);
    }
  };










  // -----------------------------
  // STUDENT ROW
  // -----------------------------

  const renderVolunteer = (volunteer) => {
    const isUpdating =
      updatingRegistration === volunteer._id;

    return (
      <div
        key={volunteer._id}
        className={styles.candidateRow}
        onClick={() => setActiveVolunteer(volunteer)}
      >

        <input
          type="checkbox"
          checked={selectedRegistrationIds.includes(volunteer._id)}
          disabled={
            volunteer.status === "Approved" ||
            volunteer.status === "Rejected"
          }
          onChange={() => handleStudentSelection(volunteer._id)}
          onClick={(e) => e.stopPropagation()}
          className={styles.studentCheckbox}
        />
        <div className={styles.candidateInfo}>
          <div className={styles.candidateName}>
            {volunteer.studentName || "Unknown Student"}
          </div>

          <div className={styles.candidateMeta}>
            Username: {volunteer.studentUsername || "N/A"}
          </div>

          <div className={styles.candidateMeta}>
            Email: {volunteer.email || "N/A"}
          </div>

          <div className={styles.candidateMeta}>
            Phone: {volunteer.phone || "N/A"}
          </div>

          <div className={styles.candidateMeta}>
            Status: <strong>{volunteer.status || "Registered"}</strong>
          </div>

          <div className={styles.registrationActions}>
            {volunteer.status !== "Approved" &&
              volunteer.status !== "Rejected" && (
                <>
                  <button
                    type="button"
                    className={styles.approveButton}
                    disabled={isUpdating}
                    onClick={(e) => {
                      e.stopPropagation();

                      handleRegistrationStatus(
                        volunteer._id,
                        "Approved"
                      );
                    }}
                  >
                    {isUpdating ? "Updating..." : "Approve"}
                  </button>

                  <button
                    type="button"
                    className={styles.rejectButton}
                    disabled={isUpdating}
                    onClick={(e) => {
                      e.stopPropagation();

                      handleRegistrationStatus(
                        volunteer._id,
                        "Rejected"
                      );
                    }}
                  >
                    {isUpdating ? "Updating..." : "Reject"}
                  </button>
                </>
              )}

            {volunteer.status === "Approved" && (
              <span className={styles.approvedStatus}>
                Approved
              </span>
            )}

            {volunteer.status === "Rejected" && (
              <span className={styles.rejectedStatus}>
                Rejected
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  // -----------------------------
  // LOADING / ERROR
  // -----------------------------

  if (loadingEvent) {
    return (
      <div className={styles.dashboard}>
        <main className={styles.main}>
          <p>Loading event details...</p>
        </main>
      </div>
    );
  }

  if (eventError || !event) {
    return (
      <div className={styles.dashboard}>
        <main className={styles.main}>
          <button
            className={styles.backButton}
            onClick={() => navigate("/admin/dashboard")}
          >
            <ArrowLeft size={17} />
            Back to Dashboard
          </button>

          <p>{eventError || "Event not found."}</p>
        </main>
      </div>
    );
  }

  // -----------------------------
  // MAIN RENDER
  // -----------------------------

  return (
    <div className={styles.dashboard}>
      <main className={styles.main}>

        {/* TOP NAVIGATION */}

        <div className={styles.topNavigation}>
          <button
            className={styles.backButton}
            onClick={() => navigate("/admin/dashboard")}
          >
            <ArrowLeft size={17} />
            Back to Dashboard
          </button>

          <span className={styles.eventIdBadge}>
            Event ID: {event.eventId}
          </span>
        </div>

        {/* EVENT HEADER */}

        <div className={styles.welcome}>
          <div className={styles.welcomeContent}>
            <div className={styles.managementLabel}>
              EVENT MANAGEMENT
            </div>

            <h1 className={styles.welcomeTitle}>
              {event.eventTitle || event.title || "Event"}
            </h1>

            <div className={styles.eventInfoLine}>
              <span>
                <MapPin size={15} />
                {event.location || event.venue || "Location not available"}
              </span>

              <span>
                <Calendar size={15} />
                {formatDate(getEventDate(event))}
              </span>

              <span>
                <Clock size={15} />
                {formatTime(event.startTime, event.startAt)} –{" "}
                {formatTime(event.endTime, event.endAt)}
              </span>

              {event.zone && (
                <span>
                  <MapPin size={15} />
                  {event.zone}
                </span>
              )}
            </div>

            <p className={styles.welcomeDescription}>
              {event.eventDescription ||
                event.description ||
                "No event description available."}
            </p>
          </div>

          {/* QR BUTTON */}

          <button
            className={styles.qrActionCard}
            onClick={handleAttendanceClick}
            disabled={generatingQR || event.eventType === "physical_verification"}
          >
            <div className={styles.qrIconBox}>
              <QrCode size={30} />
            </div>

            <div className={styles.qrActionContent}>
              <strong> {generatingQR ? "Generating QR..." : "Generate Attendance QR"}</strong>
              <span>Open QR for volunteer attendance</span>
            </div>
          </button>
        </div>

        {qrMessage && (
          <div className={styles.qrMessage}>
            <Clock size={15} />
            {qrMessage}
          </div>
        )}

        {/* AI RECOMMENDATION BUTTON */}


        {/* ============================= */}
        {/* AI VOLUNTEER RECOMMENDATIONS */}
        {/* ============================= */}

        <div className={styles.aiRecommendationBar}>

          <div className={styles.aiRecommendationInfo}>
            <Sparkles size={22} />

            <div>
              <h3>AI Volunteer Recommendations</h3>

              <p>
                Find suitable volunteers using AI, RAG and volunteering history.
              </p>
            </div>
          </div>

          <button
            type="button"
            className={styles.generateSuggestionButton}
            onClick={handleGenerateSuggestions}
            disabled={generatingSuggestions}
          >
            {generatingSuggestions ? (
              <>
                <LoaderCircle
                  className={styles.loadingSpinner}
                  size={18}
                />
                Generating Suggestions...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Generate AI Suggestions
              </>
            )}
          </button>

        </div>

        {/* ============================= */}
        {/* RECOMMENDATION ERROR */}
        {/* ============================= */}

        {recommendationError && (
          <p className={styles.recommendationError}>
            {recommendationError}
          </p>
        )}

        {/* ============================= */}
        {/* RECOMMENDATION RESULTS */}
        {/* ============================= */}

        {aiRecommendations.length > 0 && (
          <div className={styles.recommendationList}>

            <div className={styles.panelHeader}>
              <div>
                <h3 className={styles.sectionTitle}>
                  <Sparkles size={18} />
                  AI Recommended Volunteers
                </h3>

                <p className={styles.panelSubtitle}>
                  Volunteers selected using RAG analysis and volunteering history.
                </p>
              </div>

              <span className={styles.selectedBadge}>
                {aiRecommendations.length} Recommended
              </span>
            </div>

            {aiRecommendations.map((student, index) => (
              <div
                key={student.registrationId || index}
                className={styles.recommendationCard}
              >

                <div className={styles.candidateInfo}>

                  <h4>
                    #{student.finalRank || index + 1} - {student.name || "Unknown Student"}
                  </h4>

                  <p>
                    Username: {student.username || "N/A"}
                  </p>

                  <p>
                    Category: {student.category || "N/A"}
                  </p>

                  <p>
                    Previous Participation: {student.participationCount ?? 0}
                  </p>

                  <p>
                    Distance: {student.distanceKm ?? "N/A"} km
                  </p>

                  <p>
                    RAG Distance: {student.ragDistance ?? "N/A"}
                  </p>

                </div>

                <div>
                  <p>
                    <strong>Selection Reason</strong>
                  </p>

                  <p>
                    {student.selectionReason || "No selection reason available."}
                  </p>
                </div>

                <div>
                  <p>
                    <strong>
                      <Sparkles size={15} />
                      Groq AI Explanation
                    </strong>
                  </p>

                  <p>
                    {student.aiExplanation || "AI explanation unavailable."}
                  </p>
                </div>

              </div>
            ))}

          </div>
        )}

        {/* ============================= */}
        {/* REGISTRATION STATS */}
        {/* ============================= */}




        {/* REGISTRATION STATS */}

        <div className={styles.eventStatsBar}>
          <div className={styles.eventStatCard}>
            <div className={styles.eventStatIcon}>
              <UserPlus size={20} />
            </div>

            <div>
              <strong>{totalRegistered}</strong>
              <span>Registered Students</span>
            </div>
          </div>

          <div className={styles.eventStatCard}>
            <div className={styles.eventStatIcon}>
              <CheckCircle2 size={20} />
            </div>

            <div>
              <strong>{approvedCount}</strong>
              <span>Approved</span>
            </div>
          </div>

          <div className={styles.eventStatCard}>
            <div className={styles.eventStatIcon}>
              <Users size={20} />
            </div>

            <div>
              <strong>{pendingCount}</strong>
              <span>Pending</span>
            </div>
          </div>

          <div className={styles.eventStatCard}>
            <div className={styles.eventStatIcon}>
              <Users size={20} />
            </div>

            <div>
              <strong>{event.volunteersNeeded || 0}</strong>
              <span>Volunteers Needed</span>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}

        <div className={styles.contentGrid}>

          {/* LEFT: REGISTERED STUDENTS */}

          <div className={styles.leftColumn}>
            <div className={styles.volunteerPanel}>
              <div className={styles.panelHeader}>
                <div>
                  <h3 className={styles.sectionTitle}>
                    Registered Students
                  </h3>

                  <p className={styles.panelSubtitle}>
                    Review student registrations and approve or reject them.
                  </p>
                </div>

                <span className={styles.selectedBadge}>
                  {totalRegistered} Registered
                </span>
              </div>

              <div className={styles.candidateList}>
                {loadingMembers ? (
                  <p>Loading registered students...</p>
                ) : memberError ? (
                  <p>{memberError}</p>
                ) : registeredMembers.length > 0 ? (
                  registeredMembers.map((volunteer) =>
                    renderVolunteer(volunteer)
                  )
                ) : (
                  <p>No students have registered for this event yet.</p>
                )}
              </div>

              {/* BULK SELECTION BUTTON */}
              <div className={styles.bulkSelectionBar}>
                <span>
                  {selectedRegistrationIds.length} students selected
                </span>

                <button
                  type="button"
                  className={styles.confirmSelectionButton}
                  onClick={handleConfirmSelection}
                  disabled={
                    confirmingSelection ||
                    selectedRegistrationIds.length === 0
                  }
                >
                  {confirmingSelection
                    ? "Confirming & Sending Emails..."
                    : "Confirm Selection"}
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: STUDENT PROFILE */}

          <div className={styles.rightColumn}>
            <div className={styles.profileCard}>
              <div className={styles.profileCardHeader}>
                <div>
                  <h3 className={styles.sectionTitle}>
                    Student Profile
                  </h3>

                  <p className={styles.panelSubtitle}>
                    Click a registered student to view their details.
                  </p>
                </div>
              </div>

              {activeVolunteer ? (
                <div className={styles.profileContent}>
                  <div className={styles.profileIdentity}>
                    <div className={styles.avatarLg}>
                      {(
                        activeVolunteer.studentName || "S"
                      ).charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <h3>{activeVolunteer.studentName || "Unknown"}</h3>
                      <p>{activeVolunteer.email || "No email"}</p>
                    </div>
                  </div>

                  <div className={styles.profileStats}>
                    <div>
                      <strong>{activeVolunteer.status || "Registered"}</strong>
                      <span>Registration Status</span>
                    </div>
                  </div>

                  <div className={styles.historyHeading}>
                    Student Details
                  </div>

                  <div className={styles.historyList}>
                    <div className={styles.historyItem}>
                      <div>
                        <strong>Username</strong>
                        <span>
                          {activeVolunteer.studentUsername || "N/A"}
                        </span>
                      </div>
                    </div>

                    <div className={styles.historyItem}>
                      <div>
                        <strong>Phone</strong>
                        <span>{activeVolunteer.phone || "N/A"}</span>
                      </div>
                    </div>

                    <div className={styles.historyItem}>
                      <div>
                        <strong>Address</strong>
                        <span>{activeVolunteer.address || "N/A"}</span>
                      </div>
                    </div>

                    <div className={styles.historyItem}>
                      <div>
                        <strong>Residence Type</strong>
                        <span>
                          {activeVolunteer.residenceType || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.historyHeading}>
                    Previous Volunteering Works
                  </div>

                  <div className={styles.historyList}>
                    {activeVolunteer.previousVolunteeringWorks?.length > 0 ? (
                      activeVolunteer.previousVolunteeringWorks.map(
                        (work, index) => (
                          <div
                            key={index}
                            className={styles.historyItem}
                          >
                            <div className={styles.historyDot}>
                              <CheckCircle2 size={14} />
                            </div>

                            <div>
                              <strong>{work}</strong>
                            </div>
                          </div>
                        )
                      )
                    ) : (
                      <p>No previous volunteering details available.</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className={styles.profileEmpty}>
                  <Users size={36} />

                  <h4>No student selected</h4>

                  <p>
                    Select a student from the registered students list
                    to view their details.
                  </p>
                </div>
              )}
            </div>
          </div>


          {/* ATTENDANCE MANAGEMENT */}


          <div className={styles.volunteerPanel}>
            <div className={styles.panelHeader}>
              <div>
                <h3 className={styles.sectionTitle}>
                  Attendance Management
                </h3>
                <p className={styles.panelSubtitle}>
                  Students who checked in using the event QR code.
                </p>
              </div>

              <span className={styles.selectedBadge}>
                {attendanceRecords.length} Students
              </span>
            </div>

            <div className={styles.candidateList}>
              {loadingAttendance ? (
                <p>Loading attendance...</p>
              ) : attendanceError ? (
                <p>{attendanceError}</p>
              ) : attendanceRecords.length > 0 ? (
                <>
                  <div className={styles.attendanceAction}>
                    <button
                      type="button"
                      className={styles.completeEventButton}
                      disabled={
                        completingAttendance ||
                        !attendanceRecords.some(
                          (record) =>
                            record.attendanceStatus === "Checked In"
                        )
                      }
                      onClick={handleCompleteAllAttendance}
                    >
                      <CheckCircle size={16} />
                      {completingAttendance
                        ? "Completing All..."
                        : "Complete Event for All Students"}
                    </button>

                    <button
                      type="button"
                      className={styles.completeEventButton}
                      disabled={
                        completingAttendance ||
                        !attendanceRecords.some(
                          (record) =>
                            record.attendanceStatus === "Completed" &&
                            record.adminVerified === true
                        )
                      }
                      onClick={handleCloseAttendance}
                    >
                      <CheckCircle size={16} />
                      {completingAttendance
                        ? "Processing..."
                        : "Close Attendance & Send Thank-you Emails"}
                    </button>
                  </div>

                  {attendanceRecords.map((record) => {
                    const isCompleted =
                      record.attendanceStatus === "Completed" ||
                      record.adminVerified === true;

                    return (
                      <div
                        key={record._id}
                        className={styles.candidateRow}
                      >
                        <div className={styles.candidateInfo}>
                          <div className={styles.candidateName}>
                            {record.studentName || "Unknown Student"}
                          </div>

                          <div className={styles.candidateMeta}>
                            Username: {record.studentUsername || "N/A"}
                          </div>

                          <div className={styles.candidateMeta}>
                            Check-in Time (IST):{" "}
                            <strong>
                              {formatCheckInTime(record.scannedAt)}
                            </strong>
                          </div>

                          <div className={styles.candidateMeta}>
                            Attendance:{" "}
                            <strong>
                              {record.attendanceStatus || "N/A"}
                            </strong>
                          </div>

                          {isCompleted ? (
                            <>
                              <div className={styles.candidateMeta}>
                                Completed At (IST):{" "}
                                <strong>
                                  {formatCheckInTime(record.completedAt)}
                                </strong>
                              </div>

                              <div className={styles.candidateMeta}>
                                Final Volunteering Duration:{" "}
                                <strong>
                                  {formatDuration(record.durationSeconds)}
                                </strong>
                              </div>

                              <span className={styles.approvedStatus}>
                                <CheckCircle size={14} />
                                {" "}Completed & Verified
                              </span>
                            </>
                          ) : (
                            <span className={styles.rejectedStatus}>
                              Awaiting Completion
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </>
              ) : (
                <p>No students have checked in yet.</p>
              )}
            </div>
          </div>

        </div>
      </main>

      {/* QR MODAL */}

      {showQRModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => {
            setShowQRModal(false);
            setQrData(null);
          }}
        >
          <div
            className={styles.qrModal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.qrModalHeader}>
              <div>
                <span className={styles.qrModalLabel}>
                  ATTENDANCE
                </span>

                <h2>Event Attendance QR</h2>

                <p>{event.eventTitle || event.title}</p>
              </div>

              <button
                className={styles.modalClose}
                onClick={() => setShowQRModal(false)}
              >
                <X size={19} />
              </button>
            </div>

            <div className={styles.qrBody}>
              <div className={styles.qrCodeLarge}>
                {qrData && (
                  <QRCodeSVG
                    value={
                      typeof qrData === "string"
                        ? qrData
                        : JSON.stringify(qrData)
                    }
                    size={220}
                    level="H"
                    includeMargin={true}
                  />
                )}
              </div>
              <h3>Scan to Mark Attendance</h3>

              <p>
                Volunteers can scan this QR code using the Maatram
                volunteering app to mark their attendance.
              </p>

              <div className={styles.qrEventInfo}>
                <span>
                  <Calendar size={14} />
                  {formatDate(getEventDate(event))}
                </span>

                <span>
                  <Clock size={14} />
                  {formatTime(event.startTime, event.startAt)}
                </span>
              </div>
            </div>

            <div className={styles.qrModalFooter}>
              <button
                className={styles.ghostButton}
                onClick={() => setShowQRModal(false)}
              >
                Close
              </button>

              <button
                className={styles.generateButton}
                onClick={generateQR}
                disabled={generatingQR}
              >
                <QrCode size={16} />
                {generatingQR ? "Generating..." : "Generate New QR"}
              </button>
            </div>
          </div>
        </div>

      )}
    </div>
  );
};

export default EventManage;
