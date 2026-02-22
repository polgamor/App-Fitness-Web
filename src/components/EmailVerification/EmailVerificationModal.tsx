import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

export default function EmailVerificationModal() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBackHome = () => {
    navigate('/');
  };

  useEffect(() => {
    // Verificar que venga del flujo de registro
    if (!location.state || !location.state.fromRegister) {
      navigate('/', { replace: true });
    }
  }, [location, navigate]);

  const styles = {
    overlay: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(5px)',
    },
    modal: {
      backgroundColor: '#DAD7CD',
      padding: '2rem',
      borderRadius: '1rem',
      width: '90%',
      maxWidth: '500px',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
      textAlign: 'center' as const,
      fontFamily: '"ABeeZee", sans-serif',
    },
    title: {
      fontSize: '1.75rem',
      color: '#344E41',
      fontWeight: 600,
      marginBottom: '1rem',
      fontFamily: '"Bebas Neue", sans-serif',
      letterSpacing: '1px',
      textTransform: 'uppercase' as const,
    },
    text: {
      fontSize: '1rem',
      color: '#3A5A40',
      marginBottom: '2rem',
      lineHeight: 1.6,
    },
    button: {
      padding: '0.75rem 1.5rem',
      backgroundColor: '#588157',
      color: '#DAD7CD',
      border: 'none',
      borderRadius: '8px',
      fontSize: '1rem',
      fontWeight: 500,
      cursor: 'pointer',
      fontFamily: '"ABeeZee", sans-serif',
      transition: 'background-color 0.3s ease',
    },
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2 style={styles.title}>Check your email</h2>
        <p style={styles.text}>
          We have sent you a link to verify your email address.
          Click on it to complete the process.
        </p>
        <button style={styles.button} onClick={handleBackHome}>
          Back to Home
        </button>
      </div>
    </div>
  );
}