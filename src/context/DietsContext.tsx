import { createContext, useContext, ReactNode, useState } from 'react';
import {
  doc, setDoc, updateDoc, deleteDoc,
  collection, query, where, getDocs,
  deleteField,
  Timestamp
} from 'firebase/firestore';
import { db, auth } from '../config/firebase.config';
import type { Diet, Meal, MealOption } from '../core/types/diet.types';

export type { Diet, Meal, MealOption };

interface DietsContextType {
  diets: Record<string, Diet>;
  fetchDiets: (clientId: string, trainerId: string) => Promise<void>;
  createDiet: (dietData: Omit<Diet, 'createdAt'>) => Promise<string>;
  updateDiet: (dietId: string, updates: Partial<Diet>) => Promise<void>;
  updateMeal: (dietId: string, mealId: string, updates: Partial<Meal>) => Promise<void>;
  updateMealOption: (
    dietId: string,
    mealId: string,
    optionId: string,
    updates: Partial<MealOption>
  ) => Promise<void>;
  deleteDiet: (dietId: string) => Promise<void>;
  deleteMeal: (dietId: string, mealId: string) => Promise<void>;
  deleteMealOption: (dietId: string, mealId: string, optionId: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const DietsContext = createContext<DietsContextType | undefined>(undefined);

export function DietsProvider({ children }: { children: ReactNode }) {
  const [diets, setDiets] = useState<Record<string, Diet>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mapDietFromFirestore = (id: string, data: Record<string, any>): Diet => ({
    id,
    isActive: data.activo,
    clientId: data.cliente_ID,
    trainerId: data.entrenador_ID,
    totalCalories: data.caloriasTotales,
    createdAt: data.fechaCreacion,
    meals: data.comidas ? mapMealsFromFirestore(data.comidas) : {}
  });

  const mapMealsFromFirestore = (comidas: Record<string, any>): Record<string, Meal> => {
    const result: Record<string, Meal> = {};
    for (const [mealId, meal] of Object.entries(comidas)) {
      result[mealId] = {
        calories: meal.calorias,
        options: meal.opciones ? mapOptionsFromFirestore(meal.opciones) : {}
      };
    }
    return result;
  };

  const mapOptionsFromFirestore = (opciones: Record<string, any>): Record<string, MealOption> => {
    const result: Record<string, MealOption> = {};
    for (const [optId, opt] of Object.entries(opciones)) {
      result[optId] = {
        description: opt.descripcion,
        protein: opt.proteina,
        carbs: opt.hidratos,
        fats: opt.grasas,
        other: opt.otros
      };
    }
    return result;
  };

  const fetchDiets = async (clientId: string, trainerId: string) => {
    setLoading(true);
    try {
      if (!auth.currentUser) throw new Error('No authenticated user');

      let q = query(
        collection(db, 'dietas'),
        where('entrenador_ID', '==', trainerId)
      );

      if (clientId) {
        q = query(q, where('cliente_ID', '==', clientId));
      }

      const snapshot = await getDocs(q);
      const dietsData: Record<string, Diet> = {};

      snapshot.forEach(docSnap => {
        dietsData[docSnap.id] = mapDietFromFirestore(docSnap.id, docSnap.data());
      });

      setDiets(dietsData);
    } catch (err) {
      console.error('Failed to fetch diets:', err);
      setError('Failed to load diets');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createDiet = async (dietData: Omit<Diet, 'createdAt'>) => {
    setLoading(true);
    try {
      const docRef = doc(collection(db, 'dietas'));
      await setDoc(docRef, {
        activo: dietData.isActive ?? false,
        cliente_ID: dietData.clientId,
        entrenador_ID: dietData.trainerId,
        caloriasTotales: dietData.totalCalories,
        fechaCreacion: Timestamp.now(),
        comidas: dietData.meals ? buildMealsForFirestore(dietData.meals) : {}
      });
      return docRef.id;
    } catch (err) {
      setError('Failed to create diet');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const buildMealsForFirestore = (meals: Record<string, Meal>) => {
    const result: Record<string, any> = {};
    for (const [mealId, meal] of Object.entries(meals)) {
      result[mealId] = {
        calorias: meal.calories,
        opciones: buildOptionsForFirestore(meal.options)
      };
    }
    return result;
  };

  const buildOptionsForFirestore = (options: Record<string, MealOption>) => {
    const result: Record<string, any> = {};
    for (const [optId, opt] of Object.entries(options)) {
      result[optId] = {
        descripcion: opt.description,
        proteina: opt.protein,
        hidratos: opt.carbs,
        grasas: opt.fats,
        otros: opt.other
      };
    }
    return result;
  };

  const updateDiet = async (dietId: string, updates: Partial<Diet>) => {
    setLoading(true);
    try {
      const firestoreUpdates: Record<string, any> = {};
      if (updates.isActive !== undefined) firestoreUpdates.activo = updates.isActive;
      if (updates.totalCalories !== undefined) firestoreUpdates.caloriasTotales = updates.totalCalories;

      await updateDoc(doc(db, 'dietas', dietId), firestoreUpdates);

      setDiets(prev => ({
        ...prev,
        [dietId]: { ...prev[dietId], ...updates }
      }));
    } catch (err) {
      setError('Failed to update diet');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateMeal = async (dietId: string, mealId: string, updates: Partial<Meal>) => {
    setLoading(true);
    try {
      const firestoreUpdates: Record<string, any> = {};
      if (updates.calories !== undefined) firestoreUpdates.calorias = updates.calories;
      if (updates.options !== undefined) firestoreUpdates.opciones = buildOptionsForFirestore(updates.options);

      await updateDoc(doc(db, 'dietas', dietId), {
        [`comidas.${mealId}`]: firestoreUpdates
      });

      setDiets(prev => ({
        ...prev,
        [dietId]: {
          ...prev[dietId],
          meals: {
            ...prev[dietId]?.meals,
            [mealId]: { ...prev[dietId]?.meals?.[mealId], ...updates }
          }
        }
      }));
    } catch (err) {
      setError('Failed to update meal');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateMealOption = async (
    dietId: string,
    mealId: string,
    optionId: string,
    updates: Partial<MealOption>
  ) => {
    setLoading(true);
    try {
      const firestoreUpdates: Record<string, any> = {};
      if (updates.description !== undefined) firestoreUpdates.descripcion = updates.description;
      if (updates.protein !== undefined) firestoreUpdates.proteina = updates.protein;
      if (updates.carbs !== undefined) firestoreUpdates.hidratos = updates.carbs;
      if (updates.fats !== undefined) firestoreUpdates.grasas = updates.fats;
      if (updates.other !== undefined) firestoreUpdates.otros = updates.other;

      await updateDoc(doc(db, 'dietas', dietId), {
        [`comidas.${mealId}.opciones.${optionId}`]: firestoreUpdates
      });

      setDiets(prev => ({
        ...prev,
        [dietId]: {
          ...prev[dietId],
          meals: {
            ...prev[dietId]?.meals,
            [mealId]: {
              ...prev[dietId]?.meals?.[mealId],
              options: {
                ...prev[dietId]?.meals?.[mealId]?.options,
                [optionId]: {
                  ...prev[dietId]?.meals?.[mealId]?.options?.[optionId],
                  ...updates
                }
              }
            }
          }
        }
      }));
    } catch (err) {
      setError('Failed to update meal option');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteDiet = async (dietId: string): Promise<void> => {
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'dietas', dietId));

      setDiets(prev => {
        const updated = { ...prev };
        delete updated[dietId];
        return updated;
      });
    } catch (err) {
      setError('Failed to delete diet');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteMeal = async (dietId: string, mealId: string): Promise<void> => {
    setLoading(true);
    try {
      await updateDoc(doc(db, 'dietas', dietId), {
        [`comidas.${mealId}`]: deleteField()
      });

      setDiets(prev => {
        const updated = { ...prev };
        if (!updated[dietId]) return updated;
        const updatedMeals = { ...updated[dietId].meals };
        delete updatedMeals[mealId];
        return {
          ...updated,
          [dietId]: { ...updated[dietId], meals: updatedMeals }
        };
      });
    } catch (err) {
      setError('Failed to delete meal');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteMealOption = async (
    dietId: string,
    mealId: string,
    optionId: string
  ): Promise<void> => {
    setLoading(true);
    try {
      await updateDoc(doc(db, 'dietas', dietId), {
        [`comidas.${mealId}.opciones.${optionId}`]: deleteField()
      });

      setDiets(prev => {
        const updated = { ...prev };
        if (!updated[dietId]?.meals?.[mealId]?.options?.[optionId]) return updated;
        const updatedOptions = { ...updated[dietId].meals[mealId].options };
        delete updatedOptions[optionId];
        return {
          ...updated,
          [dietId]: {
            ...updated[dietId],
            meals: {
              ...updated[dietId].meals,
              [mealId]: {
                ...updated[dietId].meals[mealId],
                options: updatedOptions
              }
            }
          }
        };
      });
    } catch (err) {
      setError('Failed to delete meal option');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <DietsContext.Provider value={{
      diets,
      fetchDiets,
      createDiet,
      updateDiet,
      updateMeal,
      updateMealOption,
      deleteDiet,
      deleteMeal,
      deleteMealOption,
      loading,
      error
    }}>
      {children}
    </DietsContext.Provider>
  );
}

export const useDiets = () => {
  const context = useContext(DietsContext);
  if (!context) throw new Error('useDiets must be used within a DietsProvider');
  return context;
};
