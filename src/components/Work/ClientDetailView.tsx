import { useState } from 'react';
import { Cliente } from '../../context/AuthContext';
import { CSSProperties } from 'react';
import ClientSidebar from './ClientSidebar'; 
import ClientContentWrapper from './ClientContentWrapper';

interface ClientDetailViewProps {
  client: Cliente;
}

export default function ClientDetailView({ client }: ClientDetailViewProps) {
  const [activeSection, setActiveSection] = useState<'rutinas' | 'dietas' | 'chat'>('rutinas');

  const styles: {
    container: CSSProperties;
  } = {
    container: {
      display: 'flex',
      height: 'calc(100vh - 30px)',
      width: '100%',
      backgroundColor: '#DAD7CD',
      marginTop: "30px",
      position: "fixed",
      overflow: "hidden"
    }
  };

  return (
    <div style={styles.container}>
      <ClientSidebar
        client={client}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />
      <ClientContentWrapper
        client={client}
        activeSection={activeSection}
      />
    </div>
  );
}