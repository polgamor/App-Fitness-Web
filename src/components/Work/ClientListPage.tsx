import { CSSProperties } from 'react';
import { useAuth } from '../../context/AuthContext';
import type { Client } from '../../context/AuthContext';
import ClientCard from './ClientCard';
import AddClientCard from './AddClientCard';

interface ClientListPageProps {
  onClientClick: (client: Client) => void;
}

export default function ClientListPage({ onClientClick }: ClientListPageProps) {
  const { user } = useAuth();

  const clients = user?.clients || [];

  const styles: {
    container: CSSProperties;
    grid: CSSProperties;
  } = {
    container: {
      height: '100%',
      overflow: 'auto',
      backgroundColor: '#DAD7CD',
      padding: '2rem',
      marginTop: '30px',
      position: 'fixed'
    },
    grid: {
      display: 'grid',
      gap: '1.5rem',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gridAutoRows: 'minmax(180px, auto)'
    }
  };

  const handleClientClick = (client: Client) => {
    if (client.isActive) {
      onClientClick(client);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.grid}>
        <AddClientCard />
        {clients.map(client => (
          <ClientCard
            key={client.id}
            client={client}
            onClick={() => handleClientClick(client)}
          />
        ))}
      </div>
    </div>
  );
}
