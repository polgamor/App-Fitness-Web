import { useEffect, useState, CSSProperties } from 'react';
import { useDiets } from '../../context/DietsContext';
import type { Client } from '../../context/AuthContext';
import { Timestamp } from 'firebase/firestore';
import DeleteDataModal from '../Modals/DeleteDataModal';
import UpdateDataModal from '../Modals/UpdateDataModal';
import CreateDataModal from '../Modals/CreateDataModal';
import AlertModal from '../Modals/AlertModal';

interface DietsContentProps {
  client: Client;
}

export default function DietsContent({ client }: DietsContentProps) {
  const {
    diets,
    fetchDiets,
    loading,
    error,
    deleteDiet,
    updateMealOption,
    updateMeal,
    updateDiet
  } = useDiets();

  const [localError, setLocalError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [alertModalOpen, setAlertModalOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLocalError(null);
        await fetchDiets(client.id, client.trainerId);
      } catch (err) {
        console.error('Error loading diets:', err);
        setLocalError('Error loading diets');
      }
    };

    loadData();
  }, [client.id, client.trainerId]);

  const retry = async () => {
    setLocalError(null);
    await fetchDiets(client.id, client.trainerId);
  };

  const clientDiets = Object.entries(diets || {})
    .filter(([, diet]) => diet.clientId === client.id)
    .map(([id, diet]) => ({ id, ...diet }));

  const handleEditClick = (item: any) => {
    setEditingItem({ id: item.id, ...item });
    setShowUpdateModal(true);
  };

  const handleDeleteClick = (item: any) => {
    setCurrentItem({ id: item.id, ...item });
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!currentItem) return;
    try {
      await deleteDiet(currentItem.id);
      await fetchDiets(client.id, client.trainerId);
      setShowDeleteModal(false);
    } catch (err) {
      setLocalError('Error deleting diet');
    }
  };

  const handleToggleActive = async (diet: any) => {
    if (!diet.isActive) {
      const alreadyActive = clientDiets.find(d => d.isActive && d.id !== diet.id);
      if (alreadyActive) {
        setAlertModalOpen(true);
        return;
      }
    }

    try {
      await updateDiet(diet.id, { isActive: !diet.isActive });
      await fetchDiets(client.id, client.trainerId);
    } catch (err) {
      setLocalError('Error updating diet');
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
      color: '#0B160C'
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
    mealItem: { marginBottom: '1.5rem' },
    trainerData: {
      backgroundColor: '#f0f7f4',
      padding: '0.5rem',
      borderRadius: '0.25rem',
      margin: '0.25rem 0',
      borderLeft: '3px solid #3a5a40'
    },
    trainerLabel: { fontWeight: 600, color: '#3a5a40', marginRight: '0.5rem' },
    trainerValue: { color: '#588157' },
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

  if (loading) return <p style={styles.loadingText}>Loading diets...</p>;
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
          <h3 style={styles.sectionTitle}>{client.firstName}'s Diets</h3>
          <button style={styles.addButton} onClick={() => setShowCreateModal(true)}>
            +
          </button>
        </div>

        {clientDiets.length === 0 ? (
          <p style={styles.emptyState}>No diets assigned</p>
        ) : (
          clientDiets.map((diet: any, index: number) => (
            <div key={index} style={styles.card}>
              <div style={{
                ...styles.cardHeader,
                backgroundColor: diet.isActive ? '#588157' : '#999999'
              }}>
                <span>Diet created: {formatDate(diet.createdAt)} | Calories: {diet.totalCalories}</span>
                <div style={styles.headerActions}>
                  <label style={{ display: 'flex', alignItems: 'center', color: '#fff', fontSize: '0.875rem', marginRight: '0.5rem' }}>
                    Active
                    <input
                      type="checkbox"
                      checked={diet.isActive}
                      onChange={() => handleToggleActive(diet)}
                      style={{ marginLeft: '0.5rem' }}
                    />
                  </label>
                  <button
                    style={{ ...styles.actionButton, ...styles.editButton }}
                    onClick={() => handleEditClick(diet)}
                  >
                    Edit
                  </button>
                  <button
                    style={{ ...styles.actionButton, ...styles.deleteButton }}
                    onClick={() => handleDeleteClick(diet)}
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div style={styles.cardContent}>
                {diet.meals && Object.entries(diet.meals).map(([mealId, meal]: [string, any]) => (
                  <div key={mealId} style={styles.mealItem}>
                    <h4 style={{ textTransform: 'capitalize' }}>
                      {mealId.replace(/\D/g, '') ? `Meal ${mealId.replace(/\D/g, '')}` : mealId} — {meal.calories} kcal
                    </h4>
                    {meal.options && Object.entries(meal.options).map(([optId, option]: [string, any]) => (
                      <div key={optId} style={styles.trainerData}>
                        <p style={{ fontWeight: 500 }}>Option {optId.replace(/\D/g, '')}</p>
                        <p style={styles.trainerValue}>{option.description}</p>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                          <div>
                            <span style={styles.trainerLabel}>Protein:</span>
                            <span style={styles.trainerValue}>{option.protein}g</span>
                          </div>
                          <div>
                            <span style={styles.trainerLabel}>Carbs:</span>
                            <span style={styles.trainerValue}>{option.carbs}g</span>
                          </div>
                          <div>
                            <span style={styles.trainerLabel}>Fats:</span>
                            <span style={styles.trainerValue}>{option.fats}g</span>
                          </div>
                        </div>
                        {option.other && (
                          <p>
                            <span style={styles.trainerLabel}>Other:</span>
                            <span style={styles.trainerValue}>{option.other}</span>
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
        onSave={async (dietId, mealId, optionId, updates) => {
          try {
            if (dietId && mealId && optionId) {
              await updateMealOption(dietId, mealId, optionId, updates);
            } else if (dietId && mealId) {
              await updateMeal(dietId, mealId, updates);
            } else if (dietId) {
              await updateDiet(dietId, updates);
            }
            await fetchDiets(client.id, client.trainerId);
            setShowUpdateModal(false);
          } catch (err) {
            setLocalError('Error updating diet');
          }
        }}
        itemType="diet"
        initialData={editingItem}
      />

      <CreateDataModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        itemType="diet"
        clientId={client.id}
        trainerId={client.trainerId}
      />

      <AlertModal
        isOpen={alertModalOpen}
        message="You cannot activate this diet because another one is already active."
        onClose={() => setAlertModalOpen(false)}
      />
    </div>
  );
}
