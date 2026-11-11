import React, { useState } from "react";
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
    label: "Business Professionals",
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

    // NEW: Controls who can see this volunteering event
    targetAudience: "students",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

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

    if (!form.targetAudience) {
      setError("Please select who this event is for.");
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

    const eventData = {
      ...form,

      volunteersNeeded: Number(form.volunteersNeeded),

      startAt: startAt.toISOString(),
      endAt: endAt.toISOString(),
    };

    console.log("Created Event:", eventData);


    try {
      const result = await createEvent(eventData);

      if (result.success) {
        alert(`Event created successfully!\nEvent ID: ${result.eventId}`);

        if (onSubmit) {
          onSubmit(result.event);
        }
      } else {
        setError(result.message || "Failed to create event");
      }

    } catch (error) {
      console.error("Create Event Error:", error);

      setError(
        error.response?.data?.message ||
        "Server connection failed"
      );
    }

  };

  return (
    <div className={styles.page}>
      {/* Hero */}


      {/* Form */}
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

        {/* ================= TARGET AUDIENCE ================= */}
        <section
          className={`${styles.band} ${styles.bandWhite}`}
        >
          <div className={styles.bandInner}>
            <h2 className={styles.sectionTitle}>
              Who Can Participate?
            </h2>

            <p className={styles.helper}>
              Select who should be able to see and participate
              in this volunteering event.
            </p>

            <div className={styles.formGrid}>
              <div
                className={`${styles.field} ${styles.fullWidth}`}
              >
                <label className={styles.label}>
                  Target Audience *
                </label>

                <select
                  name="targetAudience"
                  value={form.targetAudience}
                  onChange={handleChange}
                  className={styles.select}
                >
                  {TARGET_AUDIENCES.map((audience) => (
                    <option
                      key={audience.value}
                      value={audience.value}
                    >
                      {audience.label}
                    </option>
                  ))}
                </select>

                <span className={styles.helper}>
                  {TARGET_AUDIENCES.find(
                    (audience) =>
                      audience.value === form.targetAudience
                  )?.description}
                </span>
              </div>
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

                <input
                  type="time"
                  name="startTime"
                  value={form.startTime}
                  onChange={handleChange}
                  className={styles.input}
                />
              </div>

              {/* End Time */}
              <div className={styles.field}>
                <label className={styles.label}>
                  End Time *
                </label>

                <input
                  type="time"
                  name="endTime"
                  value={form.endTime}
                  onChange={handleChange}
                  className={styles.input}
                />
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

                {/* Zone */}
                {/* <div className={styles.field}>
                  <label className={styles.label}>
                    Zone *
                  </label>

                  <select
                    name="zone"
                    value={form.zone}
                    onChange={handleChange}
                    className={styles.select}
                  >
                    {ZONES.map((zone) => (
                      <option
                        key={zone}
                        value={zone}
                      >
                        {zone}
                      </option>
                    ))}
                  </select>
                </div> */}
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
                onClick={onCancel}
              >
                Cancel
              </button>

              <button
                type="submit"
                className={styles.createButton}
              >
                Create Event
              </button>
            </div>

          </div>
        </section>
      </form>
    </div>
  );
};

export default CreateEvent;


