
import React, { useState } from "react";
import { jsPDF } from "jspdf";
import styles from "./StudentCertificate.module.css";

const certificateData = [
  {
    id: 1,
    title: "Community Awareness Program",
    organization: "Maatram Foundation",
    category: "Social Volunteering",
    date: "10 January 2026",
    hours: "5 Hours",
    certificateId: "MAT-2026-001",
    status: "Available",
    studentName: "Logesh",
  },
  {
    id: 2,
    title: "Green Campus Initiative",
    organization: "Eco Club",
    category: "Environmental Volunteering",
    date: "12 October 2025",
    hours: "4 Hours",
    certificateId: "ECO-2025-002",
    status: "Available",
    studentName: "Logesh",
  },
  {
    id: 3,
    title: "Education Support Program",
    organization: "Student Volunteer Club",
    category: "Education Volunteering",
    date: "15 September 2025",
    hours: "8 Hours",
    certificateId: "EDU-2025-003",
    status: "Available",
    studentName: "Logesh",
  },
  {
    id: 4,
    title: "Community Cleanliness Drive",
    organization: "Green Earth Organization",
    category: "Community Service",
    date: "20 August 2025",
    hours: "3 Hours",
    certificateId: "GRE-2025-004",
    status: "Processing",
    studentName: "Logesh",
  },
];

const StudentCertificate = () => {
  const [certificates] = useState(certificateData);
  const [search, setSearch] = useState("");
  const [selectedCertificate, setSelectedCertificate] = useState(null);

  const availableCertificates = certificates.filter(
    (cert) => cert.status === "Available"
  );

  const totalHours = availableCertificates.reduce((total, cert) => {
    return total + Number(cert.hours.split(" ")[0]);
  }, 0);

  const filteredCertificates = certificates.filter((cert) =>
    cert.title.toLowerCase().includes(search.toLowerCase()) ||
    cert.organization.toLowerCase().includes(search.toLowerCase())
  );

  // Generate and download PDF
  const downloadCertificate = (cert) => {
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
        <div className={styles.pageHeader}>
          <div>
            <span className={styles.eyebrow}>
              STUDENT ACHIEVEMENTS
            </span>
            <h1>My Certificates<span>.</span></h1>
            <p>
              Your volunteering journey, achievements and certificates
              in one place.
            </p>
          </div>

          <div className={styles.headerIcon}>✦</div>
        </div>

        {/* Statistics */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>🏆</div>
            <div>
              <h2>{availableCertificates.length}</h2>
              <p>Certificates Earned</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>🤝</div>
            <div>
              <h2>{certificates.length}</h2>
              <p>Total Volunteering Events</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>◷</div>
            <div>
              <h2>{totalHours} Hrs</h2>
              <p>Volunteering Hours</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className={styles.sectionHeader}>
          <div>
            <h2>My Achievements</h2>
            <p>Certificates earned through volunteering activities</p>
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
            <div className={styles.certificateCard} key={cert.id}>

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

                {cert.status === "Processing" && (
                  <div className={styles.processingOverlay}>
                    <span>Certificate Processing</span>
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
                      cert.status === "Available"
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

                <div className={styles.cardActions}>
                  <button
                    className={styles.viewButton}
                    onClick={() => setSelectedCertificate(cert)}
                  >
                    Preview
                  </button>

                  <button
                    className={styles.downloadButton}
                    disabled={cert.status !== "Available"}
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
            <p>Try searching with another event name.</p>
          </div>
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

              {selectedCertificate.status === "Available" ? (
                <div className={styles.fullCertificate}>
                  <div className={styles.fullCertificateBorder}>
                    <span className={styles.largeStar}>✦</span>

                    <h4>{selectedCertificate.organization}</h4>

                    <h1>CERTIFICATE</h1>
                    <h3>OF APPRECIATION</h3>

                    <p>This certificate is proudly presented to</p>

                    <h2>{selectedCertificate.studentName}</h2>

                    <div className={styles.certificateDivider}></div>

                    <p>
                      For successfully participating in
                    </p>

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
                  <span>◷</span>
                  <h3>Certificate is being processed</h3>
                  <p>
                    Your certificate will be available once it is approved
                    and uploaded by the event organizer.
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
                  disabled={selectedCertificate.status !== "Available"}
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
