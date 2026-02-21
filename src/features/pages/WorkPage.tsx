import { useState, useEffect } from 'react';
import { useAuth, Cliente } from '../../context/AuthContext';
import WorkNavbar from '../../components/Work/WorkNavbar';
import ClientTabs from '../../components/Work/ClientTabsBar';
import ClientDetailView from '../../components/Work/ClientDetailView';
import ClientListPage from '../../components/Work/ClientListPage';
import { CSSProperties } from 'react';

type OpenClient = Cliente & {
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
      const { openClients, activeClientId, showClientsPanel } = JSON.parse(savedState);
      setOpenClients(openClients || []);
      setActiveClientId(activeClientId || null);
      setShowClientsPanel(showClientsPanel !== false);
    }
  }, []);

  useEffect(() => {
    const stateToSave = {
      openClients,
      activeClientId,
      showClientsPanel
    };
    localStorage.setItem('workPageState', JSON.stringify(stateToSave));
  }, [openClients, activeClientId, showClientsPanel]);

  // Estilos con tipado correcto usando CSSProperties
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

  const handleClientClick = (cliente: Cliente) => {
    const existingClient = openClients.find(c => c.id === cliente.id);
    if (existingClient) {
      setActiveClientId(cliente.id);
      setShowClientsPanel(false);
      return;
    }

    const newClient: OpenClient = {
      ...cliente,
      activeMenuItem: 'info',
    };

    setOpenClients([...openClients, newClient]);
    setActiveClientId(cliente.id);
    setShowClientsPanel(false);
  };

  const handleCloseTab = (clientId: string) => {
    const newOpenClients = openClients.filter(c => c.id !== clientId);
    setOpenClients(newOpenClients);

    if (activeClientId === clientId) {
      setActiveClientId(newOpenClients.length > 0 ? newOpenClients[0].id : null);
      if (newOpenClients.length === 0) {
        setShowClientsPanel(true);
      }
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

  const handleMenuItemClick = (clientId: string, menuItemId: string) => {
    setOpenClients(openClients.map(client =>
      client.id === clientId ? { ...client, activeMenuItem: menuItemId } : client
    ));
  };

  const handleAddClient = () => {
    // Lógica para agregar nuevo cliente
    console.log("Agregar nuevo cliente");
    // Aquí podrías abrir un modal o redirigir a un formulario
  };

  const activeClient = openClients.find(c => c.id === activeClientId);

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
            <ClientListPage 
              onClientClick={handleClientClick} 
              onAddClient={handleAddClient}
            />
          ) : activeClient ? (
            <ClientDetailView client={activeClient} />
          ) : null}
        </main>
      </div>
    </div>
  );
}