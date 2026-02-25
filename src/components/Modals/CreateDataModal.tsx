import { CSSProperties, useState } from 'react';
import { useRoutines } from '../../context/RoutinesContext';
import { useDiets } from '../../context/DietsContext';
import type { ExerciseData, RoutineDay } from '../../core/types/routine.types';
import type { Meal, MealOption } from '../../core/types/diet.types';

interface CreateDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemType: 'routine' | 'diet';
  clientId: string;
  trainerId: string;
}

interface ExerciseFormData {
  name: string;
  sets: string;
  expectedWeight: string;
  expectedReps: string;
  expectedRIR: string;
}

interface DayFormData {
  exercises: Record<string, ExerciseFormData>;
}

interface RoutineFormData {
  days: Record<string, DayFormData>;
}

interface MealOptionFormData {
  description: string;
  protein: string;
  carbs: string;
  fats: string;
}

interface MealFormData {
  calories: string;
  options: Record<string, MealOptionFormData>;
}

interface DietFormData {
  totalCalories: string;
  meals: Record<string, MealFormData>;
}

type FormData = RoutineFormData | DietFormData | Record<string, never>;

const MODAL_STYLES: { [key: string]: CSSProperties } = {
  overlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    background: 'rgba(0,0,0,0.4)'
  },
  content: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '0.5rem',
    width: '700px',
    maxWidth: '95vw',
    maxHeight: '80vh',
    overflowY: 'auto',
    position: 'relative'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid #e2e8f0'
  },
  title: { fontSize: '1.5rem', fontWeight: 600, color: '#2d3748', margin: 0 },
  closeButton: {
    background: 'none', border: 'none',
    fontSize: '1.5rem', cursor: 'pointer', color: '#4a5568'
  },
  formGroup: { marginBottom: '1.25rem' },
  formRow: { display: 'flex', gap: '1rem', marginBottom: '1rem' },
  label: {
    display: 'block', marginBottom: '0.5rem',
    fontWeight: 500, color: '#4a5568', fontSize: '0.875rem'
  },
  input: {
    width: '100%', padding: '0.625rem',
    borderRadius: '0.375rem', border: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc', fontSize: '1rem',
    outline: 'none', boxSizing: 'border-box'
  },
  section: {
    padding: '1rem', borderRadius: '0.375rem',
    marginBottom: '1.25rem', border: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc'
  },
  sectionTitle: { fontSize: '1rem', fontWeight: 600, color: '#2d3748', marginBottom: '0.75rem' },
  addButton: {
    backgroundColor: '#3182ce', color: 'white',
    padding: '0.5rem 1rem', borderRadius: '0.375rem',
    border: 'none', cursor: 'pointer',
    marginBottom: '1rem', fontSize: '0.875rem'
  },
  actions: {
    display: 'flex', justifyContent: 'flex-end',
    gap: '1rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0'
  },
  button: {
    padding: '0.75rem 1.5rem', borderRadius: '0.375rem',
    border: 'none', cursor: 'pointer',
    fontWeight: 500, fontSize: '1rem'
  },
  saveButton: { backgroundColor: '#38a169', color: 'white' },
  cancelButton: { backgroundColor: '#e53e3e', color: 'white' },
  errorBox: {
    backgroundColor: 'rgba(220,38,38,0.1)', color: '#dc2626',
    padding: '0.75rem', borderRadius: '0.375rem',
    marginBottom: '1rem', borderLeft: '3px solid #dc2626'
  }
};

