import { CSSProperties } from 'react';

export default function Footer() {
  // Definimos los estilos con tipos explícitos
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
    socialLinks: CSSProperties;
    socialIcon: CSSProperties;
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
      transition: 'color 0.3s ease',
      ':hover': {
        color: '#D65A31'
      }
    } as CSSProperties,
    socialLinks: {
      display: 'flex',
      gap: '1rem',
      marginTop: '1.5rem'
    },
    socialIcon: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.3s ease',
      ':hover': {
        backgroundColor: '#D65A31',
        transform: 'translateY(-3px)'
      }
    } as CSSProperties,
    copyright: {
      textAlign: 'center',
      paddingTop: '2rem',
      opacity: 0.7,
      fontSize: '0.9rem',
      paddingBottom: '2rem',
    }
  };

  return (
    <footer style={styles.footer}>
      <div style={{ ...styles.container, padding: '4rem 0 2rem' }}>
        <div style={styles.logoContainer}>
          <img 
            src="/logo-appfit.jpg" 
            alt="APPFIT Logo" 
            style={styles.logo}
          />
          <h3 style={styles.logoText}>APPFIT</h3>
          <p style={styles.slogan}>
            Transformando vidas a través del fitness desde 2023
          </p>
        </div>

        <div>
          <h4 style={styles.columnTitle}>Enlaces Rápidos</h4>
          <ul style={styles.linkList}>
            {['Inicio', 'Funcionalidades', 'Precios', 'Testimonios', 'Blog'].map((item) => (
              <li key={item}>
                <a href="#" style={styles.linkItem}>{item}</a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 style={styles.columnTitle}>Legal</h4>
          <ul style={styles.linkList}>
            {['Términos de servicio', 'Política de privacidad', 'Cookies', 'FAQ'].map((item) => (
              <li key={item}>
                <a href="#" style={styles.linkItem}>{item}</a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 style={styles.columnTitle}>Contacto</h4>
          <ul style={styles.linkList}>
            <li>info@appfit.com</li>
            <li>+34 123 456 789</li>
            <li>Calle Fitness, 123</li>
            <li>Madrid, España</li>
          </ul>
        </div>
      </div>

      <div style={styles.copyright}>
        &copy; {new Date().getFullYear()} APPFIT. Todos los derechos reservados.
      </div>
    </footer>
  );
}