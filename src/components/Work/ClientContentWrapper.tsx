import type { Client } from '../../context/AuthContext';
import RoutinesContent from './RoutinesContent';
import DietsContent from './DietsContent';

interface ClientContentWrapperProps {
  client: Client;
  activeSection: 'routines' | 'diets' | 'chat';
}

export default function ClientContentWrapper({
  client,
  activeSection
}: ClientContentWrapperProps) {
  return (
    <div style={{ height: '80vh', width: '100%' }}>
      {activeSection === 'routines' && <RoutinesContent client={client} />}
      {activeSection === 'diets' && <DietsContent client={client} />}
    </div>
  );
}
