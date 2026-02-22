import { useState, CSSProperties } from 'react';
import { FiUser } from 'react-icons/fi';
import AuthModal from './AuthModal';

export default function HomeNavbar() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const styles: {
    header: CSSProperties;
    logoContainer: CSSProperties;
    logoText: CSSProperties;
    loginButton: CSSProperties;
    userIcon: (hovered: boolean) => CSSProperties;
  } = {
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: '#A3B18A',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      fontFamily: '"ABeeZee", sans-serif',
      height: '70px'
    },
    logoContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      marginLeft: '20px'
    },
    logoText: {
      fontSize: '1.5rem',
      fontWeight: 400,
      color: '#344E41',
      fontFamily: '"Bebas Neue", sans-serif',
      letterSpacing: '1px'
    },
    loginButton: {
      backgroundColor: 'transparent',
      border: 'none',
      cursor: 'pointer',
      fontSize: '1.5rem',
      marginRight: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      transition: 'all 0.3s ease'
    },
    userIcon: (hovered: boolean) => ({
      color: hovered ? '#DAD7CD' : '#344E41',
      transition: 'color 0.3s ease'
    })
  };

  return (
    <>
      <header style={styles.header}>
        <div style={styles.logoContainer}>
          <h1 style={styles.logoText}>APPFIT</h1>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          style={styles.loginButton}
          aria-label="Open user menu"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <FiUser style={styles.userIcon(isHovered)} />
        </button>
        <AuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </header>
      <div style={{ height: '60px' }} />
    </>
  );
}
