
import React, { useState, useMemo, useEffect } from "react";
import {
  Trophy,
  Medal,
  Flame,
  Star,
  Award,
  Zap,
  Filter,
  Search,
  MapPin,
  ChevronLeft,
  X,
  RefreshCw,
} from "lucide-react";
import styles from "./Leaderboard.module.css";
import { getLeaderboard } from "../../services/eventService";

// =====================================
// BADGES CONFIGURATION
// =====================================
const BADGES = {
  mvp: { icon: Trophy, color: "#ffcc00", label: "MVP" },
  streak: { icon: Flame, color: "#ff5722", label: "Hot Streak" },
  speed: { icon: Zap, color: "#00d2ff", label: "Quick Responder" },
  star: { icon: Star, color: "#9c27b0", label: "5-Star Rating" },
};

// =====================================
// HELPERS
// =====================================
const calculateLevel = (xp) => Math.floor(xp / 1000) + 1;

const calculateProgress = (xp) => (xp % 1000) / 10;

const formatNumber = (value) =>
  Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  });

// Convert backend response into the format used by the UI
const formatVolunteer = (student) => {
  const pastEvents = Array.isArray(student.pastVolunteeringEvents)
    ? student.pastVolunteeringEvents
    : [];

  return {
    id: student.username,
    name: student.name || "Unknown",
    rollNo: student.rollNo || student.username || "-",
    department: student.department || "-",
    college: student.college || "-",

    zone:
      student.zone !== undefined && student.zone !== null && student.zone !== ""
        ? `Zone ${String(student.zone).replace(/^Zone\s*/i, "")}`
        : "-",

    batch: student.batch || "-",

    // Total points including historical and new QR points
    xp: Number(student.points || 0),
    points: Number(student.points || 0),

    pastPoints: Number(student.pastPoints || 0),
    newPoints: Number(student.newPoints || 0),

    pastHours: Number(student.pastHours || 0),
    newVerifiedHours: Number(student.newVerifiedHours || 0),
    verifiedHours: Number(student.verifiedHours || 0),
    regularHours: Number(student.regularHours || 0),

    physicalVerificationCount: Number(
      student.physicalVerificationCount || 0
    ),

    physicalVerificationHours: Number(
      student.physicalVerificationHours || 0
    ),

    // Historical event names supplied by the backend
    eventsAttended: pastEvents.map((event) => event.event_name),

    // Total event count supplied by the backend
    totalEventsAttended: Number(student.eventsAttended || 0),

    // These fields are not currently supplied by the backend
    rating: null,
    badges: [],

    rank: student.rank || 0,
  };
};

// =====================================
// RANK BADGE
// =====================================
const RankBadge = ({ rank }) => {
  if (rank === 1) {
    return (
      <div className={`${styles.rankBadge} ${styles.gold}`}>
        <Trophy size={16} />
      </div>
    );
  }

  if (rank === 2) {
    return (
      <div className={`${styles.rankBadge} ${styles.silver}`}>
        <Medal size={16} />
      </div>
    );
  }

  if (rank === 3) {
    return (
      <div className={`${styles.rankBadge} ${styles.bronze}`}>
        <Medal size={16} />
      </div>
    );
  }

  return (
    <div className={`${styles.rankBadge} ${styles.standard}`}>
      {rank}
    </div>
  );
};

