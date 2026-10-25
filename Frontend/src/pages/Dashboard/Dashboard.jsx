import styles from "./Dashboard.module.css";

function Dashboard() {
  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <h2 className={styles.logo}>Maatram</h2>

        <nav className={styles.nav}>
          <a href="/">Dashboard</a>
          <a href="/login">Login</a>
        </nav>
      </header>

      <main className={styles.main}>
        <section className={styles.welcome}>
          <p className={styles.tagline}>MAKE A DIFFERENCE</p>
          <h1>Welcome to Maatram!</h1>
          <p>
            Every small action creates a big change.
            Join our volunteering community and make an impact.
          </p>

          <button
            className={styles.button}
            onClick={() => (window.location.href = "/login")}
          >
            Get Started
          </button>
        </section>

        <section className={styles.stats}>
          <div className={styles.card}>
            <span>🌱</span>
            <h3>Volunteer Activities</h3>
            <p>Explore opportunities to help your community.</p>
          </div>

          <div className={styles.card}>
            <span>🏆</span>
            <h3>Earn Points</h3>
            <p>Get rewarded for your volunteering efforts.</p>
          </div>

          <div className={styles.card}>
            <span>🎖️</span>
            <h3>Unlock Badges</h3>
            <p>Celebrate milestones and achievements.</p>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <p>© 2026 Maatram | Volunteer. Participate. Transform.</p>
      </footer>
    </div>
  );
}

export default Dashboard;