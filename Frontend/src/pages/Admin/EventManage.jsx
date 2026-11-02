import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  Sparkles,
  UserPlus,
  Send,
  MessageCircle,
  FileText,
  QrCode,
  X,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getEventRegistrations } from "../../services/eventService";
import styles from "./EventManage.module.css";

/* ============================================================
   FALLBACK DATA
   ============================================================ */

const FALLBACK_EVENTS = {
  1: {
    id: 1,
    title: "Beach Cleanup Drive",
    date: new Date(
      Date.now() + 45 * 60000
    ).toISOString(),
    startAt: new Date(
      Date.now() + 45 * 60000
    ).toISOString(),
    endAt: new Date(
      Date.now() + 180 * 60000
    ).toISOString(),
    venue: "Marina Beach",
    location: "Marina Beach",
    description:
      "Clearing plastic waste along the coastline to restore marine habitats.",
    skills: [
      "Logistics",
      "Crowd Control",
      "Event Management",
    ],
    zone: "Zone 1",
    volunteersNeeded: 30,
    interested: [1, 2, 3, 5, 6],
    selected: [],
    whatsappLink: "",
    emailNote: "",
  },

  2: {
    id: 2,
    title: "Career Guidance Workshop",
    date: new Date(
      Date.now() + 26 * 60 * 60000
    ).toISOString(),
    startAt: new Date(
      Date.now() + 26 * 60 * 60000
    ).toISOString(),
    endAt: new Date(
      Date.now() + 31 * 60 * 60000
    ).toISOString(),
    venue: "Green Valley Auditorium",
    location: "Green Valley Auditorium",
    description:
      "Alumni-led workshop for final-year students.",
    skills: [
      "Public Speaking",
      "Teaching",
      "Registration Desk",
    ],
    zone: "Zone 2",
    volunteersNeeded: 15,
    interested: [2, 3, 4, 6],
    selected: [],
    whatsappLink: "",
    emailNote: "",
  },

  3: {
    id: 3,
    title: "Blood Donation Camp",
    date: new Date(
      Date.now() + 20 * 60 * 60000
    ).toISOString(),
    startAt: new Date(
      Date.now() + 20 * 60 * 60000
    ).toISOString(),
    endAt: new Date(
      Date.now() + 26 * 60 * 60000
    ).toISOString(),
    venue: "Sunrise Campus Hall",
    location: "Sunrise Campus Hall",
    description:
      "Volunteers assist with donor registration and first-aid support.",
    skills: [
      "First Aid",
      "Registration Desk",
      "Crowd Control",
    ],
    zone: "Zone 4",
    volunteersNeeded: 10,
    interested: [1, 4, 5, 8],
    selected: [4, 8],
    whatsappLink: "",
    emailNote: "",
  },
};

/* ============================================================
   FALLBACK VOLUNTEERS
   ============================================================ */


const FALLBACK_VOLUNTEERS = [
  {
    id: 1,
    name: "Santhosh Kumar",
    email: "santhosh.kumar@maatram.edu",
    pastEvents: 14,
    history: [
      "Tree Plantation Drive",
      "Winter Book Fair",
      "Campus Cleanup",
    ],
    score: 96,
  },
  {
    id: 2,
    name: "Priya Ramesh",
    email: "priya.ramesh@maatram.edu",
    pastEvents: 11,
    history: [
      "Blood Donation Camp",
      "Career Workshop",
    ],
    score: 92,
  },
  {
    id: 3,
    name: "Karthik Vel",
    email: "karthik.vel@maatram.edu",
    pastEvents: 9,
    history: [
      "Tree Plantation",
      "Beach Cleanup",
    ],
    score: 89,
  },
  {
    id: 4,
    name: "Meena Suresh",
    email: "meena.suresh@maatram.edu",
    pastEvents: 12,
    history: [
      "Blood Donation Camp",
      "Design Workshop",
    ],
    score: 95,
  },
  {
    id: 5,
    name: "Arjun Kumar",
    email: "arjun.kumar@maatram.edu",
    pastEvents: 6,
    history: [
      "Technical Support Drive",
    ],
    score: 84,
  },
  {
    id: 6,
    name: "Divya Nair",
    email: "divya.nair@maatram.edu",
    pastEvents: 15,
    history: [
      "Career Workshop",
      "Beach Cleanup",
      "Book Fair",
    ],
    score: 98,
  },
  {
    id: 8,
    name: "Ananya Iyer",
    email: "ananya.iyer@maatram.edu",
    pastEvents: 10,
    history: [
      "First Aid Camp",
      "Crowd Management",
    ],
    score: 91,
  },
];