// =====================================
// MAIN LEADERBOARD COMPONENT
// =====================================
const Leaderboard = ({ onBack }) => {
  const [volunteers, setVolunteers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
    zone: "All Zones",
    college: "All Colleges",
    batch: "All Batches",
    event: "All Events",
    search: "",
  });

  const [selectedVolunteer, setSelectedVolunteer] = useState(null);

  // =====================================
  // FETCH LEADERBOARD FROM BACKEND
  // =====================================
  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getLeaderboard();

      if (!response.success) {
        throw new Error(
          response.message || "Unable to load leaderboard"
        );
      }

      const formattedData = (response.leaderboard || []).map(
        formatVolunteer
      );

      setVolunteers(formattedData);
    } catch (err) {
      console.error("Leaderboard fetch error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load leaderboard. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  // =====================================
  // DYNAMIC FILTER OPTIONS
  // =====================================
  const zones = useMemo(() => {
    const values = volunteers
      .map((v) => v.zone)
      .filter((value) => value && value !== "-");

    return ["All Zones", ...new Set(values)];
  }, [volunteers]);

  const colleges = useMemo(() => {
    const values = volunteers
      .map((v) => v.college)
      .filter((value) => value && value !== "-");

    return ["All Colleges", ...new Set(values)];
  }, [volunteers]);

  const batches = useMemo(() => {
    const values = volunteers
      .map((v) => v.batch)
      .filter((value) => value && value !== "-");

    return ["All Batches", ...new Set(values)];
  }, [volunteers]);

  const events = useMemo(() => {
    const values = volunteers.flatMap((v) => v.eventsAttended);

    return ["All Events", ...new Set(values)];
  }, [volunteers]);

  // =====================================
  // FILTER AND SORT
  // =====================================
  const filteredLeaderboard = useMemo(() => {
    let result = volunteers.filter((v) => {
      const matchZone =
        filters.zone === "All Zones" || v.zone === filters.zone;

      const matchCollege =
        filters.college === "All Colleges" ||
        v.college === filters.college;

      const matchBatch =
        filters.batch === "All Batches" ||
        v.batch === filters.batch;

      const matchEvent =
        filters.event === "All Events" ||
        v.eventsAttended.includes(filters.event);

      const searchText = filters.search.toLowerCase();

      const matchSearch =
        v.name.toLowerCase().includes(searchText) ||
        v.rollNo.toLowerCase().includes(searchText) ||
        v.department.toLowerCase().includes(searchText);

      return (
        matchZone &&
        matchCollege &&
        matchBatch &&
        matchEvent &&
        matchSearch
      );
    });

    return result.sort((a, b) => b.xp - a.xp);
  }, [volunteers, filters]);

  const top3 = filteredLeaderboard.slice(0, 3);
  const rest = filteredLeaderboard.slice(3);

  // =====================================
  // FILTER HANDLER
  // =====================================
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const resetFilters = () => {
    setFilters({
      zone: "All Zones",
      college: "All Colleges",
      batch: "All Batches",
      event: "All Events",
      search: "",
    });
  };

  // =====================================
  // LOADING STATE
  // =====================================
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <RefreshCw size={35} className={styles.emptyIcon} />
          <h3>Loading Leaderboard...</h3>
          <p>Fetching volunteer points and achievements.</p>
        </div>
      </div>
    );
  }

  // =====================================
  // ERROR STATE
  // =====================================
  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <X size={40} className={styles.emptyIcon} />
          <h3>Unable to Load Leaderboard</h3>
          <p>{error}</p>

          <button
            className={styles.resetBtn}
            onClick={fetchLeaderboard}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // =====================================
  // MAIN UI
  // =====================================
  return (
    <div className={styles.container}>
      {/* BACK BUTTON */}
      {onBack && (
        <button className={styles.backBtn} onClick={onBack}>
          <ChevronLeft size={16} />
          Back to Dashboard
        </button>
      )}

      {/* HEADER */}
      <header className={styles.header}>
        <div className={styles.headerTitles}>
          <h1 className={styles.pageTitle}>
            <Award className={styles.titleIcon} size={28} />
            Hall of Fame
          </h1>

          <p className={styles.pageSubtitle}>
            Top volunteers making a real difference
          </p>
        </div>
      </header>

      {/* FILTER BAR */}
      <div className={styles.filterBar}>
        <div className={styles.searchBox}>
          <Search size={16} className={styles.searchIcon} />

          <input
            type="text"
            placeholder="Search volunteers..."
            value={filters.search}
            onChange={(e) =>
              handleFilterChange("search", e.target.value)
            }
            className={styles.searchInput}
          />
        </div>

        <div className={styles.dropdowns}>
          <select
            value={filters.zone}
            onChange={(e) =>
              handleFilterChange("zone", e.target.value)
            }
            className={styles.select}
          >
            {zones.map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </select>

          <select
            value={filters.college}
            onChange={(e) =>
              handleFilterChange("college", e.target.value)
            }
            className={styles.select}
          >
            {colleges.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={filters.batch}
            onChange={(e) =>
              handleFilterChange("batch", e.target.value)
            }
            className={styles.select}
          >
            {batches.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>

          <select
            value={filters.event}
            onChange={(e) =>
              handleFilterChange("event", e.target.value)
            }
            className={styles.select}
          >
            {events.map((event) => (
              <option key={event} value={event}>
                {event}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* EMPTY STATE */}
      {filteredLeaderboard.length === 0 ? (
        <div className={styles.emptyState}>
          <Filter size={48} className={styles.emptyIcon} />

          <h3>No volunteers found</h3>

          <p>
            Try adjusting your filters to see the leaderboard.
          </p>

          <button
            onClick={resetFilters}
            className={styles.resetBtn}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <>
          {/* TOP 3 PODIUM */}
          {top3.length > 0 && (
            <div className={styles.podiumContainer}>
              {/* RANK 2 */}
              {top3[1] && (
                <div
                  className={`${styles.podiumItem} ${styles.rank2}`}
                  onClick={() => setSelectedVolunteer(top3[1])}
                >
                  <div className={styles.podiumAvatarWrap}>
                    <div className={styles.avatar}>
                      {top3[1].name.charAt(0)}
                    </div>

                    <div className={styles.podiumBadge}>
                      <Medal size={14} />
                    </div>
                  </div>

                  <h3 className={styles.podiumName}>
                    {top3[1].name}
                  </h3>

                  <p className={styles.podiumXP}>
                    {formatNumber(top3[1].xp)} XP
                  </p>

                  <div className={styles.podiumBase}>2</div>
                </div>
              )}

              {/* RANK 1 */}
              {top3[0] && (
                <div
                  className={`${styles.podiumItem} ${styles.rank1}`}
                  onClick={() => setSelectedVolunteer(top3[0])}
                >
                  <div className={styles.podiumAvatarWrap}>
                    <div className={styles.avatar}>
                      {top3[0].name.charAt(0)}
                    </div>

                    <div className={styles.crown}>
                      <Trophy size={20} />
                    </div>
                  </div>

                  <h3 className={styles.podiumName}>
                    {top3[0].name}
                  </h3>

                  <p className={styles.podiumXP}>
                    {formatNumber(top3[0].xp)} XP
                  </p>

                  <div className={styles.podiumBase}>1</div>
                </div>
              )}

              {/* RANK 3 */}
              {top3[2] && (
                <div
                  className={`${styles.podiumItem} ${styles.rank3}`}
                  onClick={() => setSelectedVolunteer(top3[2])}
                >
                  <div className={styles.podiumAvatarWrap}>
                    <div className={styles.avatar}>
                      {top3[2].name.charAt(0)}
                    </div>

                    <div className={styles.podiumBadge}>
                      <Medal size={14} />
                    </div>
                  </div>

                  <h3 className={styles.podiumName}>
                    {top3[2].name}
                  </h3>

                  <p className={styles.podiumXP}>
                    {formatNumber(top3[2].xp)} XP
                  </p>

                  <div className={styles.podiumBase}>3</div>
                </div>
              )}
            </div>
          )}

          {/* REMAINING LEADERBOARD */}
          {rest.length > 0 && (
            <div className={styles.listContainer}>
              <div className={styles.listHeader}>
                <div className={styles.colRank}>Rank</div>
                <div className={styles.colVolunteer}>Volunteer</div>
                <div className={styles.colLevel}>
                  Level & Progress
                </div>
                <div className={styles.colBadges}>
                  Achievements
                </div>
                <div className={styles.colXP}>Total XP</div>
              </div>

              <div className={styles.listBody}>
                {rest.map((volunteer, index) => {
                  const rank = index + 4;
                  const level = calculateLevel(volunteer.xp);
                  const progress = calculateProgress(volunteer.xp);

                  return (
                    <div
                      key={volunteer.id}
                      className={styles.listRow}
                      style={{ "--stagger": index }}
                      onClick={() =>
                        setSelectedVolunteer(volunteer)
                      }
                    >
                      {/* RANK */}
                      <div className={styles.colRank}>
                        <RankBadge rank={rank} />
                      </div>

                      {/* VOLUNTEER */}
                      <div className={styles.colVolunteer}>
                        <div className={styles.listAvatar}>
                          {volunteer.name.charAt(0)}
                        </div>

                        <div className={styles.volunteerInfo}>
                          <h4 className={styles.volunteerName}>
                            {volunteer.name}
                          </h4>

                          <span className={styles.volunteerMeta}>
                            <MapPin
                              size={10}
                              className={styles.inlineIcon}
                            />

                            {volunteer.zone} · {volunteer.college}
                          </span>
                        </div>
                      </div>

                      {/* LEVEL */}
                      <div className={styles.colLevel}>
                        <div className={styles.levelInfo}>
                          <span className={styles.levelBadge}>
                            Lvl {level}
                          </span>

                          <span className={styles.levelNext}>
                            Lvl {level + 1}
                          </span>
                        </div>

                        <div className={styles.progressBarBg}>
                          <div
                            className={styles.progressBarFill}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      {/* BADGES */}
                      <div className={styles.colBadges}>
                        <div className={styles.badgesWrapper}>
                          {volunteer.badges.map((badgeKey) => {
                            const badge = BADGES[badgeKey];

                            if (!badge) return null;

                            const BadgeIcon = badge.icon;

                            return (
                              <div
                                key={badgeKey}
                                className={styles.miniBadge}
                                title={badge.label}
                                style={{
                                  color: badge.color,
                                  backgroundColor: `${badge.color}15`,
                                }}
                              >
                                <BadgeIcon size={14} />
                              </div>
                            );
                          })}

                          {volunteer.badges.length === 0 && (
                            <span className={styles.noBadges}>-</span>
                          )}
                        </div>
                      </div>

                      {/* XP */}
                      <div className={styles.colXP}>
                        <span className={styles.xpText}>
                          {formatNumber(volunteer.xp)}
                        </span>

                        <span className={styles.xpLabel}>XP</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* PROFILE POPUP */}
      {selectedVolunteer && (
        <div
          className={styles.modalOverlay}
          onClick={() => setSelectedVolunteer(null)}
        >
          <div
            className={styles.profileModal}
            onClick={(e) => e.stopPropagation()}
          >
            {/* MODAL HEADER */}
            <div className={styles.modalHead}>
              <div className={styles.profileHeaderInfo}>
                <div className={styles.avatarLg}>
                  {selectedVolunteer.name.charAt(0)}
                </div>

                <div>
                  <h3 className={styles.modalTitle}>
                    {selectedVolunteer.name}
                  </h3>

                  <p className={styles.modalSub}>
                    {selectedVolunteer.rollNo} ·{" "}
                    {selectedVolunteer.department}
                  </p>
                </div>
              </div>

              <button
                className={styles.modalClose}
                onClick={() => setSelectedVolunteer(null)}
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            {/* MODAL BODY */}
            <div className={styles.modalBody}>
              {/* MAIN STATS */}
              <div className={styles.profileStatsRow}>
                <div className={styles.profileStatBox}>
                  <strong>
                    Lvl {calculateLevel(selectedVolunteer.xp)}
                  </strong>
                  <span>Current Level</span>
                </div>

                <div className={styles.profileStatDivider} />

                <div className={styles.profileStatBox}>
                  <strong style={{ color: "#ffcc00" }}>
                    {formatNumber(selectedVolunteer.xp)}
                  </strong>
                  <span>Total XP</span>
                </div>

                <div className={styles.profileStatDivider} />

                <div className={styles.profileStatBox}>
                  <strong>
                    {selectedVolunteer.totalEventsAttended}
                  </strong>
                  <span>Events Attended</span>
                </div>
              </div>

              {/* PROFILE DETAILS */}
              <div className={styles.profileGrid}>
                <div className={styles.profileRow}>
                  <span className={styles.profileLabel}>College</span>
                  <span className={styles.profileValue}>
                    {selectedVolunteer.college}
                  </span>
                </div>

                <div className={styles.profileRow}>
                  <span className={styles.profileLabel}>Zone</span>
                  <span className={styles.profileValue}>
                    {selectedVolunteer.zone}
                  </span>
                </div>

                <div className={styles.profileRow}>
                  <span className={styles.profileLabel}>Batch</span>
                  <span className={styles.profileValue}>
                    {selectedVolunteer.batch}
                  </span>
                </div>
              </div>

              {/* POINTS BREAKDOWN */}
              <div className={styles.formBlock}>
                <span className={styles.fieldLabel}>
                  Volunteering Points Breakdown
                </span>

                <div className={styles.profileGrid}>
                  <div className={styles.profileRow}>
                    <span className={styles.profileLabel}>
                      Historical Points
                    </span>
                    <span className={styles.profileValue}>
                      {formatNumber(selectedVolunteer.pastPoints)}
                    </span>
                  </div>

                  <div className={styles.profileRow}>
                    <span className={styles.profileLabel}>
                      New QR Points
                    </span>
                    <span className={styles.profileValue}>
                      {formatNumber(selectedVolunteer.newPoints)}
                    </span>
                  </div>

                  <div className={styles.profileRow}>
                    <span className={styles.profileLabel}>
                      Total Points
                    </span>
                    <span className={styles.profileValue}>
                      {formatNumber(selectedVolunteer.xp)}
                    </span>
                  </div>
                </div>
              </div>

              {/* HOURS BREAKDOWN */}
              <div className={styles.formBlock}>
                <span className={styles.fieldLabel}>
                  Volunteering Hours
                </span>

                <div className={styles.profileGrid}>
                  <div className={styles.profileRow}>
                    <span className={styles.profileLabel}>
                      Total Hours
                    </span>
                    <span className={styles.profileValue}>
                      {formatNumber(selectedVolunteer.verifiedHours)} hrs
                    </span>
                  </div>

                  <div className={styles.profileRow}>
                    <span className={styles.profileLabel}>
                      Regular Hours
                    </span>
                    <span className={styles.profileValue}>
                      {formatNumber(selectedVolunteer.regularHours)} hrs
                    </span>
                  </div>

                  <div className={styles.profileRow}>
                    <span className={styles.profileLabel}>
                      New QR Hours
                    </span>
                    <span className={styles.profileValue}>
                      {formatNumber(selectedVolunteer.newVerifiedHours)} hrs
                    </span>
                  </div>
                </div>
              </div>

              {/* PHYSICAL VERIFICATION */}
              <div className={styles.formBlock}>
                <span className={styles.fieldLabel}>
                  Physical Verification (PV)
                </span>

                <div className={styles.profileGrid}>
                  <div className={styles.profileRow}>
                    <span className={styles.profileLabel}>
                      PV Activities
                    </span>
                    <span className={styles.profileValue}>
                      {selectedVolunteer.physicalVerificationCount}
                    </span>
                  </div>

                  <div className={styles.profileRow}>
                    <span className={styles.profileLabel}>
                      PV Credited Hours
                    </span>
                    <span className={styles.profileValue}>
                      {formatNumber(
                        selectedVolunteer.physicalVerificationHours
                      )} hrs
                    </span>
                  </div>
                </div>
              </div>

              {/* HISTORICAL EVENT LIST */}
              <div className={styles.formBlock}>
                <span className={styles.fieldLabel}>
                  Historical Events ({selectedVolunteer.eventsAttended.length})
                </span>

                <div className={styles.listWrap}>
                  {selectedVolunteer.eventsAttended.length > 0 ? (
                    selectedVolunteer.eventsAttended.map(
                      (eventName, idx) => (
                        <div key={idx} className={styles.listItem}>
                          <span className={styles.listName}>
                            {eventName}
                          </span>

                          <span className={styles.listSub}>
                            Completed
                          </span>
                        </div>
                      )
                    )
                  ) : (
                    <p>No historical event details available.</p>
                  )}
                </div>
              </div>

              {/* ACHIEVEMENTS */}
              {selectedVolunteer.badges.length > 0 && (
                <div className={styles.formBlock}>
                  <span className={styles.fieldLabel}>
                    Unlocked Achievements
                  </span>

                  <div className={styles.badgesWrapperLarge}>
                    {selectedVolunteer.badges.map((badgeKey) => {
                      const badge = BADGES[badgeKey];

                      if (!badge) return null;

                      const BadgeIcon = badge.icon;

                      return (
                        <div
                          key={badgeKey}
                          className={styles.largeBadge}
                          style={{
                            borderColor: badge.color,
                            backgroundColor: `${badge.color}10`,
                          }}
                        >
                          <BadgeIcon
                            size={16}
                            style={{ color: badge.color }}
                          />

                          <span style={{ color: badge.color }}>
                            {badge.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
