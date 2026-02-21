import { Cliente } from '../../context/AuthContext';
import RutinasContent from './RutinasContent';
import DietasContent from './DietasContent';

interface ClientContentWrapperProps {
  client: Cliente;
  activeSection: 'rutinas' | 'dietas' | 'chat';
}

export default function ClientContentWrapper({ 
  client, 
  activeSection
}: ClientContentWrapperProps) {
  return (
    <div style={{ height: '80vh', width: '100%' }}>
      {activeSection === 'rutinas' && <RutinasContent client={client} />}
      {activeSection === 'dietas' && <DietasContent client={client} />}
    </div>
  );
}