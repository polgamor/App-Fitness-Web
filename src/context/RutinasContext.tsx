import { createContext, useContext, ReactNode, useState } from 'react';
import {
  doc, getDoc, setDoc, updateDoc, deleteDoc,
  collection, query, where, getDocs,
  Timestamp, deleteField
} from 'firebase/firestore';
import { db, auth } from '../firebase';

// ==================== INTERFACES ====================
export interface DatosEjercicio {
  nombre: string;
  pesoE: number;
  repsE: number;
  RIRE: number;
  series?: string;
  completado: boolean;
  observaciones: string;
  pesoC: null;
  repsC: null;
  RIRC: null;
}

export interface DiaRutina {
  ej?: {
    [ejercicioId: string]: DatosEjercicio;
  };
}

export interface Rutina {
  id?: string;
  activo: boolean;
  cliente_ID: string;
  entrenador_ID: string;
  fechaCreacion: Timestamp;
  dias?: {
    [diaId: string]: DiaRutina;
  };
}

// ==================== CONTEXTO ====================
interface RutinasContextType {
  rutinas: Record<string, Rutina>;
  fetchRutinas: (entrenadorId: string, cliente_ID: string) => Promise<void>;
  crearRutina: (rutinaData: Omit<Rutina, 'fechaCreacion'>) => Promise<string>;
  actualizarRutina: (rutinaId: string, updates: Partial<Rutina>) => Promise<void>;
  actualizarEjercicio: (
    rutinaId: string,
    diaId: string,
    ejercicioId: string,
    updates: Partial<DatosEjercicio>
  ) => Promise<void>;
  registrarHoraEntrenamiento: (
    rutinaId: string,
    diaId: string,
    hora: Date | Timestamp | string | null
  ) => Promise<void>;
  agregarEjercicio: (
    rutinaId: string,
    diaId: string,
    ejercicioData: Omit<DatosEjercicio, 'completado' | 'observaciones'>
  ) => Promise<void>;
  agregarDia: (rutinaId: string, diaId: string) => Promise<void>;
  eliminarRutina: (rutinaId: string) => Promise<void>;
  eliminarDiaRutina: (rutinaId: string, diaId: string) => Promise<void>;
  eliminarEjercicio: (
    rutinaId: string,
    diaId: string,
    ejercicioId: string
  ) => Promise<void>;
  limpiarHoraEntrenamiento?: (rutinaId: string, diaId: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const RutinasContext = createContext<RutinasContextType | undefined>(undefined);

export function RutinasProvider({ children }: { children: ReactNode }) {
  const [rutinas, setRutinas] = useState<Record<string, Rutina>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRutinas = async (entrenadorId: string, clienteId: string) => {
    try {
      if (!auth.currentUser) {
        throw new Error('Usuario no autenticado');
      }

      let q = query(
        collection(db, 'rutinas'),
        where('entrenador_ID', '==', entrenadorId)
      );

      if (clienteId) {
        q = query(q, where('cliente_ID', '==', clienteId));
      }

      const querySnapshot = await getDocs(q);
      const rutinasData: Record<string, Rutina> = {};

      querySnapshot.forEach((doc) => {
        rutinasData[doc.id] = doc.data() as Rutina;
      });

      setRutinas(rutinasData);
    } catch (error) {
      console.error('Error fetching rutinas:', error);
      throw error;
    }
  };

  const crearRutina = async (rutinaData: Omit<Rutina, 'fechaCreacion'>) => {
    setLoading(true);
    try {
      const docRef = doc(collection(db, 'rutinas'));
      await setDoc(docRef, {
        ...rutinaData,
        activo: false,
        fechaCreacion: Timestamp.now()
      });
      return docRef.id;
    } catch (err) {
      setError('Error al crear rutina');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const crearEjercicioConValoresPorDefecto = (ejercicioData: Omit<DatosEjercicio, "RIRC" | "pesoC" | "repsC" | 'observaciones' | 'completado'>): DatosEjercicio => {
    return {
      ...ejercicioData,
      completado: false,
      observaciones: '',
      pesoC: null,
      repsC: null,
      RIRC: null,
    };
  };

  const crearDiaConValoresPorDefecto = (): DiaRutina => {
    return {
      ej: {}
    };
  };

  const agregarEjercicio = async (
    rutinaId: string,
    diaId: string,
    ejercicioData: Omit<DatosEjercicio, "RIRC" | "pesoC" | "repsC" | 'observaciones' | 'completado'>
  ) => {
    setLoading(true);
    try {
      const ejercicioCompleto = crearEjercicioConValoresPorDefecto(ejercicioData);
      const fieldPath = `dias.${diaId}.ej.${ejercicioData.nombre}`;
      
      await updateDoc(doc(db, 'rutinas', rutinaId), {
        [fieldPath]: ejercicioCompleto
      });

      setRutinas(prev => {
        const rutina = prev[rutinaId] || { dias: {} };
        const dias = rutina.dias || {};
        const dia = dias[diaId] || crearDiaConValoresPorDefecto();
        const ejercicios = dia.ej || {};

        return {
          ...prev,
          [rutinaId]: {
            ...rutina,
            dias: {
              ...dias,
              [diaId]: {
                ...dia,
                ej: {
                  ...ejercicios,
                  [ejercicioData.nombre]: ejercicioCompleto
                }
              }
            }
          }
        };
      });
    } catch (err) {
      setError('Error al agregar ejercicio');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const agregarDia = async (rutinaId: string, diaId: string) => {
    setLoading(true);
    try {
      const nuevoDia = crearDiaConValoresPorDefecto();
      await updateDoc(doc(db, 'rutinas', rutinaId), {
        [`dias.${diaId}`]: nuevoDia
      });

      setRutinas(prev => {
        const rutina = prev[rutinaId] || { dias: {} };
        return {
          ...prev,
          [rutinaId]: {
            ...rutina,
            dias: {
              ...rutina.dias,
              [diaId]: nuevoDia
            }
          }
        };
      });
    } catch (err) {
      setError('Error al agregar día');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const actualizarRutina = async (rutinaId: string, updates: Partial<Rutina>) => {
    try {
        await updateDoc(doc(db, 'rutinas', rutinaId), updates);

        setRutinas(prev => {
            const updatedRutinas = { ...prev }; 
            if (updatedRutinas[rutinaId]) {
                updatedRutinas[rutinaId] = { 
                    ...updatedRutinas[rutinaId], 
                    ...updates 
                };
            }
            return updatedRutinas;
        });
    } catch (error) {
        setError('Error al actualizar rutina');
        console.error(error);
        throw error;
    }
  };

  const actualizarEjercicio = async (
    rutinaId: string,
    diaId: string,
    ejercicioId: string,
    updates: Partial<DatosEjercicio>
  ) => {
    setLoading(true);
    try {
      const fieldPath = `dias.${diaId}.ej.${ejercicioId}`;
      await updateDoc(doc(db, 'rutinas', rutinaId), {
        [fieldPath]: updates
      });

      setRutinas(prev => {
        const rutina = prev[rutinaId] || {};
        const dias = rutina.dias || {};
        const dia = dias[diaId] || {};
        const ejercicios = dia.ej || {};
        const ejercicio = ejercicios[ejercicioId] || {};

        return {
          ...prev,
          [rutinaId]: {
            ...rutina,
            dias: {
              ...dias,
              [diaId]: {
                ...dia,
                ejercicios: {
                  ...ejercicios,
                  [ejercicioId]: {
                    ...ejercicio,
                    ...updates
                  }
                }
              }
            }
          }
        };
      });
    } catch (err) {
      setError('Error al actualizar ejercicio');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const registrarHoraEntrenamiento = async (
    rutinaId: string,
    diaId: string,
    hora: Date | Timestamp | string | null 
  ) => {
    setLoading(true);
    try {
      let horaEntrenamiento: Date | Timestamp | null = null;
      
      if (hora === null) {
        horaEntrenamiento = null;
      } else if (typeof hora === 'string') {
        horaEntrenamiento = new Date(hora);
      } else {
        horaEntrenamiento = hora;
      }

      await updateDoc(doc(db, 'rutinas', rutinaId), {
        [`dias.${diaId}.horaEntrenamiento`]: horaEntrenamiento
      });

      setRutinas(prev => {
        const rutina = prev[rutinaId] || { dias: {} };
        const dias = rutina.dias || {};
        const dia = dias[diaId] || crearDiaConValoresPorDefecto();

        return {
          ...prev,
          [rutinaId]: {
            ...rutina,
            dias: {
              ...dias,
              [diaId]: {
                ...dia,
                horaEntrenamiento: horaEntrenamiento
              }
            }
          }
        };
      });
    } catch (err) {
      setError('Error al registrar hora de entrenamiento');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const limpiarHoraEntrenamiento = async (rutinaId: string, diaId: string) => {
    await registrarHoraEntrenamiento(rutinaId, diaId, null);
  };

  const eliminarRutina = async (rutinaId: string): Promise<void> => {
    setLoading(true);
    try {
      const rutinaRef = doc(db, 'rutinas', rutinaId);
      const docSnap = await getDoc(rutinaRef);
      if (!docSnap.exists()) {
        throw new Error('La rutina no existe o ya fue eliminada');
      }
      
      await deleteDoc(rutinaRef);
      setRutinas(prev => {
        const newRutinas = {...prev};
        delete newRutinas[rutinaId];
        return newRutinas;
      });
    } catch (err) {
      console.error('Error en eliminarRutina:', err);
      setError(err instanceof Error ? err.message : 'Error al eliminar la rutina');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const eliminarDiaRutina = async (rutinaId: string, diaId: string): Promise<void> => {
    setLoading(true);
    try {
      await updateDoc(doc(db, 'rutinas', rutinaId), {
        [`dias.${diaId}`]: deleteField()
      });

      setRutinas(prev => {
        const newRutinas = { ...prev };
        if (newRutinas[rutinaId]?.dias?.[diaId]) {
          delete newRutinas[rutinaId].dias[diaId];
        }
        return newRutinas;
      });
    } catch (err) {
      setError('Error al eliminar día de rutina');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const eliminarEjercicio = async (rutinaId: string, diaId: string, ejercicioId: string): Promise<void> => {
    setLoading(true);
    try {
      await updateDoc(doc(db, 'rutinas', rutinaId), {
        [`dias.${diaId}.ej.${ejercicioId}`]: deleteField()
      });

      setRutinas(prev => {
        const newRutinas = { ...prev };
        if (newRutinas[rutinaId]?.dias?.[diaId]?.ej?.[ejercicioId]) {
          delete newRutinas[rutinaId].dias[diaId].ej[ejercicioId];
        }
        return newRutinas;
      });
    } catch (err) {
      setError('Error al eliminar ejercicio');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <RutinasContext.Provider value={{
      rutinas,
      fetchRutinas,
      crearRutina,
      actualizarRutina,
      actualizarEjercicio,
      registrarHoraEntrenamiento,
      agregarEjercicio,
      agregarDia,
      eliminarRutina,
      eliminarDiaRutina,
      eliminarEjercicio,
      limpiarHoraEntrenamiento,
      loading,
      error
    }}>
      {children}
    </RutinasContext.Provider>
  );
}

export const useRutinas = () => {
  const context = useContext(RutinasContext);
  if (!context) throw new Error('useRutinas debe usarse dentro de RutinasProvider');
  return context;
};