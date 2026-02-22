import type { Client } from '../../context/AuthContext';
import { useRef } from 'react';
import { CSSProperties } from 'react';

interface ClientTabsProps {
  openClients: Client[];
  activeClientId: string | null;
  onTabClick: (clientId: string) => void;
  onTabClose: (clientId: string) => void;
  onShowClientList: () => void;
}

interface ExtendedCSSProperties extends React.CSSProperties {
  '::-webkit-scrollbar'?: React.CSSProperties;
  ':hover'?: React.CSSProperties;
  ':after'?: React.CSSProperties;
}

export default function ClientTabsBar({
  openClients,
  activeClientId,
  onTabClick,
  onTabClose,
  onShowClientList
}: ClientTabsProps) {
  const tabsRef = useRef<HTMLDivElement>(null);

  const styles: {
    container: CSSProperties;
    clientButton: CSSProperties;
    tabsContainer: ExtendedCSSProperties;
    tab: (isActive: boolean) => CSSProperties;
    tabText: CSSProperties;
    closeButton: CSSProperties;
    closeButtonHover: CSSProperties;
    activeTabIndicator: CSSProperties;
  } = {
    container: {
      display: 'flex',
      backgroundColor: '#a3b18a',
      height: '42px',
      alignItems: 'center',
      width: '100%',
      position: 'fixed',
      top: '60px',
      zIndex: 40
    },
    clientButton: {
      padding: '0 16px',
      height: '100%',
      fontSize: '0.875rem',
      fontWeight: 500,
      display: 'flex',
      alignItems: 'center',
      backgroundColor: activeClientId === null ? '#DAD7CD' : '#DAD7CD',
      color: activeClientId === null ? '#0B160C' : '#A3B18A',
      cursor: 'pointer',
      flexShrink: 0,
      border: 'none',
      borderRadius: '15px 15px 0 0',
      transition: 'all 0.2s ease',
    },
    tabsContainer: {
      display: 'flex',
      flex: 1,
      height: '100%',
      overflowX: 'auto',
      alignItems: 'stretch',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
    },
    tab: (isActive) => ({
      display: 'flex',
      alignItems: 'center',
      padding: '0 16px',
      height: '100%',
      cursor: 'pointer',
      minWidth: '120px',
      maxWidth: '200px',
      backgroundColor: isActive ? '#DAD7CD' : '#DAD7CD',
      color: isActive ? '#0B160C' : '#A3B18A',
      fontWeight: isActive ? 600 : 500,
      border: 'none',
      borderRadius: '12px 12px 0 0',
      position: 'relative',
      transition: 'all 0.2s ease',
    }),
    tabText: {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      flex: 1,
      textAlign: 'left'
    },
    closeButton: {
      marginLeft: '8px',
      color: '#A3B18A',
      borderRadius: '50%',
      padding: '2px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      backgroundColor: 'transparent',
      border: 'none',
      transition: 'all 0.2s ease',
      width: '18px',
      height: '18px',
    },
    closeButtonHover: {
      backgroundColor: 'rgba(214, 90, 49, 0.1)',
      color: '#D65A31'
    },
    activeTabIndicator: {},
  };

  return (
    <div style={styles.container}>
      <button onClick={onShowClientList} style={styles.clientButton}>
        Clients
      </button>

      <div ref={tabsRef} style={styles.tabsContainer}>
        {openClients.map((client) => (
          <div
            key={client.id}
            style={styles.tab(client.id === activeClientId)}
            onClick={() => onTabClick(client.id)}
          >
            <span style={styles.tabText}>
              {client.firstName}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTabClose(client.id);
              }}
              style={styles.closeButton}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = styles.closeButtonHover.backgroundColor || '';
                e.currentTarget.style.color = styles.closeButtonHover.color || '';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#A3B18A';
              }}
              aria-label={`Close ${client.firstName}`}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            {client.id === activeClientId && <div style={styles.activeTabIndicator} />}
          </div>
        ))}
      </div>
    </div>
  );
}