/* ============================================================
   HELPERS
   ============================================================ */

const getEventDate = (event) =>
  event?.startAt ||
  event?.date ||
  new Date().toISOString();

const getEventEnd = (event) =>
  event?.endAt ||
  getEventDate(event);

const formatDate = (date) =>
  new Date(date).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );

const formatTime = (date) =>
  new Date(date).toLocaleTimeString(
    "en-IN",
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );

/* ============================================================
   COMPONENT
   ============================================================ */

const EventManage = () => {
  const navigate = useNavigate();
  const [registeredMembers, setRegisteredMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [memberError, setMemberError] = useState("");
  const location = useLocation();
  const { eventId } = useParams();
  console.log("Current Event ID:", eventId);

  /*
    If AdminDashboard sends event through navigate state,
    use that first.
  */
  const stateEvent = location.state?.event;

  const event =
    stateEvent ||
    FALLBACK_EVENTS[Number(eventId)] ||
    FALLBACK_EVENTS[1];


  const currentEventId = event?._id || event?.id || eventId;

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

        const data = await getEventRegistrations(currentEventId);

        setRegisteredMembers(data.registrations || []);
      } catch (error) {
        console.error("Error fetching registered members:", error);

        setMemberError(
          error.response?.data?.message ||
          "Unable to load registered members."
        );
      } finally {
        setLoadingMembers(false);
      }
    };

    fetchRegisteredMembers();
  }, [currentEventId]);

  const [selectedVolunteers, setSelectedVolunteers] =
    useState(event.selected || []);

  const [whatsappLink, setWhatsappLink] =
    useState(event.whatsappLink || "");

  const [emailNote, setEmailNote] =
    useState(event.emailNote || "");

  const [activeVolunteer, setActiveVolunteer] =
    useState(null);

  const [showQRModal, setShowQRModal] =
    useState(false);

  const [qrMessage, setQrMessage] =
    useState("");

  const [activeTab, setActiveTab] =
    useState("ai");

  /* ==========================================================
     VOLUNTEERS
  ========================================================== */

  const allVolunteers = useMemo(() => {
    return FALLBACK_VOLUNTEERS;
  }, []);

  const interestedVolunteers = useMemo(() => {
    return registeredMembers.map((member, index) => ({
      id: member._id || member.registrationId || index,
      name: member.studentName || member.name || "Unknown",
      username: member.studentUsername || member.username || "",
      email: member.email || "",
      phone: member.phone || "",
      role: member.role || "",
      address: member.address || "",
      residenceType: member.residenceType || "",
      pastEvents: 0,
      history: member.previousVolunteeringWorks || [],
      score: 0,
    }));
  }, [registeredMembers]);

  const aiShortlisted = useMemo(() => {
    return [...allVolunteers]
      .sort(
        (a, b) =>
          (b.score || 0) -
          (a.score || 0)
      )
      .slice(0, 6);
  }, [allVolunteers]);

  /* ==========================================================
     SELECT VOLUNTEER
  ========================================================== */

  const handleSelect = (id) => {
    setSelectedVolunteers((prev) =>
      prev.includes(id)
        ? prev.filter(
          (vId) => vId !== id
        )
        : [...prev, id]
    );
  };

  /* ==========================================================
     SEND EMAIL
  ========================================================== */

  const handleSendEmail = () => {
    if (selectedVolunteers.length === 0) {
      alert(
        "Please select at least one volunteer."
      );
      return;
    }

    alert(
      `${selectedVolunteers.length} approval email(s) prepared.\n\nEmail note and WhatsApp group link will be included.`
    );
  };

  /* ==========================================================
     QR ATTENDANCE
  ========================================================== */

  const handleAttendanceClick = () => {
    const startDate = new Date(
      getEventDate(event)
    );

    const timeDiffMinutes =
      (startDate.getTime() -
        Date.now()) /
      (1000 * 60);

    /*
      QR becomes available 30 mins before event
      until 2 hours after event starts.
    */
    if (
      timeDiffMinutes <= 30 &&
      timeDiffMinutes >= -120
    ) {
      setQrMessage("");
      setShowQRModal(true);
    } else {
      setQrMessage(
        `Attendance QR becomes active 30 minutes before the event. ${Math.round(timeDiffMinutes)
        } minutes remaining.`
      );

      setTimeout(
        () => setQrMessage(""),
        5000
      );
    }
  };

  /* ==========================================================
     VOLUNTEER ROW
  ========================================================== */

  const renderVolunteer = (
    volunteer,
    isAI = false
  ) => {
    const isSelected =
      selectedVolunteers.includes(
        volunteer.id
      );

    const isActive =
      activeVolunteer?.id ===
      volunteer.id;

    return (
      <div
        key={volunteer.id}
        className={`${styles.candidateRow} ${isActive
          ? styles.candidateRowOn
          : ""
          }`}
        onClick={() =>
          setActiveVolunteer(
            volunteer
          )
        }
      >
        <input
          type="checkbox"
          className={
            styles.candidateCheck
          }
          checked={isSelected}
          onChange={() =>
            handleSelect(
              volunteer.id
            )
          }
          onClick={(e) =>
            e.stopPropagation()
          }
        />

        <div
          className={
            styles.candidateInfo
          }
        >
          <div
            className={
              styles.candidateName
            }
          >
            {volunteer.name}
          </div>

          <div className={styles.candidateMeta}>
            {volunteer.username} · {volunteer.role}
          </div>

          <div className={styles.candidateMeta}>
            {volunteer.email}
          </div>

          {isAI && (
            <div
              className={
                styles.candidateReasons
              }
            >
              <Sparkles size={12} />
              AI matched · Reliable volunteer
            </div>
          )}
        </div>

        <div
          className={
            styles.candidateScore
          }
        >
          {isAI
            ? volunteer.score
            : volunteer.pastEvents}
        </div>
      </div>
    );
  };

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <div className={styles.dashboard}>
      <main className={styles.main}>
        {/* ====================================================
            TOP NAV
        ==================================================== */}

        <div className={styles.topNavigation}>
          <button
            className={styles.backButton}
            onClick={() =>
              navigate("/admin/dashboard")
            }
          >
            <ArrowLeft size={17} />
            Back to Dashboard
          </button>

          <span
            className={
              styles.eventIdBadge
            }
          >
            Event #{event.id || eventId}
          </span>
        </div>

        {/* ====================================================
            EVENT HEADER
        ==================================================== */}

        <div className={styles.welcome}>
          <div
            className={
              styles.welcomeContent
            }
          >
            <div
              className={
                styles.managementLabel
              }
            >
              EVENT MANAGEMENT
            </div>

            <h1
              className={
                styles.welcomeTitle
              }
            >
              {event.title}
            </h1>

            <div
              className={
                styles.eventInfoLine
              }
            >
              <span>
                <MapPin size={15} />
                {event.venue ||
                  event.location}
              </span>

              <span>
                <Calendar size={15} />
                {formatDate(
                  getEventDate(event)
                )}
              </span>

              <span>
                <Clock size={15} />
                {formatTime(
                  getEventDate(event)
                )}{" "}
                –{" "}
                {formatTime(
                  getEventEnd(event)
                )}
              </span>

              {event.zone && (
                <span>
                  <MapPin size={15} />
                  {event.zone}
                </span>
              )}
            </div>

            <p
              className={
                styles.welcomeDescription
              }
            >
              {event.description}
            </p>

            {event.skills?.length > 0 && (
              <div
                className={
                  styles.skillRow
                }
              >
                {event.skills.map(
                  (skill) => (
                    <span
                      key={skill}
                      className={
                        styles.skillChip
                      }
                    >
                      {skill}
                    </span>
                  )
                )}
              </div>
            )}
          </div>

          {/* ==================================================
              QR BUTTON
          ================================================== */}

          <button
            className={styles.qrActionCard}
            onClick={
              handleAttendanceClick
            }
          >
            <div
              className={
                styles.qrIconBox
              }
            >
              <QrCode size={30} />
            </div>

            <div
              className={
                styles.qrActionContent
              }
            >
              <strong>
                Generate Attendance QR
              </strong>

              <span>
                Open QR for volunteer
                attendance
              </span>
            </div>

            <ExternalLink
              size={18}
              className={styles.qrArrow}
            />
          </button>
        </div>

        {qrMessage && (
          <div
            className={
              styles.qrMessage
            }
          >
            <Clock size={15} />
            {qrMessage}
          </div>
        )}

        {/* ====================================================
            STATS
        ==================================================== */}

        <div
          className={
            styles.eventStatsBar
          }
        >
          <div
            className={
              styles.eventStatCard
            }
          >
            <div
              className={
                styles.eventStatIcon
              }
            >
              <UserPlus size={20} />
            </div>

            <div>
              <strong>
                {interestedVolunteers.length}
              </strong>

              <span>
                Interested Volunteers
              </span>
            </div>
          </div>

          <div
            className={
              styles.eventStatCard
            }
          >
            <div
              className={
                styles.eventStatIcon
              }
            >
              <Sparkles size={20} />
            </div>

            <div>
              <strong>
                {aiShortlisted.length}
              </strong>

              <span>
                AI Recommendations
              </span>
            </div>
          </div>

          <div
            className={
              styles.eventStatCard
            }
          >
            <div
              className={
                styles.eventStatIcon
              }
            >
              <CheckCircle2
                size={20}
              />
            </div>

            <div>
              <strong>
                {selectedVolunteers.length}
              </strong>

              <span>
                Selected Volunteers
              </span>
            </div>
          </div>

          <div
            className={
              styles.eventStatCard
            }
          >
            <div
              className={
                styles.eventStatIcon
              }
            >
              <Users size={20} />
            </div>

            <div>
              <strong>
                {event.volunteersNeeded ||
                  0}
              </strong>

              <span>
                Volunteers Needed
              </span>
            </div>
          </div>
        </div>

        {/* ====================================================
            MAIN GRID
        ==================================================== */}

        <div
          className={
            styles.contentGrid
          }
        >
          {/* LEFT */}
          <div
            className={
              styles.leftColumn
            }
          >
            <div
              className={
                styles.volunteerPanel
              }
            >
              <div
                className={
                  styles.panelHeader
                }
              >
                <div>
                  <h3
                    className={
                      styles.sectionTitle
                    }
                  >
                    Select Volunteers
                  </h3>

                  <p
                    className={
                      styles.panelSubtitle
                    }
                  >
                    Review interested
                    students and AI
                    recommendations.
                  </p>
                </div>

                <span
                  className={
                    styles.selectedBadge
                  }
                >
                  {selectedVolunteers.length}{" "}
                  Selected
                </span>
              </div>

              {/* TABS */}

              <div
                className={
                  styles.volunteerTabs
                }
              >
                <button
                  className={
                    activeTab === "ai"
                      ? styles.volunteerTabActive
                      : styles.volunteerTab
                  }
                  onClick={() =>
                    setActiveTab("ai")
                  }
                >
                  <Sparkles size={15} />
                  AI Shortlisted
                  <span>
                    {aiShortlisted.length}
                  </span>
                </button>

                <button
                  className={
                    activeTab ===
                      "interested"
                      ? styles.volunteerTabActive
                      : styles.volunteerTab
                  }
                  onClick={() =>
                    setActiveTab(
                      "interested"
                    )
                  }
                >
                  <UserPlus size={15} />
                  Interested
                  <span>
                    {
                      interestedVolunteers.length
                    }
                  </span>
                </button>
              </div>

              <div
                className={
                  styles.candidateList
                }
              >
                <div className={styles.candidateList}>
                  {activeTab === "ai" ? (
                    aiShortlisted.map((v) => renderVolunteer(v, true))
                  ) : loadingMembers ? (
                    <p>Loading registered members...</p>
                  ) : memberError ? (
                    <p>{memberError}</p>
                  ) : interestedVolunteers.length > 0 ? (
                    interestedVolunteers.map((v) => renderVolunteer(v, false))
                  ) : (
                    <p>No students have registered for this event yet.</p>
                  )}
                </div>
              </div>
            </div>

            {/* ==================================================
                EMAIL COMMUNICATION
            ================================================== */}

            <div
              className={
                styles.communicationCard
              }
            >
              <div
                className={
                  styles.communicationHeader
                }
              >
                <div
                  className={
                    styles.communicationIcon
                  }
                >
                  <Send size={19} />
                </div>

                <div>
                  <h3>
                    Selection Communication
                  </h3>

                  <p>
                    Add the message and
                    WhatsApp details that
                    will be shared with
                    selected volunteers.
                  </p>
                </div>
              </div>

              {/* EMAIL NOTE */}

              <div
                className={
                  styles.formGroup
                }
              >
                <label
                  className={
                    styles.fieldLabel
                  }
                >
                  <FileText size={15} />
                  Email Note
                </label>

                <textarea
                  className={
                    styles.textarea
                  }
                  value={emailNote}
                  onChange={(e) =>
                    setEmailNote(
                      e.target.value
                    )
                  }
                  placeholder="Example: Congratulations! You have been selected for the Beach Cleanup Drive. Please report at the venue 15 minutes before the event."
                  rows={5}
                />
              </div>

              {/* WHATSAPP */}

              <div
                className={
                  styles.formGroup
                }
              >
                <label
                  className={
                    styles.fieldLabel
                  }
                >
                  <MessageCircle
                    size={15}
                  />
                  WhatsApp Group Link
                  <span
                    className={
                      styles.optional
                    }
                  >
                    Optional
                  </span>
                </label>

                <input
                  type="url"
                  className={
                    styles.input
                  }
                  value={whatsappLink}
                  onChange={(e) =>
                    setWhatsappLink(
                      e.target.value
                    )
                  }
                  placeholder="https://chat.whatsapp.com/..."
                />
              </div>

              <div
                className={
                  styles.communicationFooter
                }
              >
                <div
                  className={
                    styles.selectionSummary
                  }
                >
                  <strong>
                    {
                      selectedVolunteers.length
                    }
                  </strong>

                  <span>
                    volunteers selected
                  </span>
                </div>

                <button
                  className={
                    styles.sendButton
                  }
                  disabled={
                    selectedVolunteers.length ===
                    0
                  }
                  onClick={
                    handleSendEmail
                  }
                >
                  <Send size={16} />
                  Send Approval Emails
                </button>
              </div>
            </div>
          </div>

          {/* ==================================================
              RIGHT PROFILE
          ================================================== */}

          <div
            className={
              styles.rightColumn
            }
          >
            <div
              className={
                styles.profileCard
              }
            >
              <div
                className={
                  styles.profileCardHeader
                }
              >
                <div>
                  <h3
                    className={
                      styles.sectionTitle
                    }
                  >
                    Volunteer Profile
                  </h3>

                  <p
                    className={
                      styles.panelSubtitle
                    }
                  >
                    Click a volunteer to
                    view their history.
                  </p>
                </div>
              </div>

              {activeVolunteer ? (
                <div
                  className={
                    styles.profileContent
                  }
                >
                  <div
                    className={
                      styles.profileIdentity
                    }
                  >
                    <div
                      className={
                        styles.avatarLg
                      }
                    >
                      {activeVolunteer.name.charAt(
                        0
                      )}
                    </div>

                    <div>
                      <h3>
                        {
                          activeVolunteer.name
                        }
                      </h3>

                      <p>
                        {
                          activeVolunteer.email
                        }
                      </p>
                    </div>
                  </div>

                  <div
                    className={
                      styles.profileStats
                    }
                  >
                    <div>
                      <strong>
                        {
                          activeVolunteer.pastEvents
                        }
                      </strong>

                      <span>
                        Total Events
                      </span>
                    </div>

                    <div>
                      <strong>
                        98%
                      </strong>

                      <span>
                        Reliability
                      </span>
                    </div>

                    <div>
                      <strong>
                        {
                          activeVolunteer.score ||
                          0
                        }
                      </strong>

                      <span>
                        AI Score
                      </span>
                    </div>
                  </div>

                  <div
                    className={
                      styles.historyHeading
                    }
                  >
                    Past Volunteering
                  </div>

                  <div
                    className={
                      styles.historyList
                    }
                  >
                    {activeVolunteer.history.map(
                      (
                        historyEvent,
                        index
                      ) => (
                        <div
                          key={index}
                          className={
                            styles.historyItem
                          }
                        >
                          <div
                            className={
                              styles.historyDot
                            }
                          >
                            <CheckCircle2
                              size={14}
                            />
                          </div>

                          <div>
                            <strong>
                              {
                                historyEvent
                              }
                            </strong>

                            <span>
                              Completed
                              Successfully
                            </span>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              ) : (
                <div
                  className={
                    styles.profileEmpty
                  }
                >
                  <Users size={36} />

                  <h4>
                    No volunteer selected
                  </h4>

                  <p>
                    Select a volunteer from
                    the list to view their
                    detailed profile,
                    reliability and past
                    volunteering history.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ======================================================
          QR MODAL
      ====================================================== */}

      {showQRModal && (
        <div
          className={
            styles.modalOverlay
          }
          onClick={() =>
            setShowQRModal(false)
          }
        >
          <div
            className={
              styles.qrModal
            }
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div
              className={
                styles.qrModalHeader
              }
            >
              <div>
                <span
                  className={
                    styles.qrModalLabel
                  }
                >
                  ATTENDANCE
                </span>

                <h2>
                  Event Attendance QR
                </h2>

                <p>
                  {event.title}
                </p>
              </div>

              <button
                className={
                  styles.modalClose
                }
                onClick={() =>
                  setShowQRModal(false)
                }
              >
                <X size={19} />
              </button>
            </div>

            <div
              className={
                styles.qrBody
              }
            >
              <div
                className={
                  styles.qrCodeLarge
                }
              >
                <QrCode size={170} />
              </div>

              <h3>
                Scan to Mark Attendance
              </h3>

              <p>
                Volunteers can scan this
                QR code using the Maatram
                volunteering app to mark
                their attendance.
              </p>

              <div
                className={
                  styles.qrEventInfo
                }
              >
                <span>
                  <Calendar size={14} />
                  {formatDate(
                    getEventDate(event)
                  )}
                </span>

                <span>
                  <Clock size={14} />
                  {formatTime(
                    getEventDate(event)
                  )}
                </span>
              </div>
            </div>

            <div
              className={
                styles.qrModalFooter
              }
            >
              <button
                className={
                  styles.ghostButton
                }
                onClick={() =>
                  setShowQRModal(false)
                }
              >
                Close
              </button>

              <button
                className={
                  styles.generateButton
                }
                onClick={() =>
                  alert(
                    "Attendance QR generated for this event."
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