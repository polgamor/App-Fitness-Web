import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function DeleteAccountModal({ isOpen, onClose, onSuccess }: DeleteAccountModalProps) {
  const { deleteAccount } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');

  const handleDelete = async () => {
    try {
      if (!password) {
        setError('Please enter your password');
        return;
      }
      
      setIsDeleting(true);
      setError('');
      
      await deleteAccount(password);
      onSuccess?.();
      onClose();
      
    } catch (err) {
      // Manejo específico para contraseña incorrecta
      if (err instanceof Error && err.message.includes('contraseña')) {
        setError('Incorrect password. Please try again.');
      } else {
        setError(err instanceof Error ? err.message : 'Error deleting account');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const modalStyles = {
    overlay: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(52, 78, 65, 0.9)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1001,
      backdropFilter: 'blur(8px)',
    },
    content: {
      backgroundColor: '#DAD7CD',
      padding: '2rem',
      borderRadius: '1rem',
      maxWidth: '500px',
      width: '90%',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
      border: '2px solid #3A5A40',
    },
    title: {
      fontSize: '1.5rem',
      fontWeight: 600,
      marginBottom: '1rem',
      color: '#344E41',
      fontFamily: '"Bebas Neue", sans-serif',
      letterSpacing: '1px',
      textTransform: 'uppercase' as const,
    },
    text: {
      margin: '1rem 0',
      color: '#3A5A40',
      fontFamily: '"ABeeZee", sans-serif',
      lineHeight: '1.6',
    },
    errorText: {
      color: '#D65A31',
      marginBottom: '1rem',
      fontFamily: '"ABeeZee", sans-serif',
      padding: '0.75rem',
      backgroundColor: 'rgba(214, 90, 49, 0.1)',
      borderRadius: '8px',
      border: '1px solid rgba(214, 90, 49, 0.3)',
    },
    inputGroup: {
      marginBottom: '1.5rem',
    },
    label: {
      display: 'block',
      marginBottom: '0.5rem',
      color: '#344E41',
      fontWeight: 500,
      fontFamily: '"ABeeZee", sans-serif',
    },
    input: {
      width: '95%',
      padding: '0.75rem',
      border: error.includes('contraseña') ? '2px solid #D65A31' : '1px solid #A3B18A',
      borderRadius: '8px',
      backgroundColor: 'rgba(255, 255, 255, 0.7)',
      fontFamily: '"ABeeZee", sans-serif',
      outline: 'none',
    },
    buttonContainer: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '1rem',
      marginTop: '1.5rem',
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
    },
    confirmButton: {
      backgroundColor: '#D65A31',
      color: '#DAD7CD',
      '&:hover': {
        backgroundColor: '#C04A21',
      },
    },
    cancelButton: {
      backgroundColor: '#588157',
      color: '#DAD7CD',
      '&:hover': {
        backgroundColor: '#3A5A40',
      },
    },
    disabledButton: {
      opacity: 0.7,
      cursor: 'not-allowed',
    }
  };

  if (!isOpen) return null;

  return (
    <div style={modalStyles.overlay} onClick={onClose}>
      <div style={modalStyles.content} onClick={(e) => e.stopPropagation()}>
        <h2 style={modalStyles.title}>Confirm Account Deletion</h2>
        {error && (
          <div style={modalStyles.errorText}>
            {error}
          </div>
        )}
        <p style={modalStyles.text}>
          Are you sure you want to permanently delete your account? This action cannot be undone.
        </p>

        <div style={modalStyles.inputGroup}>
          <label style={modalStyles.label}>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError('');
            }}
            style={modalStyles.input}
            placeholder="Enter your password to confirm"
          />
        </div>

        <div style={modalStyles.buttonContainer}>
          <button 
            onClick={onClose}
            disabled={isDeleting}
            style={{
              ...modalStyles.button,
              ...modalStyles.cancelButton,
              ...(isDeleting ? modalStyles.disabledButton : {})
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            style={{
              ...modalStyles.button,
              ...modalStyles.confirmButton,
              ...(isDeleting ? modalStyles.disabledButton : {})
            }}
          >
            {isDeleting ? 'Deleting...' : 'Confirm Deletion'}
          </button>
        </div>
      </div>
    </div>
  );
}