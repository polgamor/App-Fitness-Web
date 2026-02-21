import { CSSProperties, useState } from 'react';

interface DeleteDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  currentItem: { id: string; } | null;
}

const DeleteDataModal = ({ 
  isOpen, 
  onClose, 
  onConfirm,  
  currentItem 
}: DeleteDataModalProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar');
      console.error('Error en modal:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContent}>
        <h3 style={styles.modalTitle}>Confirmar eliminación</h3>
        <p style={styles.modalText}>
          ¿Estás seguro que deseas eliminar este elemento? 
          Esta acción no se puede deshacer.
        </p>
        
        {error && (
          <div style={styles.errorMessage}>
            Error: {error}
          </div>
        )}

        <div style={styles.modalActions}>
          <button 
            style={{...styles.button, ...styles.cancelButton}}
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancelar
          </button>
          <button 
            style={{...styles.button, ...styles.confirmButton}}
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Eliminando...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: CSSProperties } = {
  modalOverlay: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#DAD7CD',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1001,
      backdropFilter: 'blur(8px)',
  },
  modalContent: {
      backgroundColor: '#DAD7CD',
      padding: '2rem',
      borderRadius: '1rem',
      maxWidth: '500px',
      width: '90%',
      border: '2px solid #3A5A40',
  },
  modalTitle: {
      fontSize: '1.5rem',
      fontWeight: 600,
      marginBottom: '1rem',
      color: '#344E41',
      fontFamily: '"Bebas Neue", sans-serif',
      letterSpacing: '1px',
      textTransform: 'uppercase' as const,
  },
  modalText: {
      margin: '1rem 0',
      color: '#3A5A40',
      fontFamily: '"ABeeZee", sans-serif',
      lineHeight: '1.6',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.75rem',
    marginTop: '1.5rem'
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
  cancelButton: {
    backgroundColor: '#588157',
    color: '#DAD7CD',
  },
  confirmButton: {
    backgroundColor: '#D65A31',
    color: '#DAD7CD',
  },
  errorMessage: {
      color: '#D65A31',
      marginBottom: '1rem',
      fontFamily: '"ABeeZee", sans-serif',
      padding: '0.75rem',
      backgroundColor: 'rgba(214, 90, 49, 0.1)',
      borderRadius: '8px',
      border: '1px solid rgba(214, 90, 49, 0.3)',
  }
};

export default DeleteDataModal;