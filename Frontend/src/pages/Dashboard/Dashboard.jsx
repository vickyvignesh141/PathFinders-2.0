import React from "react";
import styles from "./Dashboard.module.css";

const Dashboard = () => {
  return (
    <div className={styles.dashboard}>
      {/* ================= HEADER ================= */}
      <header className={styles.header}>
        <div className={styles.logoSection}>
          <div className={styles.logoCircle}>M</div>

          <div>
            <h2 className={styles.logoText}>Maatram</h2>
            <p className={styles.logoSubText}>Volunteering</p>
          </div>
        </div>

    

        <div className={styles.authButtons}>
          <button
            className={styles.loginButton}
            onClick={() => console.log("Login clicked")}
          >
            Login
          </button>

          <button
            className={styles.registerButton}
            onClick={() => console.log("Register clicked")}
          >
            Register <span>→</span>
          </button>
        </div>
      </header>

      {/* ================= HERO ================= */}
      <main>
        <section className={styles.hero} id="home">
          <div className={styles.heroContent}>
            <div className={styles.badge}>
              <span className={styles.badgeDot}></span>
              Be a part of something meaningful
            </div>

            <h1>
              Give Your Time.
              <br />
              <span>Grow Your Impact.</span>
            </h1>

            <p className={styles.heroDescription}>
              Join the Maatram volunteering community and make a real
              difference in the lives of students. Discover opportunities,
              contribute your skills and get recognised for every effort.
            </p>

            <div className={styles.heroButtons}>
              <button
                className={styles.primaryButton}
                onClick={() => console.log("Register clicked")}
              >
                Start Volunteering
                <span className={styles.arrowCircle}>→</span>
              </button>

              <button
                className={styles.secondaryButton}
                onClick={() => console.log("Login clicked")}
              >
                Already a Volunteer?
              </button>
            </div>

            {/* Mini Stats */}
            <div className={styles.heroStats}>
              <div className={styles.stat}>
                <strong>500+</strong>
                <span>Volunteers</span>
              </div>

              <div className={styles.statDivider}></div>

              <div className={styles.stat}>
                <strong>1,200+</strong>
                <span>Hours Served</span>
              </div>

              <div className={styles.statDivider}></div>

              <div className={styles.stat}>
                <strong>100+</strong>
                <span>Activities</span>
              </div>
            </div>
          </div>

          {/* Gamification Card */}
          <div className={styles.heroVisual}>
            <div className={styles.greenBlob}></div>

            <div className={styles.impactCard}>
              <div className={styles.cardTop}>
                <div>
                  <p>Your Impact</p>
                  <h3>Make Every Hour Count</h3>
                </div>

                <div className={styles.trophy}>🏆</div>
              </div>

              <div className={styles.progressSection}>
                <div className={styles.progressHeader}>
                  <span>Community Level</span>
                  <strong>72%</strong>
                </div>

                <div className={styles.progressBar}>
                  <div className={styles.progressFill}></div>
                </div>
              </div>

              <div className={styles.badgeRow}>
                <div className={styles.miniBadge}>🌱</div>
                <div className={styles.miniBadge}>🤝</div>
                <div className={styles.miniBadge}>⭐</div>
                <div className={styles.miniBadgeLocked}>🔒</div>
              </div>

              <p className={styles.levelText}>
                Keep volunteering to unlock new badges!
              </p>
            </div>

            <div className={styles.floatingCardOne}>
              <span>⭐</span>
              <div>
                <strong>+50 Points</strong>
                <small>Community Service</small>
              </div>
            </div>

            <div className={styles.floatingCardTwo}>
              <span>❤️</span>
              <div>
                <strong>Impact Created</strong>
                <small>Every contribution matters</small>
              </div>
            </div>
          </div>
        </section>

        {/* ================= ABOUT ================= */}
        <section className={styles.aboutSection} id="about">
          <div className={styles.sectionHeading}>
            <span>ABOUT VOLUNTEERING</span>

            <h2>
              Your Time Can Create
              <br />
              <em>Someone's Future.</em>
            </h2>

            <p>
              Volunteering with Maatram is more than just giving your time.
              It is about helping students gain confidence, discover
              opportunities and move one step closer to their dreams.
            </p>
          </div>

          <div className={styles.benefitGrid}>
            <div className={styles.benefitCard}>
              <div className={styles.iconBox}>🎓</div>
              <h3>Support Students</h3>
              <p>
                Help students with admissions, school visits, interviews and
                career-related activities.
              </p>
            </div>

            <div className={styles.benefitCard}>
              <div className={styles.iconBox}>💡</div>
              <h3>Share Your Skills</h3>
              <p>
                Use your knowledge and experience to guide students and help
                them make better decisions.
              </p>
            </div>

            <div className={styles.benefitCard}>
              <div className={styles.iconBox}>🤝</div>
              <h3>Build Community</h3>
              <p>
                Connect with students, alumni and like-minded volunteers who
                believe in creating positive change.
              </p>
            </div>

            <div className={styles.benefitCard}>
              <div className={styles.iconBox}>🏆</div>
              <h3>Get Recognised</h3>
              <p>
                Earn points, badges and recognition while tracking your
                volunteering journey.
              </p>
            </div>
          </div>
        </section>

        {/* ================= HOW IT WORKS ================= */}
        <section className={styles.processSection} id="opportunities">
          <div className={styles.sectionHeading}>
            <span>HOW IT WORKS</span>

            <h2>
              Volunteer.
              <br />
              <em>Make an Impact.</em>
            </h2>
          </div>

          <div className={styles.processGrid}>
            <div className={styles.processCard}>
              <div className={styles.stepNumber}>01</div>
              <div className={styles.processIcon}>🔎</div>
              <h3>Discover</h3>
              <p>
                Explore volunteering opportunities that match your interests,
                skills and availability.
              </p>
            </div>

            <div className={styles.processLine}></div>

            <div className={styles.processCard}>
              <div className={styles.stepNumber}>02</div>
              <div className={styles.processIcon}>🙋</div>
              <h3>Join</h3>
              <p>
                Register for an opportunity and become part of the Maatram
                volunteer community.
              </p>
            </div>

            <div className={styles.processLine}></div>

            <div className={styles.processCard}>
              <div className={styles.stepNumber}>03</div>
              <div className={styles.processIcon}>💚</div>
              <h3>Contribute</h3>
              <p>
                Participate in activities and use your time and skills to
                support students.
              </p>
            </div>

            <div className={styles.processLine}></div>

            <div className={styles.processCard}>
              <div className={styles.stepNumber}>04</div>
              <div className={styles.processIcon}>🏅</div>
              <h3>Get Recognised</h3>
              <p>
                Track your hours, earn points and badges and celebrate your
                contribution.
              </p>
            </div>
          </div>
        </section>

        {/* ================= WHY VOLUNTEER ================= */}
        <section className={styles.whySection} id="why-volunteer">
          <div className={styles.whyContent}>
            <span className={styles.sectionTag}>WHY SHOULD YOU VOLUNTEER?</span>

            <h2>
              Small Actions.
              <br />
              <span>Big Impact.</span>
            </h2>

            <p>
              Every hour you spend volunteering can help a student gain
              confidence, access new opportunities and move closer to their
              goals.
            </p>

            <div className={styles.reasonList}>
              <div className={styles.reason}>
                <div className={styles.check}>✓</div>
                <div>
                  <strong>Develop real-world skills</strong>
                  <p>Improve communication, leadership and teamwork.</p>
                </div>
              </div>

              <div className={styles.reason}>
                <div className={styles.check}>✓</div>
                <div>
                  <strong>Make a meaningful difference</strong>
                  <p>Help students overcome challenges and grow.</p>
                </div>
              </div>

              <div className={styles.reason}>
                <div className={styles.check}>✓</div>
                <div>
                  <strong>Build your network</strong>
                  <p>Connect with students, alumni and professionals.</p>
                </div>
              </div>

              <div className={styles.reason}>
                <div className={styles.check}>✓</div>
                <div>
                  <strong>Earn recognition</strong>
                  <p>Track your contribution and unlock achievements.</p>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.quoteCard}>
            <div className={styles.quoteIcon}>“</div>

            <p>
              The best way to find yourself is to lose yourself in the service
              of others.
            </p>

            <div className={styles.quoteBottom}>
              <div className={styles.avatar}>M</div>
              <div>
                <strong>Maatram Community</strong>
                <small>Growing together</small>
              </div>
            </div>
          </div>
        </section>

        {/* ================= CTA ================= */}
        <section className={styles.ctaSection}>
          <div className={styles.ctaDecoration}>✦</div>

          <span>READY TO MAKE A DIFFERENCE?</span>

          <h2>
            Your Next Contribution
            <br />
            Starts <em>Here.</em>
          </h2>

          <p>
            Join the Maatram volunteering community and turn your time into
            meaningful impact.
          </p>

          <button
            className={styles.ctaButton}
            onClick={() => console.log("Register clicked")}
          >
            Become a Volunteer
            <span>→</span>
          </button>
        </section>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className={styles.footer}>
        <div className={styles.footerMain}>
          <div className={styles.footerBrand}>
            <div className={styles.footerLogo}>
              <div className={styles.logoCircle}>M</div>

              <div>
                <h3>Maatram</h3>
                <span>Volunteering</span>
              </div>
            </div>

            <p>
              Empowering people to contribute their time, skills and energy
              towards creating better opportunities for students.
            </p>
          </div>

          <div className={styles.footerColumn}>
            <h4>Explore</h4>
            <a href="#home">Home</a>
            <a href="#about">About</a>
            <a href="#opportunities">Opportunities</a>
            <a href="#why-volunteer">Why Volunteer</a>
          </div>

          <div className={styles.footerColumn}>
            <h4>Volunteer</h4>
            <a href="#opportunities">Find Opportunities</a>
            <a href="#home">Join Community</a>
            <a href="#why-volunteer">Benefits</a>
            <a href="#home">Leaderboard</a>
          </div>

          <div className={styles.footerColumn}>
            <h4>Contact</h4>
            <a href="mailto:volunteer@maatram.org">
              volunteer@maatram.org
            </a>
            <a href="mailto:community@maatram.org">
              community@maatram.org
            </a>
            <a href="mailto:support@maatram.org">
              support@maatram.org
            </a>
            <span>Chennai, Tamil Nadu</span>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <p>© 2026 Maatram Volunteering. Built for the community.</p>

          <div className={styles.footerBadges}>
            <span>🌱 Give</span>
            <span>🤝 Connect</span>
            <span>🏆 Grow</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;