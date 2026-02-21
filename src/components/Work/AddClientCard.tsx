import { useState } from 'react';
import { CSSProperties } from 'react';
import { Cliente, useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

interface AddClientCardProps {
  client: Cliente;
}

export default function AddClientCard({}: AddClientCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { user: currentUser } = useAuth();
  const isEntrenadorActivo = currentUser?.activo;
  const isActive = true;

  const generarToken = async () => {
    if (!currentUser) return;

    setIsGenerating(true);
    try {
      const tokenId = uuidv4().slice(0, 8);
      const now = Timestamp.now();
      const expires = Timestamp.fromMillis(now.toMillis() + 30 * 60 * 1000);

      await setDoc(doc(db, 'tokens', tokenId), {
        trainerId: currentUser.id,
        createdAt: now,
        expiresAt: expires,
      });

      setToken(tokenId);
      await navigator.clipboard.writeText(tokenId);
      showFeedbackMessage('Token generado y copiado al portapapeles', false);
    } catch (error) {
      showFeedbackMessage('Error al generar el token', true);
    }
    setIsGenerating(false);
  };

  const showFeedbackMessage = (message: string, isError: boolean) => {
    setFeedbackMessage(message);
    setIsError(isError);
    setShowFeedback(true);
    setTimeout(() => setShowFeedback(false), 3000);
  };

  const styles: { [key: string]: CSSProperties } = {
    card: {
      cursor: isEntrenadorActivo && isActive ? 'pointer' : 'not-allowed',
      padding: '1.5rem',
      borderRadius: '0.75rem',
      height: '11rem',
      backgroundColor: isEntrenadorActivo && isActive && isHovered ? '#A3B18A' : '#DAD7CD',
      color: isEntrenadorActivo ? (isHovered ? 'white' : '#0B160C') : '#6B7280',
      boxShadow: isHovered ? '0 4px 8px rgba(0, 0, 0, 0.15)' : '0 2px 4px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.3s ease',
      border: `2px dashed ${
        isEntrenadorActivo && isActive ? (isHovered ? 'white' : '#A3B18A') : '#D1D5DB'
      }`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '180px',
      opacity: isEntrenadorActivo && isActive ? 1 : 0.6,
      position: 'relative',
      overflow: 'hidden',
    },
    icon: {
      fontSize: '2.5rem',
      marginBottom: '1rem',
      color: isEntrenadorActivo ? 'inherit' : '#9CA3AF',
    },
    text: {
      fontSize: '1.1rem',
      fontWeight: 500,
      textAlign: 'center',
      fontFamily: '"ABeeZee", sans-serif',
      color: isEntrenadorActivo ? 'inherit' : '#9CA3AF',
    },
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(8px)',
    },
    dialogContent: {
      backgroundColor: '#DAD7CD',
      padding: '2rem',
      borderRadius: '1rem',
      width: '90%',
      maxWidth: '500px',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
      position: 'relative',
      border: 'none',
    },
    title: {
      fontSize: '1.75rem',
      fontWeight: 600,
      marginBottom: '1.5rem',
      color: '#344E41',
      fontFamily: '"Bebas Neue", sans-serif',
      letterSpacing: '1px',
      textTransform: 'uppercase',
      textAlign: 'center',
    },
    idBox: {
      padding: '1rem',
      backgroundColor: 'rgba(255, 255, 255, 0.7)',
      borderRadius: '0.5rem',
      margin: '1.5rem 0',
      wordBreak: 'break-all',
      textAlign: 'center',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      border: '1px solid #A3B18A',
      fontFamily: '"ABeeZee", sans-serif',
      fontSize: '0.95rem',
      color: '#3A5A40',
    },
    button: {
      padding: '0.75rem 1.5rem',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '1rem',
      fontWeight: 500,
      border: 'none',
      transition: 'all 0.2s ease',
      fontFamily: '"ABeeZee", sans-serif',
      width: '100%',
      backgroundColor: '#3A5A40',
      color: '#DAD7CD',
      marginTop: '1rem',
    },
    feedback: {
      position: 'fixed',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: isError ? '#D65A31' : '#588157',
      color: 'white',
      padding: '12px 24px',
      borderRadius: '4px',
      zIndex: 1000,
      fontFamily: '"ABeeZee", sans-serif',
      opacity: showFeedback ? 1 : 0,
      pointerEvents: showFeedback ? 'auto' : 'none',
    },
    inactiveOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: '0.5rem',
      color: 'white',
      fontWeight: 'bold',
      fontSize: '0.9rem',
      textAlign: 'center',
      padding: '1rem',
      zIndex: 1,
    },
  };

  const handleOpenDialog = () => {
    if (currentUser?.activo && isActive) {
      setShowDialog(true);
      setToken(null);
    } else {
      showFeedbackMessage('Tu cuenta está inactiva. No puedes agregar clientes.', true);
    }
  };

  return (
    <>
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={isEntrenadorActivo && isActive ? handleOpenDialog : undefined}
        style={styles.card}
        title={isEntrenadorActivo ? "Agregar nuevo cliente" : "Cuenta inactiva"}
      >
        {(!isEntrenadorActivo || !isActive) && (
          <div style={styles.inactiveOverlay}>
            {isEntrenadorActivo ? 'Usuario Inactivo' : 'Cuenta Inactiva'}
          </div>
        )}
        <div style={styles.icon}>
          <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <p style={styles.text}>Agregar nuevo cliente</p>
      </div>

      {showDialog && currentUser && (
        <div style={styles.overlay} onClick={() => setShowDialog(false)}>
          <div style={styles.dialogContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.title}>Token para cliente</h2>
            <p style={{ textAlign: 'center', fontFamily: '"ABeeZee", sans-serif' }}>
              Genera un token temporal y compártelo con tu cliente.
            </p>

            <div
              style={styles.idBox}
              onClick={token ? () => navigator.clipboard.writeText(token) : undefined}
            >
              {token ?? 'Token no generado aún'}
            </div>

            <button style={styles.button} onClick={generarToken} disabled={isGenerating}>
              {isGenerating ? 'Generando...' : 'Generar Token'}
            </button>

            <button
              onClick={() => setShowDialog(false)}
              style={{ ...styles.button, backgroundColor: '#6B705C', marginTop: '1rem' }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      <div style={styles.feedback}>{feedbackMessage}</div>
    </>
  );
}
