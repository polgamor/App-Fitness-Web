import React from 'react';

interface AlertModalProps {
  isOpen: boolean;
  message: string;
  onClose: () => void;
}

export default function AlertModal({ isOpen, message, onClose }: AlertModalProps) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex',
      justifyContent: 'center', alignItems: 'center', zIndex: 1000
    }}>
      <div style={{
        backgroundColor: '#fff', padding: '2rem', borderRadius: '0.5rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)', maxWidth: '400px', textAlign: 'center'
      }}>
        <p style={{ marginBottom: '1rem', color: '#333' }}>
          {message}
        </p>
        <button onClick={onClose} style={{
          backgroundColor: '#588157', color: '#fff', padding: '0.5rem 1rem',
          border: 'none', borderRadius: '0.25rem', cursor: 'pointer'
        }}>
          Got it
        </button>
      </div>
    </div>
  );
}
