import React, { useState, useMemo } from "react";
import {
  Trophy, Medal, Flame, Star, Award, Zap, ChevronDown, Filter, Search, MapPin, ChevronLeft, X
} from "lucide-react";
import styles from "./Leaderboard.module.css";

/* ============================================================
   MOCK DATA & CONFIG
   ============================================================ */
const ZONES = ["All Zones", "Zone 1", "Zone 2", "Zone 3", "Zone 4", "Zone 5"];
const COLLEGES = [
  "All Colleges",
  "Maatram Institute of Technology",
  "Green Valley College",
  "St. Xavier's College",
  "Sunrise Engineering College",
];
const BATCHES = ["All Batches", "2021-2025", "2022-2026", "2023-2027", "2024-2028"];
const EVENTS = ["All Events", "Beach Cleanup", "Blood Donation", "Winter Book Fair", "Tree Plantation"];

// Badges configuration
const BADGES = {
  mvp: { icon: Trophy, color: "#ffcc00", label: "MVP" },
  streak: { icon: Flame, color: "#ff5722", label: "Hot Streak" },
  speed: { icon: Zap, color: "#00d2ff", label: "Quick Responder" },
  star: { icon: Star, color: "#9c27b0", label: "5-Star Rating" },
};

// Generate mock volunteers with gamified stats (XP, Level, Badges)
const MOCK_VOLUNTEERS = [
  { id: 1, name: "Nandini Rao", rollNo: "SU2022012", department: "CSE", college: "Sunrise Engineering College", zone: "Zone 4", batch: "2022-2026", eventsAttended: ["Beach Cleanup", "Winter Book Fair"], xp: 8450, rating: 4.9, badges: ["mvp", "star", "streak"] },
  { id: 2, name: "Prakash V", rollNo: "ST2021045", department: "BBA", college: "St. Xavier's College", zone: "Zone 2", batch: "2021-2025", eventsAttended: ["Blood Donation"], xp: 7820, rating: 4.7, badges: ["mvp", "speed"] },
  { id: 3, name: "Divya Nair", rollNo: "GR2022088", department: "BBA", college: "Green Valley College", zone: "Zone 2", batch: "2022-2026", eventsAttended: ["Beach Cleanup", "Tree Plantation"], xp: 7400, rating: 4.9, badges: ["streak", "star"] },
  { id: 4, name: "Santhosh Kumar", rollNo: "MA2022001", department: "CSE", college: "Maatram Institute of Technology", zone: "Zone 1", batch: "2022-2026", eventsAttended: ["Winter Book Fair"], xp: 6950, rating: 4.8, badges: ["speed"] },
  { id: 5, name: "Vignesh Raj", rollNo: "MA2022014", department: "MECH", college: "Maatram Institute of Technology", zone: "Zone 1", batch: "2022-2026", eventsAttended: ["Tree Plantation", "Beach Cleanup"], xp: 6100, rating: 4.6, badges: [] },
  { id: 6, name: "Deepa Krishnan", rollNo: "GR2022092", department: "BBA", college: "Green Valley College", zone: "Zone 2", batch: "2022-2026", eventsAttended: ["Blood Donation", "Winter Book Fair"], xp: 5800, rating: 4.8, badges: ["star"] },
  { id: 7, name: "Meena Suresh", rollNo: "SU2022033", department: "IT", college: "Sunrise Engineering College", zone: "Zone 4", batch: "2022-2026", eventsAttended: ["Beach Cleanup"], xp: 5420, rating: 4.7, badges: ["streak"] },
  { id: 8, name: "Priya Ramesh", rollNo: "GR2021010", department: "ECE", college: "Green Valley College", zone: "Zone 2", batch: "2021-2025", eventsAttended: ["Blood Donation"], xp: 4900, rating: 4.6, badges: [] },
  { id: 9, name: "Lakshmi Devi", rollNo: "GR2023112", department: "ECE", college: "Green Valley College", zone: "Zone 2", batch: "2023-2027", eventsAttended: ["Tree Plantation"], xp: 4500, rating: 4.7, badges: ["speed"] },
  { id: 10, name: "Aarthi Selvam", rollNo: "SU2022041", department: "ECE", college: "Sunrise Engineering College", zone: "Zone 4", batch: "2022-2026", eventsAttended: ["Winter Book Fair", "Beach Cleanup"], xp: 4100, rating: 4.6, badges: [] },
  { id: 11, name: "Ananya Iyer", rollNo: "SU2023005", department: "ECE", college: "Sunrise Engineering College", zone: "Zone 5", batch: "2023-2027", eventsAttended: ["Blood Donation"], xp: 3800, rating: 4.5, badges: ["streak"] },
  { id: 12, name: "Karthik Vel", rollNo: "ST2023022", department: "MECH", college: "St. Xavier's College", zone: "Zone 3", batch: "2023-2027", eventsAttended: ["Tree Plantation"], xp: 3200, rating: 4.4, badges: [] },
];

