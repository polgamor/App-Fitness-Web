import { useEffect, useState, CSSProperties } from 'react';
import { useRoutines } from '../../context/RoutinesContext';
import type { Client } from '../../context/AuthContext';
import { Timestamp } from 'firebase/firestore';
import DeleteDataModal from '../Modals/DeleteDataModal';
import UpdateDataModal from '../Modals/UpdateDataModal';
import CreateDataModal from '../Modals/CreateDataModal';
import AlertModal from '../Modals/AlertModal';

interface RoutinesContentProps {
  client: Client;
}

export default function RoutinesContent({ client }: RoutinesContentProps) {
  const {
    routines,
    fetchRoutines,
    loading,
    error,
    deleteRoutine,
    updateExercise,
    updateRoutine,
  } = useRoutines();

  const [localError, setLocalError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [clientRoutines, setClientRoutines] = useState<any[]>([]);
  const [alertModalOpen, setAlertModalOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLocalError(null);
        await fetchRoutines(client.trainerId, client.id);
      } catch (err) {
        console.error('Error loading routines:', err);
        setLocalError('Error loading routines');
      }
    };

    loadData();
  }, [client.trainerId, client.id, fetchRoutines]);

  useEffect(() => {
    const filtered = Object.entries(routines || {})
      .filter(([, routine]) => routine.clientId === client.id)
      .map(([id, routine]) => ({ id, ...routine }));

    setClientRoutines(filtered);
  }, [routines, client.id]);

  const retry = async () => {
    setLocalError(null);
    await fetchRoutines(client.trainerId, client.id);
  };

  const handleEditClick = (routine: any) => {
    setEditingItem({ id: routine.id, ...routine });
    setShowUpdateModal(true);
  };

  const handleDeleteClick = (routine: any) => {
    setCurrentItem({ id: routine.id, ...routine });
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!currentItem) return;
    try {
      await deleteRoutine(currentItem.id);
      setShowDeleteModal(false);
    } catch (err) {
      setLocalError('Error deleting routine');
    }
  };

  const handleToggleActive = async (routine: any) => {
    if (!routine.isActive) {
      const alreadyActive = clientRoutines.find(r => r.isActive && r.id !== routine.id);
      if (alreadyActive) {
        setAlertModalOpen(true);
        return;
      }
    }

    try {
      await updateRoutine(routine.id, { isActive: !routine.isActive });
      await fetchRoutines(client.trainerId, client.id);
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
    contentArea: { maxWidth: '80rem' },
    sectionHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1rem',
      borderBottom: '2px solid #588157',
      paddingBottom: '0.5rem'
    },
    sectionTitle: { fontSize: '1.25rem', fontWeight: 600, color: '#0B160C' },
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
      color: '#0B160C',
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
    cardContent: { padding: '1rem' },
    exerciseItem: {
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
    trainerLabel: { fontWeight: 700, color: '#1b4332', marginRight: '0.5rem' },
    trainerValue: { color: '#2d6a4f' },
    clientData: {
      backgroundColor: '#fff3e0',
      padding: '0.5rem',
      borderRadius: '0.5rem',
      margin: '0.25rem 0',
      borderLeft: '5px solid #f4a261'
    },
    clientLabel: { fontWeight: 700, color: '#e76f51', marginRight: '0.5rem' },
    clientValue: { color: '#d35400' },
    completedTrue: {
      backgroundColor: '#81c784',
      color: '#1b4332',
      padding: '0.25rem 0.5rem',
      borderRadius: '0.25rem',
      fontWeight: 600,
      display: 'inline-block'
    },
    completedFalse: {
      backgroundColor: '#e57373',
      color: '#fff',
      padding: '0.25rem 0.5rem',
      borderRadius: '0.25rem',
      fontWeight: 600,
      display: 'inline-block'
    },
    notesBox: {
      backgroundColor: '#fff8dc',
      border: '1px dashed #e9c46a',
      padding: '0.5rem',
      borderRadius: '0.25rem',
      marginTop: '0.5rem',
      color: '#6d4c41',
      fontStyle: 'italic'
    },
    loadingText: { textAlign: 'center', color: '#0B160C', margin: '2rem 0' },
    emptyState: { textAlign: 'center', color: '#4b5563', padding: '2rem 0' },
    errorMessage: {
      textAlign: 'center',
      color: '#d65a31',
      margin: '2rem 0',
      padding: '1rem',
      backgroundColor: 'rgba(214, 90, 49, 0.1)',
      borderRadius: '0.5rem'
    },
    exerciseDetails: { display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.5rem' },
    headerActions: { display: 'flex', gap: '0.5rem' },
    actionButton: {
      padding: '0.25rem 0.5rem',
      borderRadius: '0.25rem',
      border: 'none',
      cursor: 'pointer',
      fontWeight: 500,
      fontSize: '0.875rem',
      transition: 'all 0.2s'
    },
    editButton: { backgroundColor: '#3a5a40', color: 'white' },
    deleteButton: { backgroundColor: '#d65a31', color: 'white' },
    label: { fontWeight: 500, color: '#0B160C', marginRight: '0.5rem' },
    value: { color: '#4b5563' }
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
          <h3 style={styles.sectionTitle}>{client.firstName}'s Routines</h3>
          <button style={styles.addButton} onClick={() => setShowCreateModal(true)}>
            +
          </button>
        </div>

        {clientRoutines.length === 0 ? (
          <p style={styles.emptyState}>No routines assigned</p>
        ) : (
          clientRoutines.map((routine) => (
            <div key={routine.id} style={styles.card}>
              <div style={{
                ...styles.cardHeader,
                backgroundColor: routine.isActive ? '#588157' : '#999999'
              }}>
                <span>Routine created: {formatDate(routine.createdAt)}</span>
                <div style={styles.headerActions}>
                  <label style={{ display: 'flex', alignItems: 'center', color: '#fff', fontSize: '0.875rem', marginRight: '0.5rem' }}>
                    Active
                    <input
                      type="checkbox"
                      checked={routine.isActive}
                      onChange={() => handleToggleActive(routine)}
                      style={{ marginLeft: '0.5rem' }}
                    />
                  </label>
                  <button
                    style={{ ...styles.actionButton, ...styles.editButton }}
                    onClick={() => handleEditClick(routine)}
                  >
                    Edit
                  </button>
                  <button
                    style={{ ...styles.actionButton, ...styles.deleteButton }}
                    onClick={() => handleDeleteClick(routine)}
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div style={styles.cardContent}>
                {routine.days && Object.entries(routine.days)
                  .sort(([a], [b]) => parseInt(a.replace(/\D/g, '')) - parseInt(b.replace(/\D/g, '')))
                  .map(([dayId, day]: [string, any]) => (
                    <div key={dayId} style={{ marginBottom: '1.5rem' }}>
                      <h4>Day {dayId.replace(/\D/g, '')}</h4>
                      {day.workoutTime && (
                        <p>
                          <span style={styles.label}>Workout time:</span>
                          <span style={styles.value}>{String(day.workoutTime)}</span>
                        </p>
                      )}

                      {day.exercises && Object.entries(day.exercises).map(([exId, exercise]: [string, any]) => (
                        <div key={exId} style={styles.exerciseItem}>
                          <h5>{exercise.name || `Exercise ${exId}`}</h5>

                          {exercise.sets && (
                            <div style={styles.trainerData}>
                              <span style={styles.trainerLabel}>Sets:</span>
                              <span style={styles.trainerValue}>{exercise.sets}</span>
                            </div>
                          )}

                          <div style={styles.exerciseDetails}>
                            {exercise.expectedWeight && (
                              <div style={styles.trainerData}>
                                <span style={styles.trainerLabel}>Expected Weight:</span>
                                <span style={styles.trainerValue}>{exercise.expectedWeight} kg</span>
                              </div>
                            )}

                            {exercise.expectedReps && (
                              <div style={styles.trainerData}>
                                <span style={styles.trainerLabel}>Expected Reps:</span>
                                <span style={styles.trainerValue}>{exercise.expectedReps}</span>
                              </div>
                            )}

                            {exercise.expectedRIR && (
                              <div style={styles.trainerData}>
                                <span style={styles.trainerLabel}>Expected RIR:</span>
                                <span style={styles.trainerValue}>{exercise.expectedRIR}</span>
                              </div>
                            )}

                            {exercise.completedWeight && (
                              <div style={styles.clientData}>
                                <span style={styles.clientLabel}>Completed Weight:</span>
                                <span style={styles.clientValue}>{exercise.completedWeight} kg</span>
                              </div>
                            )}

                            {exercise.completedReps && (
                              <div style={styles.clientData}>
                                <span style={styles.clientLabel}>Completed Reps:</span>
                                <span style={styles.clientValue}>{exercise.completedReps}</span>
                              </div>
                            )}

                            {exercise.completedRIR && (
                              <div style={styles.clientData}>
                                <span style={styles.clientLabel}>Completed RIR:</span>
                                <span style={styles.clientValue}>{exercise.completedRIR}</span>
                              </div>
                            )}
                          </div>

                          {exercise.completed !== undefined && (
                            <div style={{ marginTop: '0.5rem' }}>
                              <span style={styles.label}>Completed: </span>
                              <span style={exercise.completed ? styles.completedTrue : styles.completedFalse}>
                                {exercise.completed ? 'Yes' : 'No'}
                              </span>
                            </div>
                          )}

                          {exercise.notes && (
                            <div style={styles.notesBox}>
                              <span>{exercise.notes}</span>
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
        onSave={async (routineId, dayId, exerciseId, updates) => {
          try {
            if (routineId && dayId && exerciseId) {
              await updateExercise(routineId, dayId, exerciseId, updates);
            } else if (routineId) {
              await updateRoutine(routineId, updates);
            }
            await fetchRoutines(client.trainerId, client.id);
            setShowUpdateModal(false);
          } catch (err) {
            setLocalError('Error updating routine');
          }
        }}
        itemType="routine"
        initialData={editingItem}
      />

      <CreateDataModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        itemType="routine"
        clientId={client.id}
        trainerId={client.trainerId}
      />

      <AlertModal
        isOpen={alertModalOpen}
        message="You cannot activate this routine because another one is already active."
        onClose={() => setAlertModalOpen(false)}
      />
    </div>
  );
}
