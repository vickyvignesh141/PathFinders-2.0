
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./CreateEvents.module.css";
import { createEvent } from "../../services/eventService";

const ZONES = ["Zone 1", "Zone 2", "Zone 3", "Zone 4"];

const TARGET_AUDIENCES = [
  {
    value: "students",
    label: "Students",
    description: "Show this event to students only",
  },
  {
    value: "alumni",
    label: "Alumni",
    description: "Show this event to alumni only",
  },
  {
    value: "business_professionals",
    label: "External Volunteers",
    description: "Show this event to business professionals only",
  },
  {
    value: "everyone",
    label: "Everyone",
    description: "Show this event to all users",
  },
];

const CreateEvent = ({ onSubmit, onCancel }) => {
  const today = new Date();
  const navigate = useNavigate();

  const defaultDate = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const [form, setForm] = useState({
    eventTitle: "",
    eventDescription: "",
    volunteerWork: "",
    location: "",
    date: defaultDate,
    startTime: "09:00",
    endTime: "17:00",
    instructions: "",
    volunteersNeeded: 10,
    zone: "Zone 1",
    eventMode: "offline",
    targetAudience: ["students"],
  });

  const EVENT_MODES = [
    { value: "online", label: "Online", icon: "🌐" },
    { value: "offline", label: "Offline", icon: "📍" },
  ];

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Convert 24-hour time into 12-hour parts
  const getTimeParts = (time) => {
    const [hour, minute] = time.split(":").map(Number);

    return {
      hour: String(hour % 12 || 12).padStart(2, "0"),
      minute: String(minute).padStart(2, "0"),
      period: hour >= 12 ? "PM" : "AM",
    };
  };

  // Update hour, minute or AM/PM
  const handleTimePartChange = (name, part, value) => {
    setForm((prev) => {
      const current = getTimeParts(prev[name]);

      const updated = {
        ...current,
        [part]: value,
      };

      const hour12 = Number(updated.hour);
      const minute = Number(updated.minute);

      const hour24 =
        updated.period === "PM"
          ? (hour12 % 12) + 12
          : hour12 % 12;

      return {
        ...prev,
        [name]: `${String(hour24).padStart(2, "0")}:${String(
          minute
        ).padStart(2, "0")}`,
      };
    });
  };

  // Target audience selection
  const handleAudienceChange = (value) => {
    setForm((prev) => {
      const selected = prev.targetAudience || [];

      // Everyone is exclusive
      if (value === "everyone") {
        return {
          ...prev,
          targetAudience: selected.includes("everyone")
            ? []
            : ["everyone"],
        };
      }

      const withoutEveryone = selected.filter(
        (item) => item !== "everyone"
      );

      // Deselect an already selected option
      if (withoutEveryone.includes(value)) {
        return {
          ...prev,
          targetAudience: withoutEveryone.filter(
            (item) => item !== value
          ),
        };
      }

      // Keep only the latest 2 selections
      const updated = [...withoutEveryone, value];

      return {
        ...prev,
        targetAudience:
          updated.length > 2 ? updated.slice(-2) : updated,
      };
    });
  };

  // Submit event
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.eventTitle.trim()) {
      setError("Please enter the event title.");
      return;
    }

    if (!form.eventDescription.trim()) {
      setError("Please enter the event description.");
      return;
    }

    if (!form.volunteerWork.trim()) {
      setError("Please describe the volunteer work.");
      return;
    }

    if (!form.location.trim()) {
      setError("Please enter the location.");
      return;
    }

    if (!form.instructions.trim()) {
      setError("Please enter the event instructions.");
      return;
    }

    if (!form.targetAudience.length) {
      setError("Please select at least one participant group.");
      return;
    }

    const startAt = new Date(
      `${form.date}T${form.startTime}:00`
    );

    const endAt = new Date(
      `${form.date}T${form.endTime}:00`
    );

    if (endAt <= startAt) {
      setError("End time must be after start time.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    const eventData = {
      ...form,
      targetAudience: form.targetAudience,
      eventMode: form.eventMode,
      volunteersNeeded: Number(form.volunteersNeeded),
      startAt: startAt.toISOString(),
      endAt: endAt.toISOString(),
    };

    console.log("Created Event:", eventData);

    try {
      const result = await createEvent(eventData);

      if (result.success) {
        alert(
          `Event created successfully!\nEvent ID: ${result.eventId}`
        );

        navigate("/admin/dashboard");
      } else {
        setError(result.message || "Failed to create event");
      }
    } catch (error) {
      console.error("Create Event Error:", error);

      setError(
        error.response?.data?.message ||
        "Server connection failed"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <form
        className={styles.form}
        onSubmit={handleSubmit}
      >
        {/* ================= EVENT DETAILS ================= */}
        <section
          className={`${styles.band} ${styles.bandYellow}`}
        >
          <div className={styles.bandInner}>
            <h2 className={styles.sectionTitle}>
              Event Details
            </h2>

            <div className={styles.formGrid}>
              {/* Event Title */}
              <div
                className={`${styles.field} ${styles.fullWidth}`}
              >
                <label className={styles.label}>
                  Event Title *
                </label>

                <input
                  type="text"
                  name="eventTitle"
                  value={form.eventTitle}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="e.g. Beach Cleanup Drive"
                />
              </div>

              {/* Event Description */}
              <div
                className={`${styles.field} ${styles.fullWidth}`}
              >
                <label className={styles.label}>
                  Event Description *
                </label>

                <textarea
                  name="eventDescription"
                  value={form.eventDescription}
                  onChange={handleChange}
                  className={styles.textarea}
                  rows="4"
                  placeholder="Explain what the event is about..."
                />
              </div>

              {/* Volunteer Work */}
              <div
                className={`${styles.field} ${styles.fullWidth}`}
              >
                <label className={styles.label}>
                  Volunteer Work *
                </label>

                <textarea
                  name="volunteerWork"
                  value={form.volunteerWork}
                  onChange={handleChange}
                  className={styles.textarea}
                  rows="4"
                  placeholder="Describe what volunteers will do during the event..."
                />

                <span className={styles.helper}>
                  Clearly explain the responsibilities and work
                  expected from volunteers.
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ================= EVENT MODE ================= */}
        <section
          className={`${styles.band} ${styles.bandWhite}`}
        >
          <div className={styles.bandInner}>
            <h2 className={styles.sectionTitle}>
              Event Mode *
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "12px",
                marginTop: "12px",
              }}
            >
              {EVENT_MODES.map((mode) => (
                <button
                  key={mode.value}
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      eventMode: mode.value,
                    }))
                  }
                  style={{
                    padding: "18px",
                    borderRadius: "10px",
                    border:
                      form.eventMode === mode.value
                        ? "2px solid #16a34a"
                        : "1px solid #ddd",
                    background:
                      form.eventMode === mode.value
                        ? "#f0fdf4"
                        : "#fff",
                    cursor: "pointer",
                    fontSize: "16px",
                    fontWeight: "700",
                  }}
                >
                  {mode.icon} {mode.label}
                  {form.eventMode === mode.value && " ✓"}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ================= TARGET AUDIENCE ================= */}
        <section
          className={`${styles.band} ${styles.bandYellow}`}
        >
          <div className={styles.bandInner}>
            <h2 className={styles.sectionTitle}>
              Target Audience *
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: "16px",
                marginTop: "20px",
                background: "#FFF8E6",
                padding: "20px",
                borderRadius: "12px",
              }}
            >
              {TARGET_AUDIENCES.map((audience) => (
                <label
                  key={audience.value}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    padding: "24px",
                    minHeight: "100px",
                    border: form.targetAudience.includes(audience.value)
                      ? "2px solid #D6A52A"
                      : "1px solid #E5D8B5",
                    borderRadius: "12px",
                    background: form.targetAudience.includes(audience.value)
                      ? "#FFF0C2"
                      : "#FFFCF4",
                    cursor: "pointer",
                    boxSizing: "border-box",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={form.targetAudience.includes(audience.value)}
                    onChange={() =>
                      handleAudienceChange(audience.value)
                    }
                  />

                  <div>
                    <strong style={{ fontSize: "17px" }}>
                      {audience.label}
                    </strong>

                    <div className={styles.helper}>
                      {audience.description}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </section>

        {/* ================= LOCATION & SCHEDULE ================= */}
        <section
          className={`${styles.band} ${styles.bandYellow}`}
        >
          <div className={styles.bandInner}>
            <h2 className={styles.sectionTitle}>
              Location & Schedule
            </h2>

            <div className={styles.formGrid}>
              {/* Location */}
              <div
                className={`${styles.field} ${styles.fullWidth}`}
              >
                <label className={styles.label}>
                  Location *
                </label>

                <input
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="e.g. Marina Beach, Chennai"
                />
              </div>

              {/* Date */}
              <div className={styles.field}>
                <label className={styles.label}>
                  Date *
                </label>

                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  className={styles.input}
                />
              </div>

              {/* Start Time */}
              <div className={styles.field}>
                <label className={styles.label}>
                  Start Time *
                </label>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: "8px",
                  }}
                >
                  <select
                    className={styles.input}
                    value={getTimeParts(form.startTime).hour}
                    onChange={(e) =>
                      handleTimePartChange(
                        "startTime",
                        "hour",
                        e.target.value
                      )
                    }
                  >
                    {Array.from({ length: 12 }, (_, i) => {
                      const h = String(i + 1).padStart(2, "0");

                      return (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      );
                    })}
                  </select>

                  <select
                    className={styles.input}
                    value={getTimeParts(form.startTime).minute}
                    onChange={(e) =>
                      handleTimePartChange(
                        "startTime",
                        "minute",
                        e.target.value
                      )
                    }
                  >
                    {Array.from({ length: 60 }, (_, i) => {
                      const m = String(i).padStart(2, "0");

                      return (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      );
                    })}
                  </select>

                  <select
                    className={styles.input}
                    value={getTimeParts(form.startTime).period}
                    onChange={(e) =>
                      handleTimePartChange(
                        "startTime",
                        "period",
                        e.target.value
                      )
                    }
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
              </div>

              {/* End Time */}
              <div className={styles.field}>
                <label className={styles.label}>
                  End Time *
                </label>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: "8px",
                  }}
                >
                  <select
                    className={styles.input}
                    value={getTimeParts(form.endTime).hour}
                    onChange={(e) =>
                      handleTimePartChange(
                        "endTime",
                        "hour",
                        e.target.value
                      )
                    }
                  >
                    {Array.from({ length: 12 }, (_, i) => {
                      const h = String(i + 1).padStart(2, "0");

                      return (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      );
                    })}
                  </select>

                  <select
                    className={styles.input}
                    value={getTimeParts(form.endTime).minute}
                    onChange={(e) =>
                      handleTimePartChange(
                        "endTime",
                        "minute",
                        e.target.value
                      )
                    }
                  >
                    {Array.from({ length: 60 }, (_, i) => {
                      const m = String(i).padStart(2, "0");

                      return (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      );
                    })}
                  </select>

                  <select
                    className={styles.input}
                    value={getTimeParts(form.endTime).period}
                    onChange={(e) =>
                      handleTimePartChange(
                        "endTime",
                        "period",
                        e.target.value
                      )
                    }
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= VOLUNTEER REQUIREMENTS ================= */}
        <section
          className={`${styles.band} ${styles.bandYellow}`}
        >
          <div className={styles.bandInner}>
            <h2 className={styles.sectionTitle}>
              Volunteer Requirements
            </h2>

            <div className={styles.sectionBody}>
              <div className={styles.formGrid}>
                {/* Number of Volunteers */}
                <div className={styles.field}>
                  <label className={styles.label}>
                    Number of Volunteers Needed *
                  </label>

                  <input
                    type="number"
                    name="volunteersNeeded"
                    min="1"
                    value={form.volunteersNeeded}
                    onChange={handleChange}
                    className={styles.input}
                  />
                </div>
              </div>

              {/* Zone Buttons */}
              <div className={styles.zoneSection}>
                <span className={styles.label}>
                  Select Event Zone
                </span>

                <div className={styles.zoneGrid}>
                  {ZONES.map((zone) => (
                    <button
                      type="button"
                      key={zone}
                      className={`${styles.zoneButton} ${form.zone === zone
                          ? styles.zoneActive
                          : ""
                        }`}
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          zone,
                        }))
                      }
                    >
                      {zone}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= EVENT INSTRUCTIONS ================= */}
        <section
          className={`${styles.band} ${styles.bandWhite}`}
        >
          <div className={styles.bandInner}>
            <h2 className={styles.sectionTitle}>
              Event Instructions
            </h2>

            <div className={styles.field}>
              <label className={styles.label}>
                Instructions for Volunteers *
              </label>

              <textarea
                name="instructions"
                value={form.instructions}
                onChange={handleChange}
                className={styles.textarea}
                rows="5"
                placeholder="Example: Volunteers must report 15 minutes before the event. Wear comfortable clothes and carry a water bottle..."
              />

              <span className={styles.helper}>
                Add reporting time, dress code, things to bring,
                safety instructions, or other important information.
              </span>
            </div>

            {/* Error Message */}
            {error && (
              <div className={styles.error}>
                {error}
              </div>
            )}

            {/* Action Buttons */}
            <div className={styles.actions}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={() => navigate("/admin/dashboard")}
              >
                Cancel
              </button>

              <button
                type="submit"
                className={styles.createButton}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create Event"}
              </button>
            </div>
          </div>
        </section>
      </form>
    </div>
  );
};

export default CreateEvent;
