import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Building2,
  ShieldCheck,
  MapPin,
  CalendarDays,
  Pencil,
  Save,
  X,
  Lock,
  RefreshCw,
} from "lucide-react";
import styles from "./AdminProfile.module.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const PROFILE_API = `${API_URL}/api/adminprofile`;

const emptyProfile = {
  name: "",
  email: "",
  phone: "",
  role: "",
  department: "",
  location: "",
  joinedOn: "",
};

function getErrorMessage(error) {
  if (error.response) {
    return (
      error.response.data?.message ||
      `Server error (${error.response.status}). Check the backend response.`
    );
  }

  if (error.request) {
    return "Cannot connect to the backend. Check whether your server is running.";
  }

  return error.message || "Something went wrong.";
}

export default function AdminProfile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(emptyProfile);
  const [originalProfile, setOriginalProfile] = useState(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchProfile = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await axios.get(PROFILE_API, {
        withCredentials: true,
      });

      const data =
        response.data?.admin ||
        response.data?.profile ||
        response.data;

      if (!data || typeof data !== "object") {
        throw new Error("Invalid profile data received from the server.");
      }

      const result = {
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || data.mobile || "",
        role: data.role || "Administrator",
        department: data.department || "",
        location: data.location || "",
        joinedOn: data.joinedOn || data.createdAt || "",
      };

      setProfile(result);
      setOriginalProfile(result);
    } catch (err) {
      console.error("Admin profile loading error:", err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEdit = () => {
    setError("");
    setSuccess("");
    setEditing(true);
  };

  const handleCancel = () => {
    setProfile(originalProfile);
    setEditing(false);
    setError("");
  };

  const handleSave = async () => {
    if (!profile.name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      // Only editable fields are sent to the backend.
      const response = await axios.put(
        PROFILE_API,
        {
          name: profile.name.trim(),
          department: profile.department.trim(),
          location: profile.location.trim(),
        },
        {
          withCredentials: true,
        }
      );

      const updatedData =
        response.data?.admin ||
        response.data?.profile ||
        response.data;

      const updatedProfile = {
        ...profile,
        ...(updatedData && typeof updatedData === "object"
          ? {
              name: updatedData.name ?? profile.name,
              department:
                updatedData.department ?? profile.department,
              location: updatedData.location ?? profile.location,
            }
          : {}),
      };

      setProfile(updatedProfile);
      setOriginalProfile(updatedProfile);
      setEditing(false);
      setSuccess("Profile updated successfully.");
    } catch (err) {
      console.error("Admin profile update error:", err);
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "Not available";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) return date;

    return parsed.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const initial = profile.name
    ? profile.name.charAt(0).toUpperCase()
    : "A";

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <header className={styles.header}>
          <button
            className={styles.backButton}
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </button>

          <div className={styles.heading}>
            <div>
              <span className={styles.eyebrow}>
                ADMINISTRATION
              </span>
              <h1>My Profile</h1>
              <p>
                View and manage your administrator account details.
              </p>
            </div>

            <div className={styles.security}>
              <ShieldCheck size={22} />
              <div>
                <strong>Admin Account</strong>
                <span>Account information</span>
              </div>
            </div>
          </div>
        </header>

        {/* Messages */}
        {error && (
          <div className={styles.errorMessage}>
            <span>{error}</span>
            <button onClick={fetchProfile} disabled={loading}>
              <RefreshCw size={15} />
              Retry
            </button>
          </div>
        )}

        {success && (
          <div className={styles.successMessage}>
            {success}
          </div>
        )}

        {loading ? (
          <div className={styles.loading}>
            <RefreshCw className={styles.spin} size={25} />
            <p>Loading administrator details...</p>
          </div>
        ) : (
          <div className={styles.layout}>
            {/* Left profile card */}
            <aside className={styles.sidebar}>
              <div className={styles.avatar}>
                {initial}
              </div>

              <h2>{profile.name || "Admin User"}</h2>

              <span className={styles.roleBadge}>
                <ShieldCheck size={15} />
                {profile.role || "Administrator"}
              </span>

              <div className={styles.sideDetails}>
                <div>
                  <Building2 size={18} />
                  <div>
                    <span>Department</span>
                    <strong>
                      {profile.department || "Not provided"}
                    </strong>
                  </div>
                </div>

                <div>
                  <MapPin size={18} />
                  <div>
                    <span>Location</span>
                    <strong>
                      {profile.location || "Not provided"}
                    </strong>
                  </div>
                </div>

                <div>
                  <CalendarDays size={18} />
                  <div>
                    <span>Member Since</span>
                    <strong>{formatDate(profile.joinedOn)}</strong>
                  </div>
                </div>
              </div>
            </aside>

            {/* Right form */}
            <main className={styles.formCard}>
              <div className={styles.formHeader}>
                <div>
                  <h2>Account Details</h2>
                  <p>
                    {editing
                      ? "Update your personal information below."
                      : "Your registered account information."}
                  </p>
                </div>

                {!editing ? (
                  <button
                    className={styles.editButton}
                    onClick={handleEdit}
                  >
                    <Pencil size={16} />
                    Edit Details
                  </button>
                ) : (
                  <span className={styles.editingLabel}>
                    Editing Profile
                  </span>
                )}
              </div>

              <div className={styles.formGrid}>
                {/* Editable */}
                <div className={styles.field}>
                  <label>Full Name</label>
                  <div className={styles.inputWrap}>
                    <User size={18} />
                    <input
                      name="name"
                      value={profile.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      disabled={!editing}
                    />
                  </div>
                </div>

                {/* Locked */}
                <div className={styles.field}>
                  <label>
                    Registered Email Address
                    <span className={styles.locked}>
                      <Lock size={12} /> Locked
                    </span>
                  </label>
                  <div className={`${styles.inputWrap} ${styles.lockedInput}`}>
                    <Mail size={18} />
                    <input
                      value={profile.email}
                      placeholder="Email not available"
                      disabled
                    />
                    <Lock size={15} />
                  </div>
                  <small>Registered email cannot be changed.</small>
                </div>

                {/* Locked */}
                <div className={styles.field}>
                  <label>
                    Registered Mobile Number
                    <span className={styles.locked}>
                      <Lock size={12} /> Locked
                    </span>
                  </label>
                  <div className={`${styles.inputWrap} ${styles.lockedInput}`}>
                    <Phone size={18} />
                    <input
                      value={profile.phone}
                      placeholder="Mobile number not available"
                      disabled
                    />
                    <Lock size={15} />
                  </div>
                  <small>Registered mobile cannot be changed.</small>
                </div>

                {/* Locked */}
                <div className={styles.field}>
                  <label>Administrator Role</label>
                  <div className={`${styles.inputWrap} ${styles.lockedInput}`}>
                    <ShieldCheck size={18} />
                    <input
                      value={profile.role}
                      disabled
                    />
                    <Lock size={15} />
                  </div>
                </div>

                {/* Editable */}
                <div className={styles.field}>
                  <label>Department</label>
                  <div className={styles.inputWrap}>
                    <Building2 size={18} />
                    <input
                      name="department"
                      value={profile.department}
                      onChange={handleChange}
                      placeholder="Enter your department"
                      disabled={!editing}
                    />
                  </div>
                </div>

                {/* Editable */}
                <div className={styles.field}>
                  <label>Location</label>
                  <div className={styles.inputWrap}>
                    <MapPin size={18} />
                    <input
                      name="location"
                      value={profile.location}
                      onChange={handleChange}
                      placeholder="Enter your location"
                      disabled={!editing}
                    />
                  </div>
                </div>
              </div>

              {editing && (
                <div className={styles.actions}>
                  <button
                    className={styles.cancelButton}
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    <X size={17} />
                    Cancel
                  </button>

                  <button
                    className={styles.saveButton}
                    onClick={handleSave}
                    disabled={saving}
                  >
                    <Save size={17} />
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              )}
            </main>
          </div>
        )}
      </div>
    </div>
  );
}