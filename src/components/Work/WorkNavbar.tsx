import { useState } from 'react';
import { FiUser, FiLogOut } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ProfileModal from '../Modals/ProfileModal';
import { CSSProperties } from 'react';

export default function WorkNavbar() {
  const { logout } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileHovered, setIsProfileHovered] = useState(false);
  const [isLogoutHovered, setIsLogoutHovered] = useState(false);

  const handleLogout = () => logout();
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const styles: {
    header: CSSProperties;
    logoContainer: CSSProperties;
    logoText: CSSProperties;
    navContainer: CSSProperties;
    navButton: (isHovered: boolean) => CSSProperties;
    iconButton: CSSProperties;
  } = {
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: '#a3b18a',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      fontFamily: '"ABeeZee", sans-serif',
      height: '60px',
      padding: '0 20px 0'
    },
    logoContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem'
    },
    logoText: {
      fontSize: '1.5rem',
      fontWeight: 400,
      color: '#344E41',
      fontFamily: '"Bebas Neue", sans-serif',
      letterSpacing: '1px',
      textTransform: 'uppercase'
    },
    navContainer: {
      display: 'flex',
      alignItems: 'center',
    },
    navButton: (isHovered: boolean) => ({
      backgroundColor: 'transparent',
      color: isHovered ? '#D65A31' : '#344E41',
      border: 'none',
      cursor: 'pointer',
      fontSize: '0.9rem',
      fontWeight: 500,
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.5rem 1rem',
      borderRadius: '4px',
      transition: 'all 0.3s ease',
      textDecoration: 'none'
    }),
    iconButton: {
      backgroundColor: 'transparent',
      color: '#344E41',
      border: 'none',
      cursor: 'pointer',
      fontSize: '2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '50px',
      height: '50px',
      borderRadius: '50%',
      transition: 'all 0.3s ease'
    }
  };

  return (
    <>
      <header style={styles.header}>
        <div style={styles.logoContainer}>
          <h1 style={styles.logoText}>Trainer Dashboard</h1>
        </div>
        
        <div style={styles.navContainer}>
          <button 
            onClick={openModal}
            style={styles.navButton(isProfileHovered)}
            onMouseEnter={() => setIsProfileHovered(true)}
            onMouseLeave={() => setIsProfileHovered(false)}
          >
            <FiUser style={{ fontSize: '1.5rem' }} />
          </button>
          
          <Link 
            to="/" 
            onClick={handleLogout}
            style={styles.navButton(isLogoutHovered)}
            onMouseEnter={() => setIsLogoutHovered(true)}
            onMouseLeave={() => setIsLogoutHovered(false)}
          >
            <FiLogOut style={{ fontSize: '1.5rem' }} />
          </Link>
        </div>

        <ProfileModal
          isOpen={isModalOpen}
          onClose={closeModal}
        />
      </header>
      <div style={{ height: '60px' }} />
    </>
  );
}