import { Cliente } from '../../context/AuthContext';
import { CSSProperties } from 'react';

interface ClientSidebarProps {
  client: Cliente;
  activeSection: 'rutinas' | 'dietas' | 'chat';
  onSectionChange: (section: 'rutinas' | 'dietas'  | 'chat') => void;
}

const topSections = [
  { id: 'dietas', name: 'Diets', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { id: 'rutinas', name: 'Routines', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
];

const bottomSections = [
  { id: 'chat', name: 'Chat', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' }
] as const;

export default function ClientSidebar({ 
  activeSection, 
  onSectionChange,
  client
}: ClientSidebarProps) {
  const nombreCompleto = `${client.nombre} ${client.apellido}${client.apellido2 ? ' ' + client.apellido2 : ''}`;

  const styles: {
    sidebar: CSSProperties;
    sidebarContent: CSSProperties;
    header: CSSProperties;
    title: CSSProperties;
    subtitle: CSSProperties;
    nav: CSSProperties;
    navItem: (isActive: boolean) => CSSProperties;
    navIcon: CSSProperties;
    sectionGroup: CSSProperties;
    nombreConIcono: CSSProperties;
    statusIcon: (isActive: boolean) => CSSProperties;
  } = {
    sidebar: {
      width: '18rem',
      backgroundColor: '#DAD7CD', 
      borderRight: '1px solid #0B160C',
      flexShrink: 0,
      color: '#0B160C',
      display: 'flex',
      flexDirection: 'column',
      height: '92%',
      justifyContent: 'space-between',
      overflow: 'auto'
    },
    sidebarContent: {
      padding: '1.5rem'
    },
    header: {
      marginBottom: '1.5rem',
    },
    title: {
      fontSize: '1.125rem',
      fontWeight: 600,
      color: '#0B160C',
      marginBottom: '0.5rem'
    },
    subtitle: {
      fontSize: '0.875rem',
      color: '#0B160C',
      marginTop: '0.25rem'
    },
    nav: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem'
    },
    navItem: (isActive) => ({
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      padding: '0.75rem 1rem',
      fontSize: '0.875rem',
      fontWeight: 500,
      borderRadius: '0.375rem',
      backgroundColor: isActive ? '#588157' : 'transparent',
      color: isActive ? 'white' : '#588157',
      cursor: 'pointer',
      border: 'none',
      transition: 'all 0.2s ease',
      outline: 'none',
      textAlign: 'left'
    }),
    navIcon: {
      width: '1.25rem',
      height: '1.25rem',
      marginRight: '0.75rem',
      flexShrink: 0,
      stroke: 'currentColor'
    },
    sectionGroup: {
      marginBottom: '1.5rem'
    },
    nombreConIcono: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    statusIcon: (isActive: boolean): CSSProperties => ({
      width: '1rem',
      height: '1rem',
      stroke: isActive ? '#588157' : '#d65a31',
      marginLeft: '0.25rem',
      marginTop: "0.7rem"
    }),
  };

  const handleNavClick = (sectionId: 'rutinas' | 'dietas' | 'chat') => {
    if (sectionId !== activeSection) {
      onSectionChange(sectionId); 
    }
  };

  function traducirObjetivo(objetivo: number | string): string {
    switch (objetivo) {
      case 1:
      case '1':
        return 'Cutting';
      case 2:
      case '2':
        return 'Bulking';
      default:
        return 'Unknown goal';
    }
  }

  return (
    <div style={styles.sidebar}>
      <div style={styles.sidebarContent}>
        <div style={styles.header}>
          <div style={styles.nombreConIcono}>
            <h3 style={styles.title}>{nombreCompleto}</h3>
            <svg 
              viewBox="0 0 24 24" 
              fill="none" 
              style={styles.statusIcon(client.activo)}
              >
              <path 
                strokeWidth="5" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d={client.activo ? "M5 13l4 4L19 7" : "M6 6l12 12M6 18L18 6"} 
              />
            </svg>
          </div>
          <p style={{ ...styles.subtitle, marginTop: '0.25rem' }}>
            Goal: {traducirObjetivo(client.objetivo)}
          </p>
          <p style={{ ...styles.subtitle, marginTop: '0.25rem' }}>{client.altura} cm</p>
          <p style={{ ...styles.subtitle, marginTop: '0.25rem' }}>{client.peso} kg</p>
        </div>
        {/* Grupo superior - Dietas, Rutinas, Suplementos */}
        <div style={styles.sectionGroup}>
          <nav style={styles.nav}>
            {topSections.map((section) => (
              <button
                key={section.id}
                onClick={() => handleNavClick(section.id as 'rutinas' | 'dietas' )}
                style={styles.navItem(activeSection === section.id)}
              >
                <svg 
                  style={styles.navIcon}
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor"
                >
                  <path 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    d={section.icon} 
                  />
                </svg>
                {section.name}
              </button>
            ))}
          </nav>
        </div>
      </div>
      
      {/* Grupo inferior - Chat */}
      <div style={{ ...styles.sidebarContent, borderTop: '1px solid #0B160C', paddingTop: '1.5rem' }}>
        <nav style={styles.nav}>
          {bottomSections.map((section) => (
            <button
              key={section.id}
              onClick={() => handleNavClick(section.id)}
              style={styles.navItem(activeSection === section.id)}
              aria-label={section.name}
            >
              <svg 
                style={styles.navIcon}
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor"
                aria-hidden="true"
              >
                <path 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  d={section.icon} 
                />
              </svg>
              {section.name}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}