import { createContext, useContext, ReactNode, useState } from 'react';
import {
  doc, setDoc, updateDoc, deleteDoc,
  collection, query, where, getDocs,
  deleteField,
  Timestamp
} from 'firebase/firestore';
import { db, auth } from '../firebase';

// ==================== INTERFACES ====================

export interface OpcionComida {
  descripcion: string;
  proteina: number;
  hidratos: number;
  grasas: number;
  otros?: string;
}

export interface Comida {
  calorias: number;
  opciones: {
    [opcionId: string]: OpcionComida;
  };
}

export interface Dieta {
  id?: string;
  activo: boolean;
  cliente_ID: string;
  entrenador_ID: string;
  caloriasTotales: number;
  fechaCreacion: Timestamp;
  comidas: {
    [comidaId: string]: Comida;
  };
}

// ==================== CONTEXTO ====================
interface DietasContextType {
  dietas: Record<string, Dieta>;
  fetchDietas: (clienteId: string, entrenadorId: string) => Promise<void>;
  crearDieta: (dietaData: Omit<Dieta, 'fechaCreacion'>) => Promise<string>;
  actualizarDieta: (dietaId: string, updates: Partial<Dieta>) => Promise<void>;
  actualizarComida: (
    dietaId: string,
    comidaId: string,
    updates: Partial<Comida>
  ) => Promise<void>;
  actualizarOpcionComida: (
    dietaId: string,
    comidaId: string,
    opcionId: string,
    updates: Partial<OpcionComida>
  ) => Promise<void>;
  eliminarDieta: (dietaId: string) => Promise<void>;
  eliminarComida: (dietaId: string, comidaId: string) => Promise<void>;
  eliminarOpcionComida: (dietaId: string, comidaId: string, opcionId: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const DietasContext = createContext<DietasContextType | undefined>(undefined);

export function DietasProvider({ children }: { children: ReactNode }) {
  const [dietas, setDietas] = useState<Record<string, Dieta>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDietas = async (clienteId: string, entrenadorId: string) => {
    setLoading(true);
    try {
      if (!auth.currentUser) {
        throw new Error('User not authenticated');
      }

      let q = query(
        collection(db, 'dietas'),
        where('entrenador_ID', '==', entrenadorId)
      );

      if (clienteId) {
        q = query(q, where('cliente_ID', '==', clienteId));
      }

      const snapshot = await getDocs(q);
      const dietasData: Record<string, Dieta> = {};

      snapshot.forEach(doc => {
        dietasData[doc.id] = {
          ...doc.data() as Dieta,
          id: doc.id  
        };
      });

      setDietas(dietasData);
    } catch (error) {
      console.error('Error fetching dietas:', error);
      setError('Error loading diets');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const crearDieta = async (dietaData: Omit<Dieta, 'fechaCreacion'>) => {
    setLoading(true);
    try {
      const docRef = doc(collection(db, 'dietas'));
      await setDoc(docRef, {
        ...dietaData,
        activo: false,
        fechaCreacion: Timestamp.now() 
      });
      return docRef.id;
    } catch (err) {
      setError('Error creating diet');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const actualizarDieta = async (dietaId: string, updates: Partial<Dieta>) => {
    setLoading(true);
    try {
      await updateDoc(doc(db, 'dietas', dietaId), updates);

      setDietas(prev => ({
        ...prev,
        [dietaId]: {
          ...prev[dietaId],
          ...updates
        }
      }));
    } catch (err) {
      setError('Error updating diet');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const actualizarComida = async (
    dietaId: string,
    comidaId: string,
    updates: Partial<Comida>
  ) => {
    setLoading(true);
    try {
      const fieldPath = `comidas.${comidaId}`;
      await updateDoc(doc(db, 'dietas', dietaId), {
        [fieldPath]: updates
      });

      setDietas(prev => ({
        ...prev,
        [dietaId]: {
          ...prev[dietaId],
          comidas: {
            ...prev[dietaId]?.comidas,
            [comidaId]: {
              ...prev[dietaId]?.comidas?.[comidaId],
              ...updates
            }
          }
        }
      }));
    } catch (err) {
      setError('Error updating meal');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const actualizarOpcionComida = async (
    dietaId: string,
    comidaId: string,
    opcionId: string,
    updates: Partial<OpcionComida>
  ) => {
    setLoading(true);
    try {
      const fieldPath = `comidas.${comidaId}.opciones.${opcionId}`;
      await updateDoc(doc(db, 'dietas', dietaId), {
        [fieldPath]: updates
      });

      setDietas(prev => ({
        ...prev,
        [dietaId]: {
          ...prev[dietaId],
          comidas: {
            ...prev[dietaId]?.comidas,
            [comidaId]: {
              ...prev[dietaId]?.comidas?.[comidaId],
              opciones: {
                ...prev[dietaId]?.comidas?.[comidaId]?.opciones,
                [opcionId]: {
                  ...prev[dietaId]?.comidas?.[comidaId]?.opciones?.[opcionId],
                  ...updates
                }
              }
            }
          }
        }
      }));
    } catch (err) {
      setError('Error updating meal option');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const eliminarDieta = async (dietaId: string): Promise<void> => {
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'dietas', dietaId));
      
      setDietas(prev => {
        const newDietas = {...prev};
        delete newDietas[dietaId];
        return newDietas;
      });
    } catch (err) {
      setError('Error deleting diet');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const eliminarComida = async (dietaId: string, comidaId: string): Promise<void> => {
    setLoading(true);
    try {
      await updateDoc(doc(db, 'dietas', dietaId), {
        [`comidas.${comidaId}`]: deleteField()
      });

      setDietas(prev => {
        const newDietas = { ...prev };
        if (!newDietas[dietaId]) return newDietas;        
        if (!newDietas[dietaId].comidas?.[comidaId]) return newDietas;    
        const nuevasComidas = { ...newDietas[dietaId].comidas };
        delete nuevasComidas[comidaId];
        return {
          ...newDietas,
          [dietaId]: {
            ...newDietas[dietaId],
            comidas: nuevasComidas
          }
        };
      });
    } catch (err) {
      setError('Error deleting meal');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const eliminarOpcionComida = async (
    dietaId: string,
    comidaId: string,
    opcionId: string
  ): Promise<void> => {
    setLoading(true);
    try {
      await updateDoc(doc(db, 'dietas', dietaId), {
        [`comidas.${comidaId}.opciones.${opcionId}`]: deleteField()
      });

      setDietas(prev => {
        const newDietas = { ...prev };
        if (!newDietas[dietaId]) return newDietas;
        if (!newDietas[dietaId].comidas?.[comidaId]) return newDietas;        
        if (!newDietas[dietaId].comidas[comidaId].opciones?.[opcionId]) return newDietas;
        const nuevasOpciones = { ...newDietas[dietaId].comidas[comidaId].opciones }; 
        delete nuevasOpciones[opcionId];
        return {
          ...newDietas,
          [dietaId]: {
            ...newDietas[dietaId],
            comidas: {
              ...newDietas[dietaId].comidas,
              [comidaId]: {
                ...newDietas[dietaId].comidas[comidaId],
                opciones: nuevasOpciones
              }
            }
          }
        };
      });
    } catch (err) {
      setError('Error deleting meal option');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <DietasContext.Provider value={{
      dietas,
      fetchDietas,
      crearDieta,
      actualizarDieta,
      actualizarComida,
      actualizarOpcionComida,
      eliminarDieta,
      eliminarComida,
      eliminarOpcionComida,
      loading,
      error
    }}>
      {children}
    </DietasContext.Provider>
  );
}

export const useDietas = () => {
  const context = useContext(DietasContext);
  if (!context) throw new Error('useDietas must be used within a DietasProvider');
  return context;
};