import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import styles from "./StudentEventdetails.module.css";

const StudentEventdetails = () => {
   const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // QR / Camera states
  const [showQR, setShowQR] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Seat state (dynamic now)
  const [seatsLeft, setSeatsLeft] = useState(45);

  // Mock Data
  const eventData = {
    title: "Tech Innovation Summit 2025",
    category: "Technology",
    bannerUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1200",
    description: "Join us for an exciting day of innovation, learning, and networking with industry leaders. Explore cutting-edge technologies, participate in hands-on workshops, and connect with like-minded enthusiasts.",
    tags: ["AI", "Machine Learning", "Networking", "Workshop"],
    date: "Saturday, March 15, 2025",
    time: "10:00 AM - 5:00 PM",
    venue: "Convention Center, Hall A",
    address: "123 Innovation Drive, Tech City, CA 94043",
    price: "Free",
    totalSeats: 200,
    deadline: "Monday, March 10, 2025",
    agenda: [
      { time: "10:00 AM", title: "Registration & Welcome" },
      { time: "11:00 AM", title: "Keynote: The Future of AI" },
      { time: "01:00 PM", title: "Networking Lunch" },
      { time: "02:00 PM", title: "Hands-on Workshop" }
    ],
    speakers: [
      { name: "Jane Doe", role: "AI Researcher", img: "https://i.pravatar.cc/150?img=1" },
      { name: "John Smith", role: "CTO, TechCorp", img: "https://i.pravatar.cc/150?img=2" }
    ],
    organizer: {
      name: "Tech Community India",
      logo: "https://via.placeholder.com/50",
      link: "#"
    }
  };

  const handleFeedbackSubmit = () => {
    if (rating > 0) {
      setIsSubmitted(true);
      setTimeout(() => setIsSubmitted(false), 3000);
    }
  };

  // ✅ Open camera when QR modal opens
  const openQRModal = async () => {
    setShowQR(true);
    setCameraError('');
    await startCamera();
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' } // back camera on mobile
      });
      streamRef.current = stream;
      setCameraOn(true);
      // wait for video element to mount
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      }, 100);
    } catch (err) {
      setCameraOn(false);
      setCameraError(
        'Camera open aagala. Please allow camera permission or check your device.'
      );
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraOn(false);
  };

  const closeQRModal = () => {
    stopCamera();
    setShowQR(false);
  };

  // ✅ Simulate a successful QR scan → reduce free seat by 1
  const handleScanSuccess = () => {
    setSeatsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    closeQRModal();
    // optional: alert / toast
    alert('Registration successful! 1 seat booked 🎉');
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => stopCamera();
  }, []);

  // Progress width based on dynamic seats
  const bookedSeats = eventData.totalSeats - seatsLeft;
  const progressPercent = (bookedSeats / eventData.totalSeats) * 100;

  return (
    <div className={styles.container}>
      <button
  className={styles.backBtn}
  onClick={() => navigate("/student/event")}
>
  ← Back to Events
</button>
      {/* Banner */}
      <div className={styles.bannerWrapper}>
        <img src={eventData.bannerUrl} alt="Event Banner" className={styles.banner} />
        <div className={styles.bannerOverlay}>
          <span className={styles.category}>{eventData.category}</span>
          <h1 className={styles.title}>{eventData.title}</h1>
        </div>
      </div>

      {/* Info Cards */}
      <div className={styles.infoCards}>
        <div className={styles.infoCard}>
          <div className={styles.infoIcon}>📅</div>
          <div>
            <p className={styles.infoLabel}>Date</p>
            <p className={styles.infoValue}>{eventData.date}</p>
          </div>
        </div>
        <div className={styles.infoCard}>
          <div className={styles.infoIcon}>⏰</div>
          <div>
            <p className={styles.infoLabel}>Time</p>
            <p className={styles.infoValue}>{eventData.time}</p>
          </div>
        </div>
        <div className={styles.infoCard}>
          <div className={styles.infoIcon}>📍</div>
          <div>
            <p className={styles.infoLabel}>Venue</p>
            <p className={styles.infoValue}>{eventData.venue}</p>
          </div>
        </div>
        <div className={styles.infoCard}>
          <div className={styles.infoIcon}>🎟️</div>
          <div>
            <p className={styles.infoLabel}>Price</p>
            <p className={styles.infoValue}>{eventData.price}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className={styles.mainContent}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>About This Event</h2>
          <p className={styles.description}>{eventData.description}</p>
          <div className={styles.tags}>
            {eventData.tags.map((tag, index) => (
              <span key={index} className={styles.tag}>{tag}</span>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Event Agenda</h2>
          <div className={styles.timeline}>
            {eventData.agenda.map((item, index) => (
              <div key={index} className={styles.timelineItem}>
                <div className={styles.timelineDot}></div>
                <span className={styles.timelineTime}>{item.time}</span>
                <h3 className={styles.timelineTitle}>{item.title}</h3>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Speakers</h2>
          <div className={styles.speakersGrid}>
            {eventData.speakers.map((speaker, index) => (
              <div key={index} className={styles.speakerCard}>
                <img src={speaker.img} alt={speaker.name} className={styles.speakerImg} />
                <div>
                  <h3 className={styles.speakerName}>{speaker.name}</h3>
                  <p className={styles.speakerRole}>{speaker.role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Location</h2>
          <div className={styles.locationBox}>
            <p className={styles.address}>{eventData.address}</p>
            <div className={styles.mapPlaceholder}>📍 Interactive Map View</div>
          </div>
        </section>

        <div className={styles.stickyCard}>
          <div className={styles.priceRow}>
            
            
          </div>


          {/* ✅ QR button now opens camera */}
          <button className={styles.btnQR} onClick={openQRModal}>📱 Scan QR Code</button>

          <a href="#" className={styles.btnWhatsApp}>
            <span className={styles.whatsappIcon}>💬</span> Join WhatsApp Group
          </a>

          <div className={styles.feedbackBox}>
            <h3 className={styles.organizerTitle} style={{ marginBottom: '4px' }}>Event Feedback</h3>
            <p className={styles.feedbackSubtitle}>How was your experience?</p>
            <div className={styles.stars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  className={`${styles.star} ${rating >= star ? styles.starActive : ''}`}
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
              ></textarea>
              {isSubmitted ? (
                <div className={styles.successMsg}>Thank you for your feedback!</div>
              ) : (
                <button className={styles.btnSubmitFeedback} style={{ width: '100%', padding: '10px' }} onClick={handleFeedbackSubmit}>
                  Submit Feedback
                </button>
              )}
            </div>
          </div>

          <div className={styles.shareSection}>
            <p className={styles.shareLabel}>Share this event:</p>
            <div className={styles.shareButtons}></div>
            <button className={styles.btnLinkedInPost} style={{ width: '100%', justifyContent: 'center', marginTop: '12px' }}>
              <span className={styles.linkedinIcon}>in</span> Post on LinkedIn
            </button>
          </div>

          <div className={styles.organizerCard} style={{ marginTop: '0' }}>
            <h4 className={styles.organizerTitle}>Organizer</h4>
            <div className={styles.organizerInfo}>
              <img src={eventData.organizer.logo} alt="Organizer" className={styles.organizerLogo} />
              <div>
                <p className={styles.organizerName}>{eventData.organizer.name}</p>
                <a href={eventData.organizer.link} className={styles.organizerLink}>View Profile</a>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ✅ QR Modal with live camera */}
      {showQR && (
        <div className={styles.modalOverlay} onClick={closeQRModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={closeQRModal}>✕</button>
            <h2 className={styles.modalTitle}>Scan to Register</h2>
            <p className={styles.modalSubtitle}>Point your camera at the QR code</p>

            <div className={styles.qrWrapper}>
              {cameraError ? (
                <div style={{ padding: '16px', color: '#c00', textAlign: 'center' }}>
                  {cameraError}
                </div>
              ) : (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    width: '100%',
                    maxWidth: '320px',
                    borderRadius: '12px',
                    background: '#000'
                  }}
                />
              )}
            </div>

            {cameraOn && (
              <button className={styles.btnDownloadQR} onClick={handleScanSuccess}>
                ✅ Simulate Scan Success
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentEventdetails;