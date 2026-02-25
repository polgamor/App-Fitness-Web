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

const PAGE_STYLES: {
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
    overflow: 'hidden'
  },
  contentArea: {
    flex: 1,
    overflow: 'auto',
    backgroundColor: '#DAD7CD'
  }
};

const STATE_KEY = 'workPageState';

export default function WorkPage() {
  const { user } = useAuth();
  const [openClients, setOpenClients] = useState<OpenClient[]>([]);
  const [activeClientId, setActiveClientId] = useState<string | null>(null);
  const [showClientsPanel, setShowClientsPanel] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STATE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setOpenClients(parsed.openClients || []);
        setActiveClientId(parsed.activeClientId || null);
        setShowClientsPanel(parsed.showClientsPanel !== false);
      }
    } catch {
      localStorage.removeItem(STATE_KEY);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STATE_KEY, JSON.stringify({
        openClients,
        activeClientId,
        showClientsPanel
      }));
    } catch {
      // localStorage not available or quota exceeded — ignore
    }
  }, [openClients, activeClientId, showClientsPanel]);

  const handleClientClick = (client: Client) => {
    setOpenClients(prev => {
      if (prev.find(c => c.id === client.id)) return prev;
      return [...prev, { ...client, activeMenuItem: 'info' }];
    });
    setActiveClientId(client.id);
    setShowClientsPanel(false);
  };

  const handleCloseTab = (clientId: string) => {
    setOpenClients(prev => {
      const remaining = prev.filter(c => c.id !== clientId);
      if (activeClientId === clientId) {
        setActiveClientId(remaining.length > 0 ? remaining[0].id : null);
        if (remaining.length === 0) setShowClientsPanel(true);
      }
      return remaining;
    });
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
    <div style={PAGE_STYLES.pageContainer}>
      <WorkNavbar />

      <ClientTabs
        openClients={openClients}
        activeClientId={activeClientId}
        onTabClick={handleTabClick}
        onTabClose={handleCloseTab}
        onShowClientList={handleOpenClientsPanel}
      />

      <div style={PAGE_STYLES.mainContainer}>
        <main style={PAGE_STYLES.contentArea}>
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
