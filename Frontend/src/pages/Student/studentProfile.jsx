
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./StudentProfile.module.css";
import { saveStudentProfile } from "../../services/profileService";

const initialProfile = {
  fullName: "",
  profilePhoto: "",
  dob: "",
  gender: "",
  location: "",
  mobile: "",
  email: "",
  college: "",
  collegeLocation: "",
  zone: "",
  department: "",
  degree: "",
  year: "",
  batch: "",
  accommodation: "",
  linkedin: "",
};

const StudentProfile = () => {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(initialProfile);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);

  // Clean up preview URL
  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  // Handle Input Changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle Profile Photo Upload
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image.");
      e.target.value = "";
      return;
    }

    setProfile((prev) => ({
      ...prev,
      profilePhoto: file,
    }));

    setPreview(URL.createObjectURL(file));
  };

  // Handle Profile Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    const username = localStorage.getItem("username");

    if (!username) {
      alert("Please login again to save your profile.");
      return;
    }

    try {
      setSaving(true);

      const response = await saveStudentProfile(username, profile);

      if (response.success) {
        alert("Student profile saved successfully!");
      } else {
        alert(response.message || "Unable to save profile.");
      }
    } catch (error) {
      console.error("Profile save error:", error);

      alert(
        error.response?.data?.message ||
        "Something went wrong while saving your profile."
      );
    } finally {
      setSaving(false);
    }
  };

  // Reset Profile
  const handleReset = () => {
    setProfile({ ...initialProfile });
    setPreview(null);
  };

  return (
    <div className={styles.profilePage}>
      <div className={styles.profileContainer}>

        {/* Page Header */}
        <div
          className={styles.pageHeader}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          <div>
            <h1>Student Profile</h1>
            <p>Manage your personal and academic information</p>
          </div>

          {/* Back to Dashboard */}
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

        <form onSubmit={handleSubmit}>

          {/* Profile Photo */}
          <div className={styles.photoSection}>
            <div className={styles.photoPreview}>
              {preview ? (
                <img src={preview} alt="Student Profile" />
              ) : (
                <span>👤</span>
              )}
            </div>

            <div className={styles.photoContent}>
              <h3>Profile Photo</h3>
              <p>Upload your profile picture</p>

              <label className={styles.uploadButton}>
                Upload Photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  hidden
                />
              </label>
            </div>
          </div>

          {/* Personal Information */}
          <section className={styles.formSection}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionIcon}>01</span>
              <div>
                <h2>Personal Information</h2>
                <p>Your basic personal details</p>
              </div>
            </div>

            <div className={styles.formGrid}>

              <div className={styles.formGroup}>
                <label>Student Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  placeholder="Enter your full name"
                  value={profile.fullName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Date of Birth *</label>
                <input
                  type="date"
                  name="dob"
                  value={profile.dob}
                  onChange={handleChange}
                  max={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Gender *</label>
                <select
                  name="gender"
                  value={profile.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Location */}
              <div className={styles.formGroup}>
                <label>Location *</label>
                <input
                  type="text"
                  name="location"
                  placeholder="Enter your location / city"
                  value={profile.location}
                  onChange={handleChange}
                  required
                />
              </div>

            </div>
          </section>

          {/* Contact Information */}
          <section className={styles.formSection}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionIcon}>02</span>
              <div>
                <h2>Contact Information</h2>
                <p>Your communication details</p>
              </div>
            </div>

            <div className={styles.formGrid}>

              <div className={styles.formGroup}>
                <label>Mobile Number *</label>
                <input
                  type="tel"
                  name="mobile"
                  placeholder="Enter mobile number"
                  value={profile.mobile}
                  onChange={handleChange}
                  pattern="[0-9]{10}"
                  maxLength="10"
                  title="Enter a valid 10-digit mobile number"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Email Address *</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter email address"
                  value={profile.email}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* LinkedIn Profile */}
              <div className={styles.formGroup}>
                <label>LinkedIn Profile</label>
                <input
                  type="url"
                  name="linkedin"
                  placeholder="https://www.linkedin.com/in/yourname"
                  value={profile.linkedin}
                  onChange={handleChange}
                />
              </div>

            </div>
          </section>

          {/* Academic Information */}
          <section className={styles.formSection}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionIcon}>03</span>
              <div>
                <h2>Academic Information</h2>
                <p>Your college and education details</p>
              </div>
            </div>

            <div className={styles.formGrid}>

              <div className={styles.formGroup}>
                <label>College Name *</label>
                <input
                  type="text"
                  name="college"
                  placeholder="Enter college name"
                  value={profile.college}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* College Location */}
              <div className={styles.formGroup}>
                <label>College Location *</label>
                <input
                  type="text"
                  name="collegeLocation"
                  placeholder="Enter college location / city"
                  value={profile.collegeLocation}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Zone */}
              <div className={styles.formGroup}>
                <label>Zone *</label>
                <select
                  name="zone"
                  value={profile.zone}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Zone</option>
                  <option value="Zone-1">Zone-1</option>
                  <option value="Zone-2">Zone-2</option>
                  <option value="Zone-3">Zone-3</option>
                  <option value="Zone-4">Zone-4</option>
                </select>
              </div>

              {/* Department */}
              <div className={styles.formGroup}>
                <label>Department *</label>
                <select
                  name="department"
                  value={profile.department}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Department</option>
                  <option value="Computer Science">
                    Computer Science
                  </option>
                  <option value="Information Technology">
                    Information Technology
                  </option>
                  <option value="Electronics and Communication">
                    Electronics and Communication
                  </option>
                  <option value="Electrical and Electronics">
                    Electrical and Electronics
                  </option>
                  <option value="Mechanical">Mechanical</option>
                  <option value="Civil">Civil</option>
                  <option value="Artificial Intelligence">
                    Artificial Intelligence
                  </option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Degree */}
              <div className={styles.formGroup}>
                <label>Degree / Course *</label>
                <select
                  name="degree"
                  value={profile.degree}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Degree</option>
                  <option value="B.E">B.E</option>
                  <option value="B.Tech">B.Tech</option>
                  <option value="B.Sc">B.Sc</option>
                  <option value="BCA">BCA</option>
                  <option value="BBA">BBA</option>
                  <option value="M.E">M.E</option>
                  <option value="M.Tech">M.Tech</option>
                  <option value="M.Sc">M.Sc</option>
                  <option value="MCA">MCA</option>
                  <option value="MBA">MBA</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Year */}
              <div className={styles.formGroup}>
                <label>Year of Study *</label>
                <select
                  name="year"
                  value={profile.year}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Year</option>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
              </div>

              {/* Academic Batch */}
              <div className={styles.formGroup}>
                <label>Academic Batch *</label>
                <select
                  name="batch"
                  value={profile.batch}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Academic Batch</option>

                  {Array.from({ length: 5 }, (_, i) => {
                    const start = 2023 + i;
                    const end = start + 4;

                    return (
                      <option key={start} value={`${start}-${end}`}>
                        {start} - {end}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Accommodation Type */}
              <div className={styles.formGroup}>
                <label>Accommodation Type *</label>
                <select
                  name="accommodation"
                  value={profile.accommodation}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Accommodation Type</option>
                  <option value="Hosteller">Hosteller</option>
                  <option value="Day Scholar">Day Scholar</option>
                </select>
              </div>

            </div>
          </section>

          {/* Form Buttons */}
          <div className={styles.formActions}>

            <button
              type="reset"
              className={styles.cancelButton}
              onClick={handleReset}
            >
              Reset
            </button>

            <button
              type="submit"
              className={styles.saveButton}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Profile"}
            </button>

          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentProfile;
