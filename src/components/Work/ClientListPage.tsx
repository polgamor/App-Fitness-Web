import { useAuth } from '../../context/AuthContext';
import ClientCard from './ClientCard';
import AddClientCard from './AddClientCard';
import { Cliente } from '../../context/AuthContext';
import { CSSProperties, useState } from 'react';

interface ClientListPageProps {
  onClientClick: (client: Cliente) => void;
  onAddClient: () => void;
  isActive: boolean;
}

export default function ClientListPage({ 
  onClientClick}: ClientListPageProps) {
  const { user } = useAuth();
  const [isHoveredEmpty, setIsHoveredEmpty] = useState(false);

  const clientes = user?.clientes || [];

  const styles: {
    container: CSSProperties;
    grid: CSSProperties;
    emptyState: CSSProperties;
    emptyIcon: CSSProperties;
    emptyTitle: CSSProperties;
    emptyText: CSSProperties;
    inactiveClient: CSSProperties;
  } = {
    container: {
      height: '100%',
      overflow: 'auto',
      backgroundColor: '#DAD7CD',
      padding: "2rem",
      marginTop: "30px",
      position: "fixed",
    },
    grid: {
      display: 'grid',
      gap: '1.5rem',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gridAutoRows: 'minmax(180px, auto)'
    },
    emptyState: {
      backgroundColor: 'white',
      borderRadius: '0.75rem',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
      padding: '3rem 2rem',
      textAlign: 'center',
      maxWidth: '500px',
      margin: '2rem auto',
      gridColumn: '1 / -1'
    },
    emptyIcon: {
      width: '4rem',
      height: '4rem',
      margin: '0 auto',
      color: '#A3B18A'
    },
    emptyTitle: {
      marginTop: '1.5rem',
      fontSize: '1.25rem',
      fontWeight: 600,
      color: '#344E41'
    },
    emptyText: {
      marginTop: '0.5rem',
      fontSize: '1rem',
      color: '#588157'
    },
    inactiveClient: {
      opacity: 0.5,
      pointerEvents: 'none' as const,
      cursor: 'not-allowed'
    }
  };

  const handleClientClick = (client: Cliente) => {
    if (client.activo) {
      onClientClick(client);
    }
  };

  return (
    <div style={styles.container}>
      {clientes.length > 0 ? (
        <div style={styles.grid}>
          <AddClientCard 
            isHovered={isHoveredEmpty}
            onMouseEnter={() => setIsHoveredEmpty(true)}
            onMouseLeave={() => setIsHoveredEmpty(false)}
          />
          
          {clientes.map(client => (
            <ClientCard
              key={client.id}
              client={client}
              onClick={() => handleClientClick(client)}
            />
          ))}
        </div>
      ) : (
        <AddClientCard 
          isHovered={isHoveredEmpty}
          onMouseEnter={() => setIsHoveredEmpty(true)}
          onMouseLeave={() => setIsHoveredEmpty(false)}
        />
      )}
    </div>
  );
}