export default function CreateDataModal({
  isOpen,
  onClose,
  itemType,
  clientId,
  trainerId
}: CreateDataModalProps) {
  const { createRoutine, loading: loadingRoutines } = useRoutines();
  const { createDiet, loading: loadingDiets } = useDiets();

  const [formData, setFormData] = useState<FormData>({});
  const [error, setError] = useState<string | null>(null);

  const loading = loadingRoutines || loadingDiets;

  const resetAndClose = () => {
    setFormData({});
    setError(null);
    onClose();
  };

  // ── Routine helpers ──────────────────────────────────────────────────────
  const handleAddDay = () => {
    const days = (formData as RoutineFormData).days ?? {};
    const newDayId = `day${Object.keys(days).length + 1}`;
    setFormData(prev => ({
      ...prev,
      days: { ...days, [newDayId]: { exercises: {} } }
    }));
  };

  const handleAddExercise = (dayId: string) => {
    const days = (formData as RoutineFormData).days ?? {};
    const exercises = days[dayId]?.exercises ?? {};
    const newExId = `ex${Object.keys(exercises).length + 1}`;
    setFormData(prev => ({
      ...prev,
      days: {
        ...days,
        [dayId]: {
          ...days[dayId],
          exercises: {
            ...exercises,
            [newExId]: { name: '', sets: '', expectedWeight: '', expectedReps: '', expectedRIR: '' }
          }
        }
      }
    }));
  };

  const updateExerciseField = (dayId: string, exId: string, field: keyof ExerciseFormData, value: string) => {
    const days = (formData as RoutineFormData).days ?? {};
    setFormData(prev => ({
      ...prev,
      days: {
        ...days,
        [dayId]: {
          ...days[dayId],
          exercises: {
            ...days[dayId].exercises,
            [exId]: { ...days[dayId].exercises[exId], [field]: value }
          }
        }
      }
    }));
  };

  // ── Diet helpers ─────────────────────────────────────────────────────────
  const handleAddMeal = () => {
    const meals = (formData as DietFormData).meals ?? {};
    const newMealId = `meal${Object.keys(meals).length + 1}`;
    setFormData(prev => ({
      ...prev,
      meals: { ...meals, [newMealId]: { calories: '', options: {} } }
    }));
  };

  const handleAddOption = (mealId: string) => {
    const meals = (formData as DietFormData).meals ?? {};
    const options = meals[mealId]?.options ?? {};
    const newOptId = `option${Object.keys(options).length + 1}`;
    setFormData(prev => ({
      ...prev,
      meals: {
        ...meals,
        [mealId]: {
          ...meals[mealId],
          options: {
            ...options,
            [newOptId]: { description: '', protein: '', carbs: '', fats: '' }
          }
        }
      }
    }));
  };

  const updateMealField = (mealId: string, field: 'calories', value: string) => {
    const meals = (formData as DietFormData).meals ?? {};
    setFormData(prev => ({
      ...prev,
      meals: { ...meals, [mealId]: { ...meals[mealId], [field]: value } }
    }));
  };

  const updateOptionField = (mealId: string, optId: string, field: keyof MealOptionFormData, value: string) => {
    const meals = (formData as DietFormData).meals ?? {};
    setFormData(prev => ({
      ...prev,
      meals: {
        ...meals,
        [mealId]: {
          ...meals[mealId],
          options: {
            ...meals[mealId].options,
            [optId]: { ...meals[mealId].options[optId], [field]: value }
          }
        }
      }
    }));
  };

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (itemType === 'routine') {
        const data = formData as RoutineFormData;
        const days = data.days ?? {};

        if (Object.keys(days).length === 0) {
          throw new Error('You must add at least one day to the routine');
        }

        for (const [dayId, day] of Object.entries(days)) {
          if (!day.exercises || Object.keys(day.exercises).length === 0) {
            throw new Error(`${dayId} has no exercises`);
          }
        }

        const mappedDays: Record<string, RoutineDay> = {};
        for (const [dayId, day] of Object.entries(days)) {
          const exercises: Record<string, ExerciseData> = {};
          for (const [exId, ex] of Object.entries(day.exercises)) {
            if (!ex.name.trim()) throw new Error('All exercises must have a name');
            exercises[exId] = {
              name: ex.name.trim(),
              sets: ex.sets,
              expectedWeight: Number(ex.expectedWeight) || 0,
              expectedReps: Number(ex.expectedReps) || 0,
              expectedRIR: Number(ex.expectedRIR) || 0,
              completed: false,
              notes: '',
              completedWeight: null,
              completedReps: null,
              completedRIR: null
            };
          }
          mappedDays[dayId] = { exercises };
        }

        await createRoutine({
          isActive: false,
          clientId,
          trainerId,
          days: mappedDays
        });

      } else {
        const data = formData as DietFormData;

        if (!data.totalCalories) {
          throw new Error('Total calories are required');
        }

        const totalCalories = Number(data.totalCalories);
        if (isNaN(totalCalories)) throw new Error('Total calories must be a valid number');

        const meals: Record<string, Meal> = {};
        for (const [mealId, meal] of Object.entries(data.meals ?? {})) {
          const options: Record<string, MealOption> = {};
          for (const [optId, opt] of Object.entries(meal.options ?? {})) {
            options[optId] = {
              description: opt.description,
              protein: Number(opt.protein) || 0,
              carbs: Number(opt.carbs) || 0,
              fats: Number(opt.fats) || 0
            };
          }
          meals[mealId] = { calories: Number(meal.calories) || 0, options };
        }

        await createDiet({
          isActive: false,
          clientId,
          trainerId,
          totalCalories,
          meals
        });
      }

      resetAndClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create. Please try again.');
    }
  };

  if (!isOpen) return null;

  const routineData = formData as RoutineFormData;
  const dietData = formData as DietFormData;

  return (
    <div style={MODAL_STYLES.overlay}>
      <div style={MODAL_STYLES.content}>
        <div style={MODAL_STYLES.header}>
          <h3 style={MODAL_STYLES.title}>
            New {itemType === 'routine' ? 'Routine' : 'Diet'}
          </h3>
          <button style={MODAL_STYLES.closeButton} onClick={resetAndClose} aria-label="Close">×</button>
        </div>

        {error && <div style={MODAL_STYLES.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {itemType === 'routine' ? (
            <div>
              <button type="button" style={MODAL_STYLES.addButton} onClick={handleAddDay}>
                + Add day
              </button>

              {Object.entries(routineData.days ?? {}).map(([dayId, day]) => (
                <div key={dayId} style={MODAL_STYLES.section}>
                  <p style={MODAL_STYLES.sectionTitle}>{dayId.replace(/day/, 'Day ')}</p>
                  <button type="button" style={MODAL_STYLES.addButton} onClick={() => handleAddExercise(dayId)}>
                    + Add exercise
                  </button>

                  {Object.entries(day.exercises ?? {}).map(([exId, ex]) => (
                    <div key={exId} style={{ marginBottom: '1.25rem' }}>
                      <div style={MODAL_STYLES.formGroup}>
                        <label style={MODAL_STYLES.label}>Exercise name</label>
                        <input
                          type="text"
                          style={MODAL_STYLES.input}
                          value={ex.name}
                          onChange={e => updateExerciseField(dayId, exId, 'name', e.target.value)}
                          required
                        />
                      </div>
                      <div style={MODAL_STYLES.formGroup}>
                        <label style={MODAL_STYLES.label}>Sets (e.g. "4x10")</label>
                        <input
                          type="text"
                          style={MODAL_STYLES.input}
                          value={ex.sets}
                          onChange={e => updateExerciseField(dayId, exId, 'sets', e.target.value)}
                        />
                      </div>
                      <div style={MODAL_STYLES.formRow}>
                        <div style={MODAL_STYLES.formGroup}>
                          <label style={MODAL_STYLES.label}>Weight (kg)</label>
                          <input
                            type="number"
                            style={MODAL_STYLES.input}
                            value={ex.expectedWeight}
                            onChange={e => updateExerciseField(dayId, exId, 'expectedWeight', e.target.value)}
                          />
                        </div>
                        <div style={MODAL_STYLES.formGroup}>
                          <label style={MODAL_STYLES.label}>Reps</label>
                          <input
                            type="number"
                            style={MODAL_STYLES.input}
                            value={ex.expectedReps}
                            onChange={e => updateExerciseField(dayId, exId, 'expectedReps', e.target.value)}
                          />
                        </div>
                        <div style={MODAL_STYLES.formGroup}>
                          <label style={MODAL_STYLES.label}>RIR</label>
                          <input
                            type="number"
                            style={MODAL_STYLES.input}
                            value={ex.expectedRIR}
                            onChange={e => updateExerciseField(dayId, exId, 'expectedRIR', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <div>
              <div style={MODAL_STYLES.formGroup}>
                <label style={MODAL_STYLES.label}>Total Calories</label>
                <input
                  type="number"
                  style={MODAL_STYLES.input}
                  value={dietData.totalCalories ?? ''}
                  onChange={e => setFormData(prev => ({ ...prev, totalCalories: e.target.value }))}
                  required
                />
              </div>

              <button type="button" style={MODAL_STYLES.addButton} onClick={handleAddMeal}>
                + Add meal
              </button>

              {Object.entries(dietData.meals ?? {}).map(([mealId, meal]) => (
                <div key={mealId} style={MODAL_STYLES.section}>
                  <p style={MODAL_STYLES.sectionTitle}>{mealId.replace(/meal/, 'Meal ')}</p>
                  <div style={MODAL_STYLES.formGroup}>
                    <label style={MODAL_STYLES.label}>Calories</label>
                    <input
                      type="number"
                      style={MODAL_STYLES.input}
                      value={meal.calories}
                      onChange={e => updateMealField(mealId, 'calories', e.target.value)}
                    />
                  </div>

                  <button type="button" style={MODAL_STYLES.addButton} onClick={() => handleAddOption(mealId)}>
                    + Add option
                  </button>

                  {Object.entries(meal.options ?? {}).map(([optId, opt]) => (
                    <div key={optId} style={{ marginBottom: '1.25rem' }}>
                      <div style={MODAL_STYLES.formGroup}>
                        <label style={MODAL_STYLES.label}>Description</label>
                        <input
                          type="text"
                          style={MODAL_STYLES.input}
                          value={opt.description}
                          onChange={e => updateOptionField(mealId, optId, 'description', e.target.value)}
                        />
                      </div>
                      <div style={MODAL_STYLES.formRow}>
                        <div style={MODAL_STYLES.formGroup}>
                          <label style={MODAL_STYLES.label}>Protein (g)</label>
                          <input
                            type="number"
                            style={MODAL_STYLES.input}
                            value={opt.protein}
                            onChange={e => updateOptionField(mealId, optId, 'protein', e.target.value)}
                          />
                        </div>
                        <div style={MODAL_STYLES.formGroup}>
                          <label style={MODAL_STYLES.label}>Carbs (g)</label>
                          <input
                            type="number"
                            style={MODAL_STYLES.input}
                            value={opt.carbs}
                            onChange={e => updateOptionField(mealId, optId, 'carbs', e.target.value)}
                          />
                        </div>
                        <div style={MODAL_STYLES.formGroup}>
                          <label style={MODAL_STYLES.label}>Fat (g)</label>
                          <input
                            type="number"
                            style={MODAL_STYLES.input}
                            value={opt.fats}
                            onChange={e => updateOptionField(mealId, optId, 'fats', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          <div style={MODAL_STYLES.actions}>
            <button
              type="button"
              style={{ ...MODAL_STYLES.button, ...MODAL_STYLES.cancelButton }}
              onClick={resetAndClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{ ...MODAL_STYLES.button, ...MODAL_STYLES.saveButton }}
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
