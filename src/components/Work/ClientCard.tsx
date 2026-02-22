import React from 'react';
import type { Client } from '../../context/AuthContext';
import { useAuth } from '../../context/AuthContext';
import { CSSProperties } from 'react';

interface ClientCardProps {
  client: Client;
  onClick: () => void;
}

export default function ClientCard({ client, onClick }: ClientCardProps) {
  const isActive = client.isActive;
  const { user: currentUser } = useAuth();
  const isTrainerActive = currentUser?.isActive;

  const styles: {
    card: CSSProperties;
    inactiveOverlay: CSSProperties;
    nameSection: CSSProperties;
    fullName: CSSProperties;
    statusBadge: CSSProperties;
    infoSection: CSSProperties;
    infoRow: CSSProperties;
    label: CSSProperties;
    value: CSSProperties;
  } = {
    card: {
      cursor: isTrainerActive ? (isActive ? 'pointer' : 'not-allowed') : 'not-allowed',
      padding: '1.25rem',
      borderRadius: '0.5rem',
      backgroundColor: '#DAD7CD',
      color: '#0B160C',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.2s ease',
      border: `1px solid ${isActive ? '#A3B18A' : '#D1D5DB'}`,
      maxWidth: '300px',
      height: '12rem',
      opacity: isTrainerActive ? (isActive ? 1 : 0.5) : 0.6,
      position: 'relative',
      overflow: 'hidden',
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
    nameSection: {
      marginBottom: '0.75rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    fullName: {
      fontSize: '1.1rem',
      fontWeight: 600,
      margin: 0,
      lineHeight: 1.3,
      color: isActive ? '#0B160C' : '#6B7280',
    },
    statusBadge: {
      backgroundColor: isActive ? '#588157' : '#D65A31',
      color: 'white',
      padding: '0.15rem 0.5rem',
      borderRadius: '4px',
      fontSize: '0.7rem',
      fontWeight: 500,
      marginLeft: '0.5rem',
    },
    infoSection: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      fontSize: '0.9rem',
    },
    infoRow: {
      display: 'flex',
      justifyContent: 'space-between',
    },
    label: {
      fontWeight: 500,
      color: isActive ? '#3A5A40' : '#9CA3AF',
    },
    value: {
      fontWeight: 400,
      textAlign: 'right',
      color: isActive ? '#0B160C' : '#6B7280',
    },
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isActive || !isTrainerActive) return;
    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
    e.currentTarget.style.backgroundColor = '#A3B18A';
    e.currentTarget.style.borderColor = '#588157';
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isActive || !isTrainerActive) return;
    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
    e.currentTarget.style.backgroundColor = '#DAD7CD';
    e.currentTarget.style.borderColor = '#A3B18A';
  };

  const handleClick = () => {
    if (isActive && isTrainerActive) {
      onClick();
    }
  };

  return (
    <div
      onClick={handleClick}
      style={styles.card}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {(!isActive || !isTrainerActive) && (
        <div style={styles.inactiveOverlay}>
          {isTrainerActive ? 'Inactive User' : 'Account Inactive'}
        </div>
      )}
      <div style={styles.nameSection}>
        <h3 style={styles.fullName}>
          {client.firstName} {client.lastName} {client.secondLastName || ''}
        </h3>
        <span style={styles.statusBadge}>{isActive ? 'Active' : 'Inactive'}</span>
      </div>

      <div style={styles.infoSection}>
        <div style={styles.infoRow}>
          <span style={styles.label}>Email:</span>
          <span style={styles.value}>{client.email}</span>
        </div>

        <div style={styles.infoRow}>
          <span style={styles.label}>Phone:</span>
          <span style={styles.value}>{client.phone}</span>
        </div>
      </div>
    </div>
  );
}
