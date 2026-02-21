import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext'; // Make sure to adjust path if needed

export default function EmailVerifiedModal() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const handleContinue = () => {
    // Navigate to the work page or home page
    navigate('/work', { replace: true });
  };

  const handleBackHome = () => {
    navigate('/', { replace: true });
  };

  useEffect(() => {
    // Check if this component is accessed through the verification flow
    // or directly via URL (which we want to prevent)
    const fromVerification = location.state?.fromEmailVerification;
    
    if (!fromVerification) {
      navigate('/', { replace: true });
    }
  }, [location, navigate, user]);

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
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
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
      marginRight: '0.5rem',
    },
    secondaryButton: {
      padding: '0.75rem 1.5rem',
      backgroundColor: 'transparent',
      color: '#588157',
      border: '1px solid #588157',
      borderRadius: '8px',
      fontSize: '1rem',
      fontWeight: 500,
      cursor: 'pointer',
      fontFamily: '"ABeeZee", sans-serif',
      transition: 'all 0.3s ease',
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2 style={styles.title}>¡Email verificado con éxito!</h2>
        <p style={styles.text}>
          Tu dirección de correo ha sido verificada correctamente.
          Ya puedes acceder a todas las funciones de la aplicación.
        </p>
        <div>
          <button style={styles.button} onClick={handleContinue}>
            Continuar a la aplicación
          </button>
          <button style={styles.secondaryButton} onClick={handleBackHome}>
            Volver al inicio
          </button>
        </div>
      </div>
    </div>
  );
}