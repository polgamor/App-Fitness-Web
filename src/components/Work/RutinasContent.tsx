import { useEffect, useState, CSSProperties } from 'react';
import { useRutinas } from '../../context/RutinasContext';
import { Timestamp } from 'firebase/firestore';
import DeleteDataModal from '../Modals/DeleteDataModal';
import UpdateDataModal from '../Modals/UpdateDataModal';
import CreateModalData from '../Modals/CreateModalData';
import AlertModal from '../Modals/AlertModal';

interface RutinasContentProps {
  client: {
    id: string;
    entrenador_ID: string;
    nombre: string;
  };
}

export default function RutinasContent({ client }: RutinasContentProps) {
  const {
    rutinas,
    fetchRutinas,
    loading,
    error,
    eliminarRutina,
    actualizarEjercicio,
    actualizarRutina,
  } = useRutinas();

  const [localError, setLocalError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [clientRutinas, setClientRutinas] = useState<any[]>([]);
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [setRutinaToActivate] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLocalError(null);
        await fetchRutinas(client.entrenador_ID, client.id);
      } catch (err) {
        console.error('Error loading rutinas:', err);
        setLocalError('Error loading routines');
      }
    };

    loadData();
  }, [client.entrenador_ID, client.id, fetchRutinas]);

  useEffect(() => {
    const filteredRutinas = Object.entries(rutinas || {})
      .filter(([_, rutina]) => rutina.cliente_ID === client.id)
      .map(([id, rutina]) => ({
        id,
        ...rutina
      }));
    
    setClientRutinas(filteredRutinas);
  }, [rutinas, client.id]);

  const retry = async () => {
    setLocalError(null);
    await fetchRutinas(client.entrenador_ID, client.id);
  };

  const handleEditClick = (rutina: any) => {
    setEditingItem({
      id: rutina.id,
      ...rutina
    });
    setShowUpdateModal(true);
  };

  const handleDeleteClick = (rutina: any) => {
    setCurrentItem({
      id: rutina.id,
      ...rutina
    });
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!currentItem) return;
    
    try {
      await eliminarRutina(currentItem.id);
      setShowDeleteModal(false);
    } catch (error) {
      setLocalError('Error deleting routine');
    }
  };

  const handleAddClick = () => {
    setShowCreateModal(true);
  };

  const handleToggleActivo = async (rutina: any) => {
    if (!rutina.activo) {
      const yaActiva = clientRutinas.find(r => r.activo && r.id !== rutina.id);
      if (yaActiva) {
        setRutinaToActivate(rutina);
        return;
      }
    }

    try {
      await actualizarRutina(rutina.id, { activo: !rutina.activo });
      await fetchRutinas(client.entrenador_ID, client.id);
    } catch (err) {
      setLocalError('Error updating routine');
    }
  };

  const formatDate = (date: Date | Timestamp | undefined): string => {
    if (!date) return 'Date not available';
    if (date instanceof Date) return date.toLocaleDateString();
    if (date instanceof Timestamp) return date.toDate().toLocaleDateString();
    return 'Date not available';
  };

  const styles: { [key: string]: CSSProperties } = {
    container: { 
      flex: 1, 
      overflow: 'auto', 
      backgroundColor: '#DAD7CD', 
      padding: '1.5rem', 
      height: '100%' 
    },
    contentArea: { 
      maxWidth: '80rem' 
    },
    sectionHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1rem',
      borderBottom: '2px solid #588157',
      paddingBottom: '0.5rem'
    },
    sectionTitle: { 
      fontSize: '1.25rem', 
      fontWeight: 600, 
      color: '#0B160C',
    },
    addButton: {
      backgroundColor: '#588157',
      color: 'white',
      border: 'none',
      borderRadius: '50%',
      width: '32px',
      height: '32px',
      fontSize: '1.25rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'all 0.2s',
    },
    card: { 
      backgroundColor: 'white', 
      borderRadius: '0.5rem', 
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)', 
      marginBottom: '1.5rem', 
      overflow: 'hidden',
      color: "#0B160C",
    },
    cardHeader: { 
      backgroundColor: '#588157', 
      color: 'white', 
      padding: '0.75rem 1rem', 
      fontWeight: 500,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    cardContent: { 
      padding: '1rem' 
    },
    ejercicioItem: { 
      marginBottom: '1rem', 
      paddingBottom: '1rem', 
      borderBottom: '1px solid #eee' 
    },
    trainerData: {
    backgroundColor: '#e6f4ea',
    padding: '0.5rem',
    borderRadius: '0.5rem',
    margin: '0.25rem 0',
    borderLeft: '5px solid #2d6a4f'
  },
    trainerLabel: {
      fontWeight: 700,
      color: '#1b4332',
      marginRight: '0.5rem'
    },
    trainerValue: {
      color: '#2d6a4f'
    },
    clientData: {
      backgroundColor: '#fff3e0',
      padding: '0.5rem',
      borderRadius: '0.5rem',
      margin: '0.25rem 0',
      borderLeft: '5px solid #f4a261'
    },
    clientLabel: {
      fontWeight: 700,
      color: '#e76f51',
      marginRight: '0.5rem'
    },
    clientValue: {
      color: '#d35400'
    },
    completadoTrue: {
      backgroundColor: '#81c784',
      color: '#1b4332',
      padding: '0.25rem 0.5rem',
      borderRadius: '0.25rem',
      fontWeight: 600,
      display: 'inline-block'
    },
    completadoFalse: {
      backgroundColor: '#e57373',
      color: '#fff',
      padding: '0.25rem 0.5rem',
      borderRadius: '0.25rem',
      fontWeight: 600,
      display: 'inline-block'
    },
    observacionBox: {
      backgroundColor: '#fff8dc',
      border: '1px dashed #e9c46a',
      padding: '0.5rem',
      borderRadius: '0.25rem',
      marginTop: '0.5rem',
      color: '#6d4c41',
      fontStyle: 'italic'
    },
    loadingText: { 
      textAlign: 'center', 
      color: '#0B160C', 
      margin: '2rem 0' 
    },
    emptyState: { 
      textAlign: 'center', 
      color: '#4b5563', 
      padding: '2rem 0' 
    },
    errorMessage: { 
      textAlign: 'center', 
      color: '#d65a31', 
      margin: '2rem 0', 
      padding: '1rem', 
      backgroundColor: 'rgba(214, 90, 49, 0.1)', 
      borderRadius: '0.5rem' 
    },
    ejercicioDetails: {
      display: 'flex',
      gap: '1rem',
      flexWrap: 'wrap',
      marginTop: '0.5rem',
    },
    headerActions: {
      display: 'flex',
      gap: '0.5rem'
    },
    actionButton: {
      padding: '0.25rem 0.5rem',
      borderRadius: '0.25rem',
      border: 'none',
      cursor: 'pointer',
      fontWeight: 500,
      fontSize: '0.875rem',
      transition: 'all 0.2s'
    },
    editButton: {
      backgroundColor: '#3a5a40',
      color: 'white'
    },
    deleteButton: {
      backgroundColor: '#d65a31',
      color: 'white'
    },
    label: {
      fontWeight: 500,
      color: '#0B160C',
      marginRight: '0.5rem'
    },
    value: {
      color: '#4b5563'
    }
  };

  if (loading) return <p style={styles.loadingText}>Loading routines...</p>;
  if (error || localError) {
    return (
      <div style={styles.errorMessage}>
        <p>{error || localError}</p>
        <button onClick={retry}>Retry</button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.contentArea}>
        <div style={styles.sectionHeader}>
          <h3 style={styles.sectionTitle}>Routines for {client.nombre}</h3>
          <button style={styles.addButton} onClick={handleAddClick}>
            +
          </button>
        </div>

        {clientRutinas.length === 0 ? (
          <p style={styles.emptyState}>No routines assigned</p>
        ) : (
          clientRutinas.map((rutina) => (
            <div key={rutina.id} style={styles.card}>
              <div style={{
                ...styles.cardHeader,
                backgroundColor: rutina.activo ? '#588157' : '#999999' 
              }}>
                <span>Routine created: {formatDate(rutina.fechaCreacion)}</span>
                <div style={styles.headerActions}>
                  <label style={{ display: 'flex', alignItems: 'center', color: '#fff', fontSize: '0.875rem', marginRight: '0.5rem' }}>
                    Active
                    <input
                      type="checkbox"
                      checked={rutina.activo}
                      onChange={() => handleToggleActivo(rutina)}
                      style={{ marginLeft: '0.5rem' }}
                    />
                    </label>
                  <button
                    style={{...styles.actionButton, ...styles.editButton}}
                    onClick={() => handleEditClick(rutina)}
                  >
                    Edit
                  </button>
                  <button
                    style={{...styles.actionButton, ...styles.deleteButton}}
                    onClick={() => handleDeleteClick(rutina)}
                  >
                    Delete
                  </button>
                </div>
              </div>
              
              <div style={styles.cardContent}>
                {rutina.dias && Object.entries(rutina.dias)
                  .sort(([diaA], [diaB]) => {
                    const numA = parseInt(diaA.replace('dia', ''));
                    const numB = parseInt(diaB.replace('dia', ''));
                    return numA - numB;
                  })
                  .map(([diaId, dia]: [string, any]) => (
                    <div key={diaId} style={{ marginBottom: '1.5rem' }}>
                      <h4>Day {diaId.replace('dia', '')}</h4>
                      {dia.horaEntrenamiento && (
                        <p>
                          <span style={styles.label}>Training time:</span>
                          <span style={styles.value}>{dia.horaEntrenamiento}</span>
                        </p>
                      )}
                      
                      {dia.ej && Object.entries(dia.ej).map(([ejId, ejercicio]: [string, any]) => (
                        <div key={ejId} style={styles.ejercicioItem}>
                          <h5>{ejercicio.nombre || `Ejercicio ${ejId}`}</h5>
                          
                          {ejercicio.series && (
                            <div style={styles.trainerData}>
                              <span style={styles.trainerLabel}>Sets:</span>
                              <span style={styles.trainerValue}>{ejercicio.series}</span>
                            </div>
                          )}

                          <div style={styles.ejercicioDetails}>
                            {ejercicio.pesoE && (
                              <div style={styles.trainerData}>
                                <span style={styles.trainerLabel}>Trainer Weight:</span>
                                <span style={styles.trainerValue}>{ejercicio.pesoE} kg</span>
                              </div>
                            )}

                            {ejercicio.repsE && (
                              <div style={styles.trainerData}>
                                <span style={styles.trainerLabel}>Trainer Reps:</span>
                                <span style={styles.trainerValue}>{ejercicio.repsE}</span>
                              </div>
                            )}

                            {ejercicio.RIRE && (
                              <div style={styles.trainerData}>
                                <span style={styles.trainerLabel}>Trainer RIR:</span>
                                <span style={styles.trainerValue}>{ejercicio.RIRE}</span>
                              </div>
                            )}

                            {ejercicio.pesoC && (
                              <div style={styles.clientData}>
                                <span style={styles.clientLabel}>Client Weight:</span>
                                <span style={styles.clientValue}>{ejercicio.pesoC} kg</span>
                              </div>
                            )}

                            {ejercicio.repsC && (
                              <div style={styles.clientData}>
                                <span style={styles.clientLabel}>Client Reps:</span>
                                <span style={styles.clientValue}>{ejercicio.repsC}</span>
                              </div>
                            )}

                            {ejercicio.RIRC && (
                              <div style={styles.clientData}>
                                <span style={styles.clientLabel}>Client RIR:</span>
                                <span style={styles.clientValue}>{ejercicio.RIRC}</span>
                              </div>
                            )}
                          </div>

                          {ejercicio.completado !== undefined && (
                            <div style={{ marginTop: '0.5rem' }}>
                              <span style={styles.label}>Completed: </span>
                              <span style={ejercicio.completado ? styles.completadoTrue : styles.completadoFalse}>
                                {ejercicio.completado ? 'Yes' : 'No'}
                              </span>
                            </div>
                          )}

                          {ejercicio.observaciones !== undefined && (
                            <div style={styles.observacionBox}>
                              <span>{ejercicio.observaciones}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
              </div>
            </div>
          ))
        )}
      </div>

      <DeleteDataModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        currentItem={currentItem}
      />

      <UpdateDataModal
        isOpen={showUpdateModal}
        onClose={() => {
          setShowUpdateModal(false);
          setEditingItem(null);
        }}
        onSave={async (rutinaId: string | undefined, diaId: string | undefined, ejercicioId: string | undefined, updates: any) => {
          try {
            if (rutinaId && diaId && ejercicioId) {
              await actualizarEjercicio(rutinaId, diaId, ejercicioId, updates);
            } else if (rutinaId && editingItem?.id) {
              await actualizarRutina(rutinaId, updates);
            }
            await fetchRutinas(client.id, client.entrenador_ID);
            setShowUpdateModal(false);
          } catch (error) {
            setLocalError('Error updating');
          }
        }}
        itemType="rutina"
        initialData={editingItem}
      />

      <CreateModalData
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        itemType="rutina"
        clientId={client.id}
        trainerId={client.entrenador_ID}
      />

      <AlertModal 
        isOpen={alertModalOpen}
        message="You cannot activate this routine because another one is already active."
        onClose={() => {
          setAlertModalOpen(false);
          setRutinaToActivate(null); 
        }}
      />
    </div>
  );
}