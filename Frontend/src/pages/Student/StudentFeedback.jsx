
import React, { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import styles from "./StudentFeedback.module.css";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const feedbackSections = [
  {
    title: "Food & Refreshments",
    icon: "🍱",
    questions: ["How was the food and refreshment arrangement?"],
  },
  {
    title: "Venue & Facilities",
    icon: "🏛️",
    questions: ["How was the venue and facilities?"],
  },
  {
    title: "Event Management",
    icon: "📋",
    questions: ["Was the event well organized?"],
  },
  {
    title: "Volunteer Coordination",
    icon: "🤝",
    questions: ["Were your responsibilities and guidance clear?"],
  },
];

const ratingCategories = [
  "Overall Experience",
  "Event Management",
  "Volunteer Coordination",
];

const StudentFeedback = () => {
  const location = useLocation();
  const event = location.state?.event || {};

  const studentName = localStorage.getItem("name") || "Student Name";

  const eventName = event.eventTitle || event.title || "Volunteer Event";

  const eventDate = event.date
    ? new Date(event.date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Event Date";

  const eventLocation = event.location || "Event Location";

  const [ratings, setRatings] = useState({});
  const [answers, setAnswers] = useState({});
  const [overallExperience, setOverallExperience] = useState("");
  const [likedMost, setLikedMost] = useState("");
  const [learning, setLearning] = useState("");

  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [linkedinGenerated, setLinkedinGenerated] = useState(false);
  const [linkedinPost, setLinkedinPost] = useState("");
  const [activeStep, setActiveStep] = useState(1);
  const [copied, setCopied] = useState(false);
  const [editingPost, setEditingPost] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateRating = (category, value) => {
    setRatings((prev) => ({
      ...prev,
      [category]: value,
    }));
  };

  const updateAnswer = (question, value) => {
    setAnswers((prev) => ({
      ...prev,
      [question]: value,
    }));
  };

  const averageRating = useMemo(() => {
    const values = Object.values(ratings);

    if (!values.length) return "0.0";

    return (
      values.reduce((sum, value) => sum + value, 0) / values.length
    ).toFixed(1);
  }, [ratings]);

  // STEP 1: SUBMIT FEEDBACK TO BACKEND
  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();

    if (ratingCategories.some((category) => !ratings[category])) {
      alert("Please provide all three overall ratings.");
      return;
    }

    if (!overallExperience.trim()) {
      alert("Please share your overall experience.");
      return;
    }

    const eventId = event._id || event.id;

    if (!eventId) {
      alert("Event ID is missing. Please open feedback from the event page.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Login session expired. Please login again.");
      return;
    }

    const feedbackData = {
      eventId,
      eventName,
      studentName,
      ratings,
      answers,
      overallExperience,
      likedMost,
      learning,
      averageRating,
    };

    try {
      setIsSubmitting(true);

      const response = await fetch(
        "http://localhost:5000/api/feedback/submit",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(feedbackData),
        }
      );

      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(
          result.message || "Unable to submit feedback."
        );
      }

      alert(result.message || "Your feedback submitted successfully!");

      setFeedbackSubmitted(true);
      setActiveStep(2);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

    } catch (error) {
      console.error("Feedback submission error:", error);
      alert(error.message || "Feedback submission failed. Please try again.");

    } finally {
      setIsSubmitting(false);
    }
  };

  // STEP 3: GENERATE LINKEDIN POST
  const generateLinkedInPost = () => {
    const post = `🌟 A Meaningful Volunteering Experience!

I am happy to share my experience as a volunteer at ${eventName}, organized by Maatram Foundation.

Being part of this event was a valuable opportunity to contribute to the community, collaborate with others, and learn through real-world experiences.

${likedMost ? `One of the highlights of this event was ${likedMost}.` : ""}

${learning ? `Through this experience, I learned ${learning}.` : ""}

${overallExperience ? `My experience: ${overallExperience}` : ""}

I am grateful to Maatram Foundation and all the organizers and fellow volunteers for making this experience memorable.

Looking forward to participating in more initiatives and creating a positive impact! ❤️

#MaatramFoundation #Volunteering #SocialImpact #CommunityService #StudentVolunteers #Leadership`;

    setLinkedinPost(post);
    setLinkedinGenerated(true);
    setEditingPost(false);
    setActiveStep(3);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const regenerateLinkedInPost = () => {
    generateLinkedInPost();
  };

  // COPY LINKEDIN CONTENT
  const copyLinkedInPost = async () => {
    try {
      await navigator.clipboard.writeText(linkedinPost);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      alert("Unable to copy. Please copy the text manually.");
    }
  };

  // OPEN LINKEDIN
  const openLinkedIn = async () => {
    try {
      await navigator.clipboard.writeText(linkedinPost);
      setCopied(true);

      window.open(
        "https://www.linkedin.com/feed/?shareActive=true",
        "_blank",
        "noopener,noreferrer",
      );
    } catch {
      alert("Unable to copy. Please copy the post manually.");
      window.open(
        "https://www.linkedin.com/feed/?shareActive=true",
        "_blank",
        "noopener,noreferrer",
      );
    }
  };

  // CERTIFICATE DOWNLOAD
  const handleDownloadCertificate = async () => {
    const certificateElement = document.getElementById("certificate");

    if (!certificateElement) {
      alert("Certificate not found!");
      return;
    }

    try {
      setIsDownloading(true);

      const canvas = await html2canvas(certificateElement, {
        scale: 3,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imageData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imageWidth = canvas.width;
      const imageHeight = canvas.height;

      const ratio = Math.min(pageWidth / imageWidth, pageHeight / imageHeight);

      const finalWidth = imageWidth * ratio;
      const finalHeight = imageHeight * ratio;

      const x = (pageWidth - finalWidth) / 2;
      const y = (pageHeight - finalHeight) / 2;

      pdf.addImage(imageData, "PNG", x, y, finalWidth, finalHeight);

      const safeStudentName = studentName.replace(/[^a-zA-Z0-9]/g, "_");

      pdf.save(`Maatram_Certificate_${safeStudentName}.pdf`);
    } catch (error) {
      console.error("Certificate download error:", error);
      alert("Unable to download certificate. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        {/* PAGE HEADER */}
        <div className={styles.pageHeader}>
          <div>
            <span className={styles.eyebrow}>MAATRAM FOUNDATION</span>

            <h1>Volunteer Experience</h1>

            <p>
              Share your experience, showcase your contribution and celebrate
              your impact.
            </p>
          </div>

          <div className={styles.eventBadge}>
            <span>EVENT</span>
            <strong>{eventName}</strong>
            <small>{eventDate}</small>
          </div>
        </div>

        {/* EVENT INFORMATION */}
        <div className={styles.eventInfo}>
          <div>
            <span>Volunteer</span>
            <strong>{studentName}</strong>
          </div>

          <div>
            <span>Event</span>
            <strong>{eventName}</strong>
          </div>

          <div>
            <span>Date</span>
            <strong>{eventDate}</strong>
          </div>

          <div>
            <span>Location</span>
            <strong>{eventLocation}</strong>
          </div>
        </div>

        {/* PROGRESS STEPS */}
        <div className={styles.progressContainer}>
          {[
            { number: 1, title: "Feedback" },
            { number: 2, title: "Certificate" },
            { number: 3, title: "LinkedIn Post" },
          ].map((step) => (
            <div
              key={step.number}
              className={`${styles.progressStep} ${
                activeStep >= step.number ? styles.activeStep : ""
              }`}
            >
              <div className={styles.stepCircle}>
                {activeStep > step.number ? "✓" : step.number}
              </div>

              <span>{step.title}</span>
            </div>
          ))}
        </div>

        {/* STEP 1: FEEDBACK */}

        {!feedbackSubmitted && (
          <form className={styles.mainCard} onSubmit={handleFeedbackSubmit}>
            <div className={styles.sectionHeader}>
              <div>
                <span className={styles.sectionNumber}>01</span>

                <h2>Event Feedback</h2>

                <p>A few quick questions about your volunteering experience.</p>
              </div>

              <div className={styles.headerIcon}>✍️</div>
            </div>

            {/* OVERALL RATINGS */}
            <div className={styles.formSection}>
              <h3>Rate Your Experience</h3>

              <p className={styles.sectionDescription}>
                Rate these three important areas from 1 to 5 stars.
              </p>

              <div className={styles.ratingList}>
                {ratingCategories.map((category) => (
                  <div className={styles.ratingRow} key={category}>
                    <strong>{category}</strong>

                    <div className={styles.stars}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          className={
                            star <= (ratings[category] || 0)
                              ? styles.starActive
                              : styles.star
                          }
                          onClick={() => updateRating(category, star)}
                          aria-label={`${star} stars for ${category}`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CATEGORY QUESTIONS */}
            {feedbackSections.map((section, index) => (
              <div className={styles.formSection} key={section.title}>
                <h3>
                  <span className={styles.categoryIcon}>{section.icon}</span>
                  {section.title}
                </h3>

                <div className={styles.questionList}>
                  {section.questions.map((question, qIndex) => (
                    <div className={styles.questionItem} key={question}>
                      <label htmlFor={`question-${index}-${qIndex}`}>
                        {question}
                      </label>

                      <div className={styles.optionGroup}>
                        {["Excellent", "Good", "Average", "Poor"].map(
                          (option) => (
                            <button
                              type="button"
                              key={option}
                              className={
                                answers[question] === option
                                  ? styles.optionSelected
                                  : styles.option
                              }
                              onClick={() => updateAnswer(question, option)}
                            >
                              {option}
                            </button>
                          ),
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* WRITTEN FEEDBACK */}
            <div className={styles.formSection}>
              <h3>Share Your Personal Experience</h3>

              <div className={styles.textField}>
                <label htmlFor="overallExperience">
                  How was your overall experience? *
                </label>

                <textarea
                  id="overallExperience"
                  value={overallExperience}
                  onChange={(e) => setOverallExperience(e.target.value)}
                  placeholder="Describe your overall event experience..."
                  rows={4}
                  required
                />
              </div>

              <div className={styles.textField}>
                <label htmlFor="likedMost">
                  What did you like the most about this event?
                </label>

                <textarea
                  id="likedMost"
                  value={likedMost}
                  onChange={(e) => setLikedMost(e.target.value)}
                  placeholder="Share your favourite moments..."
                  rows={3}
                />
              </div>

              <div className={styles.textField}>
                <label htmlFor="learning">
                  What did you learn from this event?
                </label>

                <textarea
                  id="learning"
                  value={learning}
                  onChange={(e) => setLearning(e.target.value)}
                  placeholder="Mention your skills and learnings..."
                  rows={3}
                />
              </div>
            </div>

            {/* SUBMIT */}
            <div className={styles.submitArea}>
              <div>
                <strong>Your Voice Matters!</strong>
                <p>Your feedback helps improve future events.</p>
              </div>

              <button
                type="submit"
                className={styles.primaryButton}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Feedback"}
                {!isSubmitting && <span> →</span>}
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: CERTIFICATE */}

        {feedbackSubmitted && activeStep === 2 && (
          <div className={styles.mainCard}>
            <div className={styles.sectionHeader}>
              <div>
                <span className={styles.sectionNumber}>02</span>

                <h2>Your Volunteer Certificate</h2>

                <p>
                  Celebrate your contribution with your official certificate of
                  appreciation.
                </p>
              </div>

              <div className={styles.headerIcon}>🏆</div>
            </div>

            {/* CERTIFICATE PREVIEW */}
            <div className={styles.certificate} id="certificate">
              <div className={styles.certificateInner}>
                <div className={styles.certificateLogo}>MAATRAM FOUNDATION</div>

                <div className={styles.certificateLine} />

                <div className={styles.certificateTitle}>CERTIFICATE</div>

                <div className={styles.certificateSubtitle}>
                  OF APPRECIATION
                </div>

                <p className={styles.certificateText}>
                  This certificate is proudly presented to
                </p>

                <h2 className={styles.certificateName}>{studentName}</h2>

                <div className={styles.certificateLineShort} />

                <p className={styles.certificateText}>
                  In recognition of valuable contribution and dedicated
                  participation as a volunteer in
                </p>

                <h3 className={styles.certificateEvent}>{eventName}</h3>

                <p className={styles.certificateText}>
                  Organized by Maatram Foundation
                </p>

                <div className={styles.certificateDetails}>
                  <div>
                    <strong>Date</strong>
                    <span>{eventDate}</span>
                  </div>

                  <div>
                    <strong>Certificate ID</strong>
                    <span>
                      MTF-
                      {event._id?.slice(-6)?.toUpperCase() || "PENDING"}
                    </span>
                  </div>
                </div>

                <div className={styles.certificateFooter}>
                  <div>
                    <div className={styles.signatureLine} />

                    <strong>Authorized Signature</strong>

                    <span>Maatram Foundation</span>
                  </div>

                  <div className={styles.seal}>
                    MTF
                    <span>VERIFIED</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CERTIFICATE ACTIONS */}
            <div className={styles.certificateActions}>
              <button
                className={styles.primaryButton}
                onClick={handleDownloadCertificate}
                disabled={isDownloading}
              >
                {isDownloading
                  ? "Preparing Certificate..."
                  : "↓ Download Certificate PDF"}
              </button>

              <button
                className={styles.primaryButton}
                onClick={() => {
                  setActiveStep(3);

                  window.scrollTo({
                    top: 0,
                    behavior: "smooth",
                  });
                }}
              >
                Continue to LinkedIn Post →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: LINKEDIN POST */}

        {feedbackSubmitted && activeStep === 3 && (
          <div className={styles.mainCard}>
            <div className={styles.sectionHeader}>
              <div>
                <span className={styles.sectionNumber}>03</span>

                <h2>LinkedIn Post Generator</h2>

                <p>
                  Turn your volunteering experience into a professional
                  achievement post.
                </p>
              </div>

              <div className={styles.headerIcon}>💼</div>
            </div>

            {!linkedinGenerated ? (
              <div className={styles.generateBox}>
                <div className={styles.generateIcon}>✨</div>

                <h3>Your Volunteering Story Deserves to Be Shared!</h3>

                <p>
                  Generate a professional LinkedIn post using your event details
                  and personal feedback.
                </p>

                <button
                  className={styles.primaryButton}
                  onClick={generateLinkedInPost}
                >
                  ✨ Generate LinkedIn Post
                </button>
              </div>
            ) : (
              <div className={styles.linkedinSection}>
                {/* LINKEDIN PREVIEW */}
                <div className={styles.linkedinPreview}>
                  <div className={styles.linkedinTop}>
                    <div className={styles.linkedinAvatar}>
                      {studentName.charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <strong>{studentName}</strong>

                      <span>Volunteer | Maatram Foundation</span>

                      <small>Professional volunteering achievement</small>
                    </div>
                  </div>

                  <div className={styles.postContent}>
                    {editingPost ? (
                      <textarea
                        className={styles.postEditor}
                        value={linkedinPost}
                        onChange={(e) => setLinkedinPost(e.target.value)}
                        rows={17}
                      />
                    ) : (
                      <p>{linkedinPost}</p>
                    )}
                  </div>
                </div>

                {/* POST ACTIONS */}
                <div className={styles.postActions}>
                  <button
                    className={styles.secondaryButton}
                    onClick={() => setEditingPost(!editingPost)}
                  >
                    {editingPost ? "Save Changes" : "✏ Edit Post"}
                  </button>

                  <button
                    className={styles.secondaryButton}
                    onClick={regenerateLinkedInPost}
                  >
                    ↻ Regenerate
                  </button>

                  <button
                    className={styles.secondaryButton}
                    onClick={copyLinkedInPost}
                  >
                    {copied ? "✓ Copied" : "Copy Content"}
                  </button>

                  <button
                    className={styles.primaryButton}
                    onClick={openLinkedIn}
                  >
                    ↗ Copy & Open LinkedIn
                  </button>
                </div>

                <div className={styles.submitArea}>
                  <button
                    className={styles.outlineButton}
                    onClick={() => {
                      setActiveStep(2);

                      window.scrollTo({
                        top: 0,
                        behavior: "smooth",
                      });
                    }}
                  >
                    ← Back to Certificate
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* FOOTER */}
        <div className={styles.footer}>
          <strong>MAATRAM FOUNDATION</strong>

          <p>Making a difference, one volunteer at a time.</p>
        </div>
      </div>
    </div>
  );
};

export default StudentFeedback;
