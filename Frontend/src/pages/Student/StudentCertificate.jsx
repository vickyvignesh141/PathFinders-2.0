
import React, { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import { useNavigate } from "react-router-dom";
import styles from "./StudentCertificate.module.css";

const API_URL = "http://localhost:5000/api/feedback/student/certificates";

const StudentCertificate = () => {
  const navigate = useNavigate();

  const [certificates, setCertificates] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch certificates from backend
  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
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

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to fetch certificates");
      }

      const formattedCertificates = (data.certificates || []).map(
        (cert, index) => {
          const feedbackSubmitted = cert.feedbackSubmitted === true;

          return {
            ...cert,
            id: cert.id || cert.eventId || index,
            title: cert.title || "Volunteer Event",
            organization: cert.organization || "Maatram Foundation",
            category: cert.category || "Volunteering",
            date: cert.date || "Date not available",
            hours: cert.hours || "Not available",
            certificateId: cert.certificateId || "Pending",
            studentName: cert.studentName || "Student",

            feedbackSubmitted,

            status: feedbackSubmitted
              ? "Available"
              : "Feedback Required",
          };
        }
      );

      setCertificates(formattedCertificates);
    } catch (err) {
      console.error("Certificate fetch error:", err);
      setError(err.message || "Unable to load certificates.");
    } finally {
      setLoading(false);
    }
  };

  // Certificates unlocked after feedback
  const availableCertificates = certificates.filter(
    (cert) => cert.feedbackSubmitted
  );

  // Calculate total volunteering hours
  const totalHours = certificates.reduce((total, cert) => {
    const hours = parseFloat(String(cert.hours).replace(/[^\d.]/g, ""));
    return total + (Number.isFinite(hours) ? hours : 0);
  }, 0);

  // Search
  const filteredCertificates = certificates.filter(
    (cert) =>
      cert.title.toLowerCase().includes(search.toLowerCase()) ||
      cert.organization.toLowerCase().includes(search.toLowerCase())
  );

  // Generate and download PDF
  const downloadCertificate = (cert) => {
    // IMPORTANT: Feedback must be submitted before downloading
    if (!cert.feedbackSubmitted) {
      alert("Please submit feedback for this event to download your certificate.");
      return;
    }

    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    const width = 297;
    const height = 210;

    // Background
    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, width, height, "F");

    // Outer border
    pdf.setDrawColor(20, 20, 20);
    pdf.setLineWidth(2);
    pdf.rect(8, 8, width - 16, height - 16);

    // Inner yellow border
    pdf.setDrawColor(229, 189, 0);
    pdf.setLineWidth(1.2);
    pdf.rect(13, 13, width - 26, height - 26);

    // Top decorative bar
    pdf.setFillColor(255, 220, 50);
    pdf.rect(13, 13, width - 26, 5, "F");

    // Organization
    pdf.setTextColor(30, 30, 30);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(18);
    pdf.text(cert.organization.toUpperCase(), width / 2, 43, {
      align: "center",
    });

    // Certificate heading
    pdf.setFontSize(31);
    pdf.text("CERTIFICATE", width / 2, 72, {
      align: "center",
    });

    pdf.setTextColor(183, 148, 0);
    pdf.setFontSize(16);
    pdf.text("OF APPRECIATION", width / 2, 83, {
      align: "center",
    });

    // Body
    pdf.setTextColor(90, 90, 90);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(13);
    pdf.text("This certificate is proudly presented to", width / 2, 105, {
      align: "center",
    });

    // Student name
    pdf.setTextColor(20, 20, 20);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(25);
    pdf.text(cert.studentName, width / 2, 122, {
      align: "center",
    });

    // Event details
    pdf.setTextColor(75, 75, 75);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(12);

    pdf.text(
      `For successfully participating in ${cert.title}`,
      width / 2,
      139,
      { align: "center", maxWidth: 240 }
    );

    pdf.text(
      `Volunteering Duration: ${cert.hours}  |  Date: ${cert.date}`,
      width / 2,
      151,
      { align: "center" }
    );

    // Certificate ID
    pdf.setFontSize(9);
    pdf.text(`Certificate ID: ${cert.certificateId}`, 22, 184);

    // Signature line
    pdf.setDrawColor(40, 40, 40);
    pdf.line(220, 172, 270, 172);

    pdf.setFontSize(10);
    pdf.text("Authorized Signature", 245, 180, {
      align: "center",
    });

    pdf.save(`${cert.certificateId}.pdf`);
  };

  return (
    <div className={styles.certificatePage}>
      <div className={styles.container}>

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
              STUDENT ACHIEVEMENTS
            </span>

            <h1>
              My Certificates<span>.</span>
            </h1>

            <p>
              Your volunteering journey, achievements and certificates
              in one place.
            </p>
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

        {/* Loading */}
        {loading && (
          <div className={styles.emptyState}>
            <h3>Loading Certificates...</h3>
            <p>Please wait while we fetch your certificates.</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className={styles.emptyState}>
            <h3>Unable to Load Certificates</h3>
            <p>{error}</p>

            <button
              type="button"
              onClick={fetchCertificates}
              className={styles.downloadButton}
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Statistics */}
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>🏆</div>
                <div>
                  <h2>{availableCertificates.length}</h2>
                  <p>Certificates Unlocked</p>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>🤝</div>
                <div>
                  <h2>{certificates.length}</h2>
                  <p>Total Attended Events</p>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>◷</div>
                <div>
                  <h2>{Number(totalHours.toFixed(2))} Hrs</h2>
                  <p>Total Volunteering Hours</p>
                </div>
              </div>
            </div>

            {/* Search */}
            <div className={styles.sectionHeader}>
              <div>
                <h2>My Achievements</h2>
                <p>
                  Submit event feedback to unlock your certificates.
                </p>
              </div>

              <div className={styles.searchBox}>
                <span>⌕</span>

                <input
                  type="text"
                  placeholder="Search certificates..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Certificates */}
            <div className={styles.certificateGrid}>
              {filteredCertificates.map((cert) => (
                <div
                  className={styles.certificateCard}
                  key={cert.id}
                >
                  <div className={styles.certificatePreview}>
                    <div className={styles.previewBorder}>
                      <span className={styles.previewStar}>✦</span>

                      <p className={styles.previewOrganization}>
                        {cert.organization}
                      </p>

                      <h3>CERTIFICATE</h3>

                      <span className={styles.previewSubtitle}>
                        OF APPRECIATION
                      </span>

                      <div className={styles.previewLine}></div>

                      <p className={styles.previewEvent}>
                        {cert.title}
                      </p>

                      <span className={styles.previewFooter}>
                        VOLUNTEER RECOGNITION
                      </span>
                    </div>

                    {!cert.feedbackSubmitted && (
                      <div className={styles.processingOverlay}>
                        <span>Submit Feedback to Unlock</span>
                      </div>
                    )}
                  </div>

                  <div className={styles.cardContent}>
                    <div className={styles.cardTop}>
                      <span className={styles.category}>
                        {cert.category}
                      </span>

                      <span
                        className={
                          cert.feedbackSubmitted
                            ? styles.available
                            : styles.processing
                        }
                      >
                        {cert.status}
                      </span>
                    </div>

                    <h3>{cert.title}</h3>

                    <p className={styles.organization}>
                      {cert.organization}
                    </p>

                    <div className={styles.cardInfo}>
                      <span>◷ {cert.date}</span>
                      <span>⌛ {cert.hours}</span>
                    </div>

                    <div className={styles.certificateId}>
                      ID: {cert.certificateId}
                    </div>

                    {!cert.feedbackSubmitted && (
                      <p style={{
                        fontSize: "12px",
                        color: "#a07800",
                        marginTop: "8px",
                      }}>
                        Submit feedback for this event to unlock PDF download.
                      </p>
                    )}

                    <div className={styles.cardActions}>
                      <button
                        className={styles.viewButton}
                        onClick={() => setSelectedCertificate(cert)}
                      >
                        Preview
                      </button>

                      <button
                        className={styles.downloadButton}
                        disabled={!cert.feedbackSubmitted}
                        onClick={() => downloadCertificate(cert)}
                      >
                        <span>↓</span> Download PDF
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredCertificates.length === 0 && (
              <div className={styles.emptyState}>
                <span>🏆</span>
                <h3>No Certificates Found</h3>
                <p>
                  {certificates.length === 0
                    ? "You don't have any verified completed event certificates yet."
                    : "Try searching with another event name."}
                </p>
              </div>
            )}
          </>
        )}

        {/* Certificate Preview Modal */}
        {selectedCertificate && (
          <div
            className={styles.modalOverlay}
            onClick={() => setSelectedCertificate(null)}
          >
            <div
              className={styles.modalContent}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
            >
              <button
                className={styles.closeButton}
                onClick={() => setSelectedCertificate(null)}
              >
                ×
              </button>

              <div className={styles.modalHeader}>
                <span>CERTIFICATE PREVIEW</span>
                <h2>{selectedCertificate.title}</h2>
              </div>

              {selectedCertificate.feedbackSubmitted ? (
                <div className={styles.fullCertificate}>
                  <div className={styles.fullCertificateBorder}>
                    <span className={styles.largeStar}>✦</span>

                    <h4>{selectedCertificate.organization}</h4>

                    <h1>CERTIFICATE</h1>
                    <h3>OF APPRECIATION</h3>

                    <p>This certificate is proudly presented to</p>

                    <h2>{selectedCertificate.studentName}</h2>

                    <div className={styles.certificateDivider}></div>

                    <p>For successfully participating in</p>

                    <strong>{selectedCertificate.title}</strong>

                    <div className={styles.certificateMeta}>
                      <span>{selectedCertificate.date}</span>
                      <span>{selectedCertificate.hours}</span>
                    </div>

                    <div className={styles.modalCertificateId}>
                      Certificate ID: {selectedCertificate.certificateId}
                    </div>
                  </div>
                </div>
              ) : (
                <div className={styles.processingMessage}>
                  <span>📝</span>
                  <h3>Feedback Required</h3>
                  <p>
                    You have successfully attended this event.
                    Please submit your feedback to unlock and download
                    your certificate.
                  </p>
                </div>
              )}

              <div className={styles.modalActions}>
                <button
                  className={styles.closeModalButton}
                  onClick={() => setSelectedCertificate(null)}
                >
                  Close
                </button>

                <button
                  className={styles.downloadButton}
                  disabled={!selectedCertificate.feedbackSubmitted}
                  onClick={() =>
                    downloadCertificate(selectedCertificate)
                  }
                >
                  ↓ Download PDF
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default StudentCertificate;
