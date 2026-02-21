import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function VerificationErrorPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const errorCause = searchParams.get('cause');
    
    // Set appropriate error message based on the cause
    if (errorCause === 'invalid-token') {
      setErrorMessage('El enlace de verificación no es válido o ha expirado.');
    } else if (errorCause === 'verification-failed') {
      const stateError = location.state?.error;
      if (stateError?.includes('expired')) {
        setErrorMessage('El enlace de verificación ha expirado. Por favor solicita uno nuevo.');
      } else {
        setErrorMessage('Ha ocurrido un error durante la verificación. Por favor intenta de nuevo.');
      }
    } else {
      setErrorMessage('Ha ocurrido un error inesperado.');
    }
  }, [searchParams, location.state]);

  const handleBackHome = () => {
    navigate('/', { replace: true });
  };

  const handleResendVerification = () => {
    // Implement logic to resend verification email
    navigate('/resend-verification', { replace: true });
  };

  const styles = {
    container: {
      padding: '2rem',
      maxWidth: '600px',
      margin: '4rem auto',
      backgroundColor: '#DAD7CD',
      borderRadius: '1rem',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
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
    <div style={styles.container}>
      <h2 style={styles.title}>Error de verificación</h2>
      <p style={styles.text}>{errorMessage}</p>
      <div>
        <button style={styles.button} onClick={handleResendVerification}>
          Reenviar email de verificación
        </button>
        <button style={styles.secondaryButton} onClick={handleBackHome}>
          Volver al inicio
        </button>
      </div>
    </div>
  );
}