import { useState, useEffect, CSSProperties } from 'react';
import { useAuth } from '../../context/AuthContext';
import type { Client } from '../../context/AuthContext';
import WorkNavbar from '../../components/Work/WorkNavbar';
import ClientTabs from '../../components/Work/ClientTabsBar';
import ClientDetailView from '../../components/Work/ClientDetailView';
import ClientListPage from '../../components/Work/ClientListPage';

type OpenClient = Client & {
  activeMenuItem: string;
};

export default function WorkPage() {
  const { user } = useAuth();
  const [openClients, setOpenClients] = useState<OpenClient[]>([]);
  const [activeClientId, setActiveClientId] = useState<string | null>(null);
  const [showClientsPanel, setShowClientsPanel] = useState(true);

  useEffect(() => {
    const savedState = localStorage.getItem('workPageState');
    if (savedState) {
      const parsed = JSON.parse(savedState);
      setOpenClients(parsed.openClients || []);
      setActiveClientId(parsed.activeClientId || null);
      setShowClientsPanel(parsed.showClientsPanel !== false);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('workPageState', JSON.stringify({
      openClients,
      activeClientId,
      showClientsPanel
    }));
  }, [openClients, activeClientId, showClientsPanel]);

  const styles: {
    pageContainer: CSSProperties;
    mainContainer: CSSProperties;
    contentArea: CSSProperties;
  } = {
    pageContainer: {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      backgroundColor: '#DAD7CD'
    },
    mainContainer: {
      display: 'flex',
      flex: 1,
      overflow: 'hidden',
      marginTop: '0px'
    },
    contentArea: {
      flex: 1,
      overflow: 'auto',
      backgroundColor: '#DAD7CD'
    }
  };

  const handleClientClick = (client: Client) => {
    const existing = openClients.find(c => c.id === client.id);
    if (existing) {
      setActiveClientId(client.id);
      setShowClientsPanel(false);
      return;
    }

    const newClient: OpenClient = { ...client, activeMenuItem: 'info' };
    setOpenClients([...openClients, newClient]);
    setActiveClientId(client.id);
    setShowClientsPanel(false);
  };

  const handleCloseTab = (clientId: string) => {
    const remaining = openClients.filter(c => c.id !== clientId);
    setOpenClients(remaining);

    if (activeClientId === clientId) {
      setActiveClientId(remaining.length > 0 ? remaining[0].id : null);
      if (remaining.length === 0) setShowClientsPanel(true);
    }
  };

  const handleTabClick = (clientId: string) => {
    setActiveClientId(clientId);
    setShowClientsPanel(false);
  };

  const handleOpenClientsPanel = () => {
    setShowClientsPanel(true);
    setActiveClientId(null);
  };

  const activeClient = openClients.find(c => c.id === activeClientId);

  if (!user) return null;

  return (
    <div style={styles.pageContainer}>
      <WorkNavbar />

      <ClientTabs
        openClients={openClients}
        activeClientId={activeClientId}
        onTabClick={handleTabClick}
        onTabClose={handleCloseTab}
        onShowClientList={handleOpenClientsPanel}
      />

      <div style={styles.mainContainer}>
        <main style={styles.contentArea}>
          {showClientsPanel ? (
            <ClientListPage onClientClick={handleClientClick} />
          ) : activeClient ? (
            <ClientDetailView client={activeClient} />
          ) : null}
        </main>
      </div>
    </div>
  );
}
