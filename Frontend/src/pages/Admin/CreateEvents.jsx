import React, { useState } from "react";
import styles from "./CreateEvents.module.css";

const ZONES = ["Zone 1", "Zone 2", "Zone 3", "Zone 4"];

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
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async(e) => {
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
    const response = await fetch("http://localhost:5000/api/events/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(eventData)
    });

    const result = await response.json();

    if (result.success) {
        alert("Event created successfully!");
        if (onSubmit) onSubmit(eventData);
    } else {
        setError(result.message);
    }

} catch (error) {
    console.error(error);
    setError("Server connection failed");
}
  };

  return (
    <div className={styles.page}>

      {/* Hero (black band) */}
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroText}>
            <p className={styles.eyebrow}>MAATRAM VOLUNTEERING</p>
            <h1 className={styles.title}>Create Event</h1>
            <p className={styles.subtitle}>
              Create a volunteering event and provide all the
              details volunteers need.
            </p>
          </div>

          <div className={styles.heroTag}>
            <span className={styles.tagYou}>YOU</span>
            <span className={styles.tagLine}>Can Be The Change</span>
          </div>
        </div>
      </header>

      {/* Form */}
      <form className={styles.form} onSubmit={handleSubmit}>

        {/* Event Basic Details */}
        <section className={`${styles.band} ${styles.bandYellow}`}>
          <div className={styles.bandInner}>
            <h2 className={styles.sectionTitle}>
              Event Details
            </h2>

            <div className={styles.formGrid}>

              {/* Event Title */}
              <div className={`${styles.field} ${styles.fullWidth}`}>
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
              <div className={`${styles.field} ${styles.fullWidth}`}>
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
              <div className={`${styles.field} ${styles.fullWidth}`}>
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

        {/* Location & Schedule */}
        <section className={`${styles.band} ${styles.bandWhite}`}>
          <div className={styles.bandInner}>
            <h2 className={styles.sectionTitle}>
              Location & Schedule
            </h2>

            <div className={styles.formGrid}>

              {/* Location */}
              <div className={`${styles.field} ${styles.fullWidth}`}>
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

        {/* Volunteer Requirements */}
        <section className={`${styles.band} ${styles.bandYellow}`}>
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
                <div className={styles.field}>
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
                      <option key={zone} value={zone}>
                        {zone}
                      </option>
                    ))}
                  </select>
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
                      className={`${styles.zoneButton} ${
                        form.zone === zone
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

        {/* Instructions */}
        <section className={`${styles.band} ${styles.bandWhite}`}>
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
          </div>
        </section>

        {/* Error + Buttons (black band) */}
        <div className={styles.actionsBand}>
          <div className={styles.actionsInner}>

            {/* Error */}
            {error && (
              <div className={styles.error}>
                {error}
              </div>
            )}

            {/* Buttons */}
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
        </div>

      </form>
    </div>
  );
};

export default CreateEvent;