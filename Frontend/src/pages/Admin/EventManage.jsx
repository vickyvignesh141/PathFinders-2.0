
import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  UserPlus,
  CheckCircle2,
  QrCode,
  X,
} from "lucide-react";

import { useLocation, useNavigate, useParams } from "react-router-dom";

import {
  getAllEvents,
  getEventRegistrations,
  updateRegistrationStatus,
} from "../../services/eventService";

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

  // Selected student profile
  const [activeVolunteer, setActiveVolunteer] = useState(null);

  // Status update loading
  const [updatingRegistration, setUpdatingRegistration] = useState(null);

  // QR modal
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrMessage, setQrMessage] = useState("");

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

  useEffect(() => {
    const fetchRegisteredMembers = async () => {
      if (!currentEventId) {
        setMemberError("Event ID is missing.");
        setLoadingMembers(false);
        return;
      }

      try {
        setLoadingMembers(true);
        setMemberError("");

        const response = await getEventRegistrations(currentEventId);

        setRegisteredMembers(response.registrations || []);
      } catch (error) {
        console.error("Error fetching registrations:", error);

        setMemberError(
          error.response?.data?.message ||
          "Unable to load registered students."
        );
      } finally {
        setLoadingMembers(false);
      }
    };

    fetchRegisteredMembers();
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

  const handleAttendanceClick = () => {
    const eventStart = event?.startAt
      ? new Date(event.startAt)
      : event?.date && event?.startTime
        ? new Date(`${event.date}T${event.startTime}:00`)
        : null;

    if (!eventStart || Number.isNaN(eventStart.getTime())) {
      setQrMessage("Event date or time is not available.");
      return;
    }

    const timeDifference =
      (eventStart.getTime() - Date.now()) / (1000 * 60);

    // QR available 30 minutes before the event
    // until 2 hours after the event starts
    if (timeDifference <= 30 && timeDifference >= -120) {
      setQrMessage("");
      setShowQRModal(true);
    } else {
      setQrMessage(
        `Attendance QR becomes active 30 minutes before the event. ${
          Math.round(timeDifference)
        } minutes remaining.`
      );
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
          >
            <div className={styles.qrIconBox}>
              <QrCode size={30} />
            </div>

            <div className={styles.qrActionContent}>
              <strong>Generate Attendance QR</strong>
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
        </div>
      </main>

      {/* QR MODAL */}

      {showQRModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowQRModal(false)}
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
                <QrCode size={170} />
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
                onClick={() =>
                  alert(
                    "QR generation is not connected yet. This is currently a placeholder."
                  )
                }
              >
                <QrCode size={16} />
                Generate New QR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventManage;
