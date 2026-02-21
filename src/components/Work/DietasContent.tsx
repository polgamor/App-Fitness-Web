import { useEffect, useState, CSSProperties } from 'react';
import { useDietas } from '../../context/DietasContext';
import { Timestamp } from 'firebase/firestore';
import DeleteDataModal from '../Modals/DeleteDataModal';
import UpdateDataModal from '../Modals/UpdateDataModal';
import CreateModalData from '../Modals/CreateModalData';
import AlertModal from '../Modals/AlertModal';

interface DietasContentProps {
  client: {
    id: string;
    entrenador_ID: string;
    nombre: string;
  };
}

export default function DietasContent({ client }: DietasContentProps) {
  const {
    dietas,
    fetchDietas,
    loading,
    error,
    eliminarDieta,
    actualizarOpcionComida,
    actualizarComida,
    actualizarDieta
  } = useDietas();

  const [localError, setLocalError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [setDietaToActivate] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLocalError(null);
        await fetchDietas(client.id, client.entrenador_ID);
      } catch (err) {
        console.error('Error loading dietas:', err);
        setLocalError('Error al cargar las dietas');
      }
    };

    loadData();
  }, [client.id, client.entrenador_ID]);

  const retry = async () => {
    setLocalError(null);
    await fetchDietas(client.id, client.entrenador_ID); 
  };

  const dietasCliente = Object.entries(dietas || {})
  .filter(([_, dieta]) => dieta.cliente_ID === client.id)
  .map(([id, dieta]) => ({
    id,
    ...dieta
  }));

  const handleEditClick = (item: any) => {
    setEditingItem({
      id: item.id,
      ...item
    });
    setShowUpdateModal(true);
  };

  const handleDeleteClick = (item: any) => {
    setCurrentItem({
      id: item.id,
      ...item
    });
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!currentItem) return;
    
    try {
      await eliminarDieta(currentItem.id);
      await fetchDietas(client.id, client.entrenador_ID);
      setShowDeleteModal(false);
    } catch (error) {
      setLocalError('Error al eliminar la dieta');
    }
  };

  const handleAddClick = () => {
    setShowCreateModal(true);
  };

  const handleToggleActivo = async (dieta: any) => {
    if (!dieta.activo) {
      const yaActiva = dietasCliente.find(d => d.activo && d.id !== dieta.id);
      if (yaActiva) {
        setDietaToActivate(dieta);
        setAlertModalOpen(true);
        return;
      }
    }

    try {
      await actualizarDieta(dieta.id, { activo: !dieta.activo });
      await fetchDietas(client.id, client.entrenador_ID);
    } catch (err) {
      setLocalError('Error al actualizar dieta');
    }
  };

  const formatDate = (date: Date | Timestamp | undefined): string => {
    if (!date) return 'Fecha no disponible';
    if (date instanceof Date) return date.toLocaleDateString();
    if (date instanceof Timestamp) return date.toDate().toLocaleDateString();
    return 'Fecha no disponible';
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
      color: "#0B160C"
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
    comidaItem: { 
      marginBottom: '1.5rem' 
    },
    trainerData: {
      backgroundColor: '#f0f7f4',
      padding: '0.5rem',
      borderRadius: '0.25rem',
      margin: '0.25rem 0',
      borderLeft: '3px solid #3a5a40'
    },
    trainerLabel: {
      fontWeight: 600,
      color: '#3a5a40',
      marginRight: '0.5rem'
    },
    trainerValue: {
      color: '#588157'
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

  if (loading) return <p style={styles.loadingText}>Cargando dietas...</p>;
  if (error || localError) {
    return (
      <div style={styles.errorMessage}>
        <p>{error || localError}</p>
        <button onClick={retry}>Reintentar</button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.contentArea}>
        <div style={styles.sectionHeader}>
          <h3 style={styles.sectionTitle}>Dietas de {client.nombre}</h3>
          <button style={styles.addButton} onClick={handleAddClick}>
            +
          </button>
        </div>

        {dietasCliente.length === 0 ? (
          <p style={styles.emptyState}>No hay dietas asignadas</p>
        ) : (
          dietasCliente.map((dieta: any, dietaIndex: number) => (
            <div key={dietaIndex} style={styles.card}>
              <div style={{
                ...styles.cardHeader,
                backgroundColor: dieta.activo ? '#588157' : '#999999' // color dinámico
              }}>
                <span>Dieta creada: {formatDate(dieta.fechaCreacion)} | Calorías: {dieta.caloriasTotales}</span>
                  <div style={styles.headerActions}>
                    <label style={{ display: 'flex', alignItems: 'center', color: '#fff', fontSize: '0.875rem', marginRight: '0.5rem' }}>
                      Activa
                      <input 
                        type="checkbox" 
                        checked={dieta.activo} 
                        onChange={() => handleToggleActivo(dieta)} 
                        style={{ marginLeft: '0.5rem' }} 
                      />
                    </label>
                    <button 
                      style={{...styles.actionButton, ...styles.editButton}}
                      onClick={() => handleEditClick(dieta)}
                    >
                      Editar
                    </button>
                    <button 
                      style={{...styles.actionButton, ...styles.deleteButton}}
                      onClick={() => handleDeleteClick(dieta)}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              <div style={styles.cardContent}>
                {dieta.comidas && Object.entries(dieta.comidas).map(([comidaId, comida]: [string, any]) => (
                  <div key={comidaId} style={styles.comidaItem}>
                    <h4 style={{ textTransform: 'capitalize' }}>{comidaId} - {comida.calorias} kcal</h4>
                    {comida.opciones && Object.entries(comida.opciones).map(([opId, opcion]: [string, any]) => (
                      <div key={opId} style={styles.trainerData}>
                        <p style={{ fontWeight: 500 }}>Opción {opId.replace('opcion_', '')}</p>
                        <p style={styles.trainerValue}>{opcion.descripcion}</p>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                          <div>
                            <span style={styles.trainerLabel}>Proteína:</span>
                            <span style={styles.trainerValue}>{opcion.proteina}g</span>
                          </div>
                          <div>
                            <span style={styles.trainerLabel}>Hidratos:</span>
                            <span style={styles.trainerValue}>{opcion.hidratos}g</span>
                          </div>
                          <div>
                            <span style={styles.trainerLabel}>Grasas:</span>
                            <span style={styles.trainerValue}>{opcion.grasas}g</span>
                          </div>
                        </div>
                        {opcion.otros && (
                          <p>
                            <span style={styles.trainerLabel}>Otros:</span>
                            <span style={styles.trainerValue}>{opcion.otros}</span>
                          </p>
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
        onSave={async (dietaId: string | undefined, comidaId: string | undefined, opcionId: string | undefined, updates: any) => {
          try {
            if (dietaId && comidaId && opcionId) {
              await actualizarOpcionComida(dietaId, comidaId, opcionId, updates);
            } else if (dietaId && comidaId) {
              await actualizarComida(dietaId, comidaId, updates);
            } else if (dietaId) {
              await actualizarDieta(dietaId, updates);
            }
            await fetchDietas(client.id, client.entrenador_ID);
            setShowUpdateModal(false);
          } catch (error) {
            setLocalError('Error al actualizar');
          }
        }}
        itemType="dieta"
        initialData={editingItem}
      />

      <CreateModalData
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        itemType="dieta"
        clientId={client.id}
        trainerId={client.entrenador_ID}
      />

      <AlertModal
        isOpen={alertModalOpen}
        message="No puedes activar esta dieta porque ya hay otra activa."
        onClose={() => {
          setAlertModalOpen(false);
          setDietaToActivate(null);
        }}
      />
    </div>
  );
}