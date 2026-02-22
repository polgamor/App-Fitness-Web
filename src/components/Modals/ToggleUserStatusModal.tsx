import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

interface ToggleUserStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  currentStatus: boolean;
}

export default function ToggleUserStatusModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  currentStatus 
}: ToggleUserStatusModalProps) {
  const { updateProfile, user } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');

  const handleToggleStatus = async () => {
    try {
      if (!user) return;
      
      setIsUpdating(true);
      setError('');
      
      await updateProfile(user.id, { activo: !currentStatus });
      
      onSuccess?.();
      onClose();
    } catch (err) {
      setError('Error updating user status');
      console.error('Error al cambiar estado:', err);
    } finally {
      setIsUpdating(false);
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
      backgroundColor: currentStatus ? '#D65A31' : '#3A5A40',
      color: '#DAD7CD',
    },
    cancelButton: {
      backgroundColor: '#588157',
      color: '#DAD7CD',
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
        <h2 style={modalStyles.title}>
          {currentStatus ? 'Deactivate Account' : 'Activate Account'}
        </h2>
        {error && <p style={modalStyles.errorText}>{error}</p>}
        <p style={modalStyles.text}>
          Are you sure you want to {currentStatus ? 'deactivate' : 'activate'} your account?
          {currentStatus ? ' You will not be able to access the system until it is reactivated.' : ''}
        </p>
        
        <div style={modalStyles.buttonContainer}>
          <button 
            onClick={onClose}
            disabled={isUpdating}
            style={{
              ...modalStyles.button,
              ...modalStyles.cancelButton,
              ...(isUpdating ? modalStyles.disabledButton : {})
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleToggleStatus}
            disabled={isUpdating}
            style={{
              ...modalStyles.button,
              ...modalStyles.confirmButton,
              ...(isUpdating ? modalStyles.disabledButton : {})
            }}
          >
            {isUpdating ? 'Processing...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}