/* ============================================================
   HELPER COMPONENTS
   ============================================================ */
const calculateLevel = (xp) => Math.floor(xp / 1000) + 1;
const calculateProgress = (xp) => (xp % 1000) / 10; // Percentage to next level

const RankBadge = ({ rank }) => {
  if (rank === 1) return <div className={`${styles.rankBadge} ${styles.gold}`}><Trophy size={16} /></div>;
  if (rank === 2) return <div className={`${styles.rankBadge} ${styles.silver}`}><Medal size={16} /></div>;
  if (rank === 3) return <div className={`${styles.rankBadge} ${styles.bronze}`}><Medal size={16} /></div>;
  return <div className={`${styles.rankBadge} ${styles.standard}`}>{rank}</div>;
};

/* ============================================================
   MAIN LEADERBOARD COMPONENT
   ============================================================ */
// Note: Accepting `onBack` prop to trigger navigation to the main dashboard
const Leaderboard = ({ onBack }) => {
  const [filters, setFilters] = useState({
    zone: "All Zones",
    college: "All Colleges",
    batch: "All Batches",
    event: "All Events",
    search: "",
  });

  const [selectedVolunteer, setSelectedVolunteer] = useState(null);

  // Filter and Sort Logic
  const filteredLeaderboard = useMemo(() => {
    let result = MOCK_VOLUNTEERS.filter((v) => {
      const matchZone = filters.zone === "All Zones" || v.zone === filters.zone;
      const matchCollege = filters.college === "All Colleges" || v.college === filters.college;
      const matchBatch = filters.batch === "All Batches" || v.batch === filters.batch;
      const matchEvent = filters.event === "All Events" || v.eventsAttended.includes(filters.event);
      const matchSearch = v.name.toLowerCase().includes(filters.search.toLowerCase());
      
      return matchZone && matchCollege && matchBatch && matchEvent && matchSearch;
    });

    return result.sort((a, b) => b.xp - a.xp);
  }, [filters]);

  const top3 = filteredLeaderboard.slice(0, 3);
  const rest = filteredLeaderboard.slice(3);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className={styles.container}>
      {/* Back Button */}
      {onBack && (
        <button className={styles.backBtn} onClick={onBack}>
          <ChevronLeft size={16} />
          Back to Dashboard
        </button>
      )}

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerTitles}>
          <h1 className={styles.pageTitle}>
            <Award className={styles.titleIcon} size={28} />
            Hall of Fame
          </h1>
          <p className={styles.pageSubtitle}>Top volunteers making a real difference</p>
        </div>
      </header>

      {/* Filters Bar */}
      <div className={styles.filterBar}>
        <div className={styles.searchBox}>
          <Search size={16} className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Search volunteers..." 
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className={styles.searchInput}
          />
        </div>
        
        <div className={styles.dropdowns}>
          <select value={filters.zone} onChange={(e) => handleFilterChange("zone", e.target.value)} className={styles.select}>
            {ZONES.map(z => <option key={z} value={z}>{z}</option>)}
          </select>
          <select value={filters.college} onChange={(e) => handleFilterChange("college", e.target.value)} className={styles.select}>
            {COLLEGES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filters.batch} onChange={(e) => handleFilterChange("batch", e.target.value)} className={styles.select}>
            {BATCHES.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <select value={filters.event} onChange={(e) => handleFilterChange("event", e.target.value)} className={styles.select}>
            {EVENTS.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
      </div>

      {filteredLeaderboard.length === 0 ? (
        <div className={styles.emptyState}>
          <Filter size={48} className={styles.emptyIcon} />
          <h3>No volunteers found</h3>
          <p>Try adjusting your filters to see the leaderboard.</p>
          <button onClick={() => setFilters({zone: "All Zones", college: "All Colleges", batch: "All Batches", event: "All Events", search: ""})} className={styles.resetBtn}>
            Reset Filters
          </button>
        </div>
      ) : (
        <>
          {/* Top 3 Podium */}
          {top3.length > 0 && (
            <div className={styles.podiumContainer}>
              {/* Rank 2 */}
              {top3[1] && (
                <div className={`${styles.podiumItem} ${styles.rank2}`} onClick={() => setSelectedVolunteer(top3[1])}>
                  <div className={styles.podiumAvatarWrap}>
                    <div className={styles.avatar}>{top3[1].name.charAt(0)}</div>
                    <div className={styles.podiumBadge}><Medal size={14} /></div>
                  </div>
                  <h3 className={styles.podiumName}>{top3[1].name}</h3>
                  <p className={styles.podiumXP}>{top3[1].xp.toLocaleString()} XP</p>
                  <div className={styles.podiumBase}>2</div>
                </div>
              )}

              {/* Rank 1 */}
              {top3[0] && (
                <div className={`${styles.podiumItem} ${styles.rank1}`} onClick={() => setSelectedVolunteer(top3[0])}>
                  <div className={styles.podiumAvatarWrap}>
                    <div className={styles.avatar}>{top3[0].name.charAt(0)}</div>
                    <div className={styles.crown}><Trophy size={20} /></div>
                  </div>
                  <h3 className={styles.podiumName}>{top3[0].name}</h3>
                  <p className={styles.podiumXP}>{top3[0].xp.toLocaleString()} XP</p>
                  <div className={styles.podiumBase}>1</div>
                </div>
              )}

              {/* Rank 3 */}
              {top3[2] && (
                <div className={`${styles.podiumItem} ${styles.rank3}`} onClick={() => setSelectedVolunteer(top3[2])}>
                  <div className={styles.podiumAvatarWrap}>
                    <div className={styles.avatar}>{top3[2].name.charAt(0)}</div>
                    <div className={styles.podiumBadge}><Medal size={14} /></div>
                  </div>
                  <h3 className={styles.podiumName}>{top3[2].name}</h3>
                  <p className={styles.podiumXP}>{top3[2].xp.toLocaleString()} XP</p>
                  <div className={styles.podiumBase}>3</div>
                </div>
              )}
            </div>
          )}

          {/* Rest of the Leaderboard */}
          {rest.length > 0 && (
            <div className={styles.listContainer}>
              <div className={styles.listHeader}>
                <div className={styles.colRank}>Rank</div>
                <div className={styles.colVolunteer}>Volunteer</div>
                <div className={styles.colLevel}>Level & Progress</div>
                <div className={styles.colBadges}>Achievements</div>
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
                      style={{'--stagger': index}}
                      onClick={() => setSelectedVolunteer(volunteer)}
                    >
                      <div className={styles.colRank}>
                        <RankBadge rank={rank} />
                      </div>
                      
                      <div className={styles.colVolunteer}>
                        <div className={styles.listAvatar}>{volunteer.name.charAt(0)}</div>
                        <div className={styles.volunteerInfo}>
                          <h4 className={styles.volunteerName}>{volunteer.name}</h4>
                          <span className={styles.volunteerMeta}>
                            <MapPin size={10} className={styles.inlineIcon} />
                            {volunteer.zone} · {volunteer.college}
                          </span>
                        </div>
                      </div>

                      <div className={styles.colLevel}>
                        <div className={styles.levelInfo}>
                          <span className={styles.levelBadge}>Lvl {level}</span>
                          <span className={styles.levelNext}>Lvl {level + 1}</span>
                        </div>
                        <div className={styles.progressBarBg}>
                          <div className={styles.progressBarFill} style={{ width: `${progress}%` }}></div>
                        </div>
                      </div>

                      <div className={styles.colBadges}>
                        <div className={styles.badgesWrapper}>
                          {volunteer.badges.map(badgeKey => {
                            const BadgeIcon = BADGES[badgeKey].icon;
                            return (
                              <div key={badgeKey} className={styles.miniBadge} title={BADGES[badgeKey].label} style={{ color: BADGES[badgeKey].color, backgroundColor: `${BADGES[badgeKey].color}15` }}>
                                <BadgeIcon size={14} />
                              </div>
                            );
                          })}
                          {volunteer.badges.length === 0 && <span className={styles.noBadges}>-</span>}
                        </div>
                      </div>

                      <div className={styles.colXP}>
                        <span className={styles.xpText}>{volunteer.xp.toLocaleString()}</span>
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

      {/* Profile Pop-up Modal */}
      {selectedVolunteer && (
        <div className={styles.modalOverlay} onClick={() => setSelectedVolunteer(null)}>
          <div className={styles.profileModal} onClick={(e) => e.stopPropagation()}>
            
            <div className={styles.modalHead}>
              <div className={styles.profileHeaderInfo}>
                <div className={styles.avatarLg}>{selectedVolunteer.name.charAt(0)}</div>
                <div>
                  <h3 className={styles.modalTitle}>{selectedVolunteer.name}</h3>
                  <p className={styles.modalSub}>{selectedVolunteer.rollNo} · {selectedVolunteer.department}</p>
                </div>
              </div>
              <button className={styles.modalClose} onClick={() => setSelectedVolunteer(null)} aria-label="Close">
                <X size={16} />
              </button>
            </div>

            <div className={styles.modalBody}>
              
              {/* Gamification summary inside modal */}
              <div className={styles.profileStatsRow}>
                <div className={styles.profileStatBox}>
                  <strong>Lvl {calculateLevel(selectedVolunteer.xp)}</strong>
                  <span>Current Level</span>
                </div>
                <div className={styles.profileStatDivider} />
                <div className={styles.profileStatBox}>
                  <strong style={{ color: "#ffcc00" }}>{selectedVolunteer.xp.toLocaleString()}</strong>
                  <span>Total XP</span>
                </div>
                <div className={styles.profileStatDivider} />
                <div className={styles.profileStatBox}>
                  <strong>{selectedVolunteer.rating} ★</strong>
                  <span>Avg Rating</span>
                </div>
              </div>

              <div className={styles.profileGrid}>
                <div className={styles.profileRow}><span className={styles.profileLabel}>College</span><span className={styles.profileValue}>{selectedVolunteer.college}</span></div>
                <div className={styles.profileRow}><span className={styles.profileLabel}>Zone</span><span className={styles.profileValue}>{selectedVolunteer.zone}</span></div>
                <div className={styles.profileRow}><span className={styles.profileLabel}>Batch</span><span className={styles.profileValue}>{selectedVolunteer.batch}</span></div>
              </div>

              {selectedVolunteer.badges.length > 0 && (
                <div className={styles.formBlock}>
                  <span className={styles.fieldLabel}>Unlocked Achievements</span>
                  <div className={styles.badgesWrapperLarge}>
                    {selectedVolunteer.badges.map(badgeKey => {
                      const BadgeIcon = BADGES[badgeKey].icon;
                      return (
                        <div key={badgeKey} className={styles.largeBadge} style={{ borderColor: BADGES[badgeKey].color, backgroundColor: `${BADGES[badgeKey].color}10` }}>
                          <BadgeIcon size={16} style={{ color: BADGES[badgeKey].color }} />
                          <span style={{ color: BADGES[badgeKey].color }}>{BADGES[badgeKey].label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className={styles.formBlock}>
                <span className={styles.fieldLabel}>Events Attended ({selectedVolunteer.eventsAttended.length})</span>
                <div className={styles.listWrap}>
                  {selectedVolunteer.eventsAttended.map((eventName, idx) => (
                    <div key={idx} className={styles.listItem}>
                      <span className={styles.listName}>{eventName}</span>
                      <span className={styles.listSub}>Completed</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Leaderboard;