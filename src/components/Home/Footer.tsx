import { CSSProperties } from 'react';

export default function Footer() {
  const styles: {
    footer: CSSProperties;
    container: CSSProperties;
    logoContainer: CSSProperties;
    logo: CSSProperties;
    logoText: CSSProperties;
    slogan: CSSProperties;
    columnTitle: CSSProperties;
    linkList: CSSProperties;
    linkItem: CSSProperties;
    copyright: CSSProperties;
  } = {
    footer: {
      backgroundColor: '#344E41',
      color: '#DAD7CD',
      fontFamily: '"ABeeZee", sans-serif'
    },
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '3rem',
      paddingTop: '3rem',
      paddingBottom: '3rem',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
    },
    logoContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem'
    },
    logo: {
      width: '50px',
      height: '50px',
      borderRadius: '50%',
      objectFit: 'cover' as const
    },
    logoText: {
      fontSize: '1.8rem',
      fontWeight: 400,
      color: '#DAD7CD',
      fontFamily: '"Bebas Neue", sans-serif',
      letterSpacing: '1px',
      margin: 0
    },
    slogan: {
      opacity: 0.8,
      lineHeight: '1.6'
    },
    columnTitle: {
      fontSize: '1.2rem',
      fontWeight: 500,
      marginBottom: '1.5rem',
      color: '#D65A31',
      fontFamily: '"Bebas Neue", sans-serif',
      letterSpacing: '1px'
    },
    linkList: {
      listStyle: 'none',
      padding: 0,
      margin: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: '0.8rem'
    },
    linkItem: {
      color: '#DAD7CD',
      textDecoration: 'none',
      transition: 'color 0.3s ease'
    } as CSSProperties,
    copyright: {
      textAlign: 'center',
      paddingTop: '2rem',
      opacity: 0.7,
      fontSize: '0.9rem',
      paddingBottom: '2rem'
    }
  };

  return (
    <footer style={styles.footer}>
      <div style={{ ...styles.container, padding: '4rem 0 2rem' }}>
        <div style={styles.logoContainer}>
          <img src="/logo-appfit.jpg" alt="APPFIT Logo" style={styles.logo} />
          <h3 style={styles.logoText}>APPFIT</h3>
          <p style={styles.slogan}>Transforming lives through fitness since 2023</p>
        </div>

        <div>
          <h4 style={styles.columnTitle}>Quick Links</h4>
          <ul style={styles.linkList}>
            {['Home', 'Features', 'Pricing', 'Testimonials', 'Blog'].map(item => (
              <li key={item}>
                <a href="#" style={styles.linkItem}>{item}</a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 style={styles.columnTitle}>Legal</h4>
          <ul style={styles.linkList}>
            {['Terms of Service', 'Privacy Policy', 'Cookies', 'FAQ'].map(item => (
              <li key={item}>
                <a href="#" style={styles.linkItem}>{item}</a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 style={styles.columnTitle}>Contact</h4>
          <ul style={styles.linkList}>
            <li>info@appfit.com</li>
            <li>+34 123 456 789</li>
            <li>Fitness Street, 123</li>
            <li>Barcelona, Spain</li>
          </ul>
        </div>
      </div>

      <div style={styles.copyright}>
        &copy; {new Date().getFullYear()} APPFIT. All rights reserved.
      </div>
    </footer>
  );
}
