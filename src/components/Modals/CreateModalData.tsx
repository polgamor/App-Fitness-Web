import { CSSProperties, useState } from 'react';
import { DatosEjercicio, DiaRutina, useRutinas, Rutina } from '../../context/RutinasContext';
import { useDietas } from '../../context/DietasContext';
import { Timestamp } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';

// -------------------------------------------------- INTERFACES -------------------------------------------------------

interface CreateModalDataProps {
  isOpen: boolean;
  onClose: () => void;
  itemType: 'rutina' | 'dieta' | 'suplemento';
  clientId: string;
  trainerId: string;
}

interface EjercicioFormData {
  nombre: string;
  series: string;
  pesoE: string;
  repsE: string;
  RIRE: string;
  observaciones: string;
}

interface RutinaFormData {
  dias: Record<string, {
    ej: Record<string, EjercicioFormData>
  }>;
}

interface ComidaFormData {
  calorias: string;
  opciones: Record<string, {
    descripcion: string;
    proteina: string;
    hidratos: string;
    grasas: string;
  }>;
}

interface DietaFormData {
  caloriasTotales: string;
  comidas: Record<string, ComidaFormData>;
}

interface SuplementoFormData {
  nombre: string;
  cantidad: string;
  hora: string;
  frecuencia?: string;
  notas?: string;
}

interface SuplementacionFormData {
  suplementos: Record<string, SuplementoFormData>;
}

// ---------------------------------------------------------- CLASE -----------------------------------------------------

const CreateModalData = ({ isOpen, onClose, itemType, clientId, trainerId }: CreateModalDataProps) => {
  const { crearRutina, loading: loadingRutinas } = useRutinas();
  const { crearDieta, loading: loadingDietas } = useDietas();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState<RutinaFormData | DietaFormData | SuplementacionFormData | {}>({});
  const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loading = loadingRutinas || loadingDietas;

  // Funciones para cerrar el modal
  const handleClose = () => {
    if (Object.keys(formData).length > 0) {
      setShowCloseConfirmation(true);
    } else {
      onClose();
    }
  };

  const confirmClose = () => {
    setShowCloseConfirmation(false);
    setFormData({});
    onClose();
  };

  const cancelClose = () => {
    setShowCloseConfirmation(false);
  };

  // Funciones para añddir datos extra
  const handleInputChange = (path: string[], value: string) => {
    const newData = {...formData};
    let current: any = newData;
    
    for (let i = 0; i < path.length - 1; i++) {
      if (!current[path[i]]) current[path[i]] = {};
      current = current[path[i]];
    }
    
    current[path[path.length - 1]] = value;
    setFormData(newData);
  };

  const handleAddDia = () => {
    const newDiaId = `dia${Object.keys((formData as RutinaFormData).dias || {}).length + 1}`;
    const newData = {
      ...formData,
      dias: {
        ...(formData as RutinaFormData).dias,
        [newDiaId]: {
          ej: {} 
        }
      }
    };
    setFormData(newData);
  };

  const handleAddEjercicio = (diaId: string) => {
    const ejercicioId = `ej${Object.keys((formData as RutinaFormData).dias?.[diaId]?.ej || {}).length + 1}`;
    const newData = {...formData};
    
    if (!(newData as RutinaFormData).dias) (newData as RutinaFormData).dias = {};
    if (!(newData as RutinaFormData).dias[diaId]) (newData as RutinaFormData).dias[diaId] = { ej: {} };
    
    (newData as RutinaFormData).dias[diaId].ej[ejercicioId] = {
      nombre: '',
      series: '',
      pesoE: '',
      repsE: '',
      RIRE: '',
      observaciones: ''
    };
    
    setFormData(newData);
  };

  const handleAddComida = () => {
    const newComidaId = `comida${Object.keys((formData as DietaFormData).comidas || {}).length + 1}`;
    setFormData({
      ...formData,
      comidas: {
        ...(formData as DietaFormData).comidas,
        [newComidaId]: {
          calorias: '',
          opciones: {}
        }
      }
    });
  };

  const handleAddOpcionComida = (comidaId: string) => {
    const opcionId = `opcion_${Object.keys((formData as DietaFormData).comidas?.[comidaId]?.opciones || {}).length + 1}`;
    const newData = {...formData};
    
    if (!(newData as DietaFormData).comidas) (newData as DietaFormData).comidas = {};
    if (!(newData as DietaFormData).comidas[comidaId]) {
      (newData as DietaFormData).comidas[comidaId] = { 
        calorias: '', 
        opciones: {} 
      };
    }
    
    (newData as DietaFormData).comidas[comidaId].opciones[opcionId] = {
      descripcion: '',
      proteina: '',
      hidratos: '',
      grasas: ''
    };
    
    setFormData(newData);
  };

  // Formulario
  const validateFormData = () => {
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    switch (itemType) {
      case 'rutina':
        if (!(formData as RutinaFormData).dias || Object.keys((formData as RutinaFormData).dias).length === 0) {
          throw new Error('Debe agregar al menos un día a la rutina');
        }
        break;
      case 'dieta':
        if (!(formData as DietaFormData).caloriasTotales) {
          throw new Error('Las calorías totales son requeridas');
        }
        break;
      case 'suplemento':
        if (!(formData as SuplementacionFormData).suplementos || Object.keys((formData as SuplementacionFormData).suplementos).length === 0) {
          throw new Error('Debe agregar al menos un suplemento');
        }
        break;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);
  
  try {
    validateFormData();

    const baseData = {
      cliente_ID: clientId,
      entrenador_ID: trainerId,
      fechaCreacion: Timestamp.now(),
      activo: false
    };

    // Switch para selecionar el tipo de datos

    switch (itemType) {

      case 'rutina':
        const rutinaData = formData as RutinaFormData;
        
        if (!rutinaData.dias || Object.keys(rutinaData.dias).length === 0) {
          throw new Error('Debe agregar al menos un día con ejercicios');
        }

        for (const diaId in rutinaData.dias) {
          if (!rutinaData.dias[diaId].ej || Object.keys(rutinaData.dias[diaId].ej).length === 0) {
            throw new Error(`El día ${diaId.replace('dia', '')} no tiene ejercicios`);
          }
        }

        const rutinaParaCrear: Omit<Rutina, 'fechaCreacion'> = {
          activo: false, 
          cliente_ID: clientId, 
          entrenador_ID: trainerId, 
          dias: Object.entries(rutinaData.dias).reduce((acc, [diaId, dia]) => {
            acc[diaId] = {
              ej: Object.entries(dia.ej).reduce((ejerciciosAcc, [ejId, ejercicio]) => {
                ejerciciosAcc[ejId] = {
                  nombre: ejercicio.nombre,
                  pesoE: Number(ejercicio.pesoE) || 0,
                  repsE: Number(ejercicio.repsE) || 0,
                  RIRE: Number(ejercicio.RIRE) || 0,
                  series: ejercicio.series || '',
                  pesoC: null,
                  repsC: null,
                  RIRC: null,
                  completado: false,
                  observaciones: ''
                };
                return ejerciciosAcc;
              }, {} as Record<string, DatosEjercicio>)
            };
            return acc;
          }, {} as Record<string, DiaRutina>)
        };

        await crearRutina(rutinaParaCrear);
        break;
          
        case 'dieta':
          const calorias = Number((formData as DietaFormData).caloriasTotales);
          if (isNaN(calorias)) throw new Error("Las calorías deben ser un número válido");
          
          await crearDieta({
            ...baseData,
            caloriasTotales: calorias,
            comidas: Object.entries((formData as DietaFormData).comidas || {}).reduce((acc, [comidaId, comida]) => {
              acc[comidaId] = {
                calorias: Number(comida.calorias) || 0,
                opciones: Object.entries(comida.opciones || {}).reduce((opcionesAcc, [opcionId, opcion]) => {
                  opcionesAcc[opcionId] = {
                    descripcion: opcion.descripcion,
                    proteina: Number(opcion.proteina) || 0,
                    hidratos: Number(opcion.hidratos) || 0,
                    grasas: Number(opcion.grasas) || 0
                  };
                  return opcionesAcc;
                }, {} as Record<string, any>)
              };
              return acc;
            }, {} as Record<string, any>)
          });
          break;
      }
      
      setFormData({});
      onClose();
    } catch (err) {
      console.error("Error al crear:", err);
      setError(err instanceof Error ? err.message : 'Error al crear la rutina');
    }
  };

  if (!isOpen) return null;

  // Estilos y HTML

  const renderFormFields = () => {
    switch (itemType) {
    case 'rutina':
      return (
        <div style={styles.modalBody}>
          <button 
            type="button" 
            style={styles.addButton}
            onClick={handleAddDia}
          >
            + Añadir día
          </button>

          {Object.entries((formData as RutinaFormData).dias || {}).map(([diaId, dia]) => (
            <div key={diaId} style={styles.ejercicioContainer}>
              <h4 style={styles.ejercicioTitle}>Día {diaId.replace('dia', '')}</h4>
              
              <button 
                type="button" 
                style={styles.addButton}
                onClick={() => handleAddEjercicio(diaId)}
              >
                + Añadir ejercicio
              </button>
              
              {dia.ej && Object.entries(dia.ej).map(([ejId, ejercicio]) => (
                <div key={ejId} style={{marginBottom: '1.5rem'}}>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Nombre del ejercicio</label>
                    <input
                      type="text"
                      style={styles.formInput}
                      value={ejercicio.nombre || ''}
                      onChange={(e) => handleInputChange(['dias', diaId, 'ej', ejId, 'nombre'], e.target.value)}
                      required
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Series (ej: "3x12")</label>
                    <input
                      type="text"
                      style={styles.formInput}
                      value={ejercicio.series || ''}
                      onChange={(e) => handleInputChange(['dias', diaId, 'ej', ejId, 'series'], e.target.value)}
                      required
                    />
                  </div>

                  <div style={styles.formRow}>
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>Peso (kg)</label>
                      <input
                        type="number"
                        style={styles.formInput}
                        value={ejercicio.pesoE || ''}
                        onChange={(e) => handleInputChange(['dias', diaId, 'ej', ejId, 'pesoE'], e.target.value)}
                        required
                      />
                    </div>

                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>Repeticiones</label>
                      <input
                        type="number"
                        style={styles.formInput}
                        value={ejercicio.repsE || ''}
                        onChange={(e) => handleInputChange(['dias', diaId, 'ej', ejId, 'repsE'], e.target.value)}
                        required
                      />
                    </div>

                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>RIR</label>
                      <input
                        type="number"
                        style={styles.formInput}
                        value={ejercicio.RIRE || ''}
                        onChange={(e) => handleInputChange(['dias', diaId, 'ej', ejId, 'RIRE'], e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      );
      case 'dieta':
        return (
          <div style={styles.modalBody}>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Calorías totales</label>
              <input
                type="text"
                style={styles.formInput}
                value={(formData as DietaFormData).caloriasTotales || ''}
                onChange={(e) => setFormData({...formData, caloriasTotales: e.target.value})}
              />
            </div>

            <button 
              type="button" 
              style={styles.addButton}
              onClick={handleAddComida}
            >
              + Añadir comida
            </button>

            {Object.entries((formData as DietaFormData).comidas || {}).map(([comidaId, comida]) => (
              <div key={comidaId} style={styles.ejercicioContainer}>
                <h4 style={styles.ejercicioTitle}>{comidaId}</h4>
                
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Calorías</label>
                  <input
                    type="text"
                    style={styles.formInput}
                    value={comida.calorias || ''}
                    onChange={(e) => handleInputChange(['comidas', comidaId, 'calorias'], e.target.value)}
                  />
                </div>
                
                <button 
                  type="button" 
                  style={styles.addButton}
                  onClick={() => handleAddOpcionComida(comidaId)}
                >
                  + Añadir opción
                </button>
                
                {comida.opciones && Object.entries(comida.opciones).map(([opcionId, opcion]) => (
                  <div key={opcionId} style={{marginBottom: '1.5rem'}}>
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>Descripción</label>
                      <input
                        type="text"
                        style={styles.formInput}
                        value={opcion.descripcion || ''}
                        onChange={(e) => handleInputChange(['comidas', comidaId, 'opciones', opcionId, 'descripcion'], e.target.value)}
                      />
                    </div>

                    <div style={styles.formRow}>
                      <div style={styles.formGroup}>
                        <label style={styles.formLabel}>Proteína (g)</label>
                        <input
                          type="text"
                          style={styles.formInput}
                          value={opcion.proteina || ''}
                          onChange={(e) => handleInputChange(['comidas', comidaId, 'opciones', opcionId, 'proteina'], e.target.value)}
                        />
                      </div>

                      <div style={styles.formGroup}>
                        <label style={styles.formLabel}>Hidratos (g)</label>
                        <input
                          type="text"
                          style={styles.formInput}
                          value={opcion.hidratos || ''}
                          onChange={(e) => handleInputChange(['comidas', comidaId, 'opciones', opcionId, 'hidratos'], e.target.value)}
                        />
                      </div>

                      <div style={styles.formGroup}>
                        <label style={styles.formLabel}>Grasas (g)</label>
                        <input
                          type="text"
                          style={styles.formInput}
                          value={opcion.grasas || ''}
                          onChange={(e) => handleInputChange(['comidas', comidaId, 'opciones', opcionId, 'grasas'], e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  // Estilos
  const styles: { [key: string]: CSSProperties } = {
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      background: "#DAD7CD",
    },
    modalContent: {
      backgroundColor: 'white',
      padding: '2rem',
      borderRadius: '0.5rem',
      width: '1000px', 
      maxHeight: '60vh',
      overflowY: 'auto',
      position: 'relative',
    },
    modalHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1.5rem',
      paddingBottom: '1rem',
      borderBottom: '1px solid #e2e8f0'
    },
    modalTitle: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: '#2d3748',
      margin: 0
    },
    modalBody: {
      marginBottom: '2rem'
    },
    modalActions: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '1rem',
      paddingTop: '1.5rem',
    },
    formGroup: {
      marginBottom: '1.5rem'
    },
    formRow: {
      display: 'flex',
      gap: '1rem',
      marginBottom: '1rem'
    },
    formLabel: {
      display: 'block',
      marginBottom: '0.5rem',
      fontWeight: 500,
      color: '#4a5568',
      fontSize: '0.875rem'
    },
    formInput: {
      width: '100%',
      padding: '0.75rem',
      borderRadius: '0.375rem',
      border: '1px solid #e2e8f0',
      backgroundColor: '#f8fafc',
      fontSize: '1rem',
      transition: 'border-color 0.2s',
      outline: 'none'
    },
    button: {
      padding: '0.75rem 1.5rem',
      borderRadius: '0.375rem',
      border: 'none',
      cursor: 'pointer',
      fontWeight: 500,
      fontSize: '1rem',
      transition: 'all 0.2s'
    },
    saveButton: {
      backgroundColor: '#38a169',
      color: 'white',
    },
    cancelButton: {
      backgroundColor: '#e53e3e',
      color: 'white',
    },
    ejercicioContainer: {
      padding: '1rem',
      borderRadius: '0.375rem',
      marginBottom: '1.5rem',
      border: '1px solid #e2e8f0',
      backgroundColor: '#f8fafc'
    },
    ejercicioTitle: {
      fontSize: '1.125rem',
      fontWeight: 600,
      color: '#2d3748',
      marginBottom: '1rem'
    },
    closeButton: {
      position: 'absolute',
      top: '1rem',
      right: '1rem',
      background: 'none',
      border: 'none',
      fontSize: '1.5rem',
      cursor: 'pointer',
      color: '#4a5568',
    },
    addButton: {
      backgroundColor: '#3182ce',
      color: 'white',
      padding: '0.5rem 1rem',
      borderRadius: '0.375rem',
      border: 'none',
      cursor: 'pointer',
      marginBottom: '1rem',
      fontSize: '0.875rem'
    },
    confirmationModal: {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: 'white',
      padding: '2rem',
      borderRadius: '0.5rem',
      zIndex: 1100,
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      textAlign: 'center',
    },
    confirmationButtons: {
      display: 'flex',
      justifyContent: 'center',
      gap: '1rem',
      marginTop: '1.5rem',
    },
    confirmationButton: {
      padding: '0.5rem 1rem',
      borderRadius: '0.375rem',
      border: 'none',
      cursor: 'pointer',
      fontWeight: 500,
    },
    confirmButton: {
      backgroundColor: '#e53e3e',
      color: 'white',
    },
    cancelConfirmationButton: {
      backgroundColor: '#edf2f7',
      color: '#4a5568',
    },
    errorMessage: {
      backgroundColor: 'rgba(220, 38, 38, 0.1)',
      color: '#dc2626',
      padding: '0.75rem',
      borderRadius: '0.375rem',
      marginBottom: '1rem',
      borderLeft: '3px solid #dc2626'
    }
  };

  // Modales de veificacion
  return (
    <>
      <div style={styles.modalOverlay}>
        <div style={styles.modalContent}>
          <button style={styles.closeButton} onClick={handleClose} aria-label="Cerrar modal">
            ×
          </button>
          
          <div style={styles.modalHeader}>
            <h3 style={styles.modalTitle}>Crear nueva {itemType}</h3>
          </div>
          
          {error && (
            <div style={styles.errorMessage}>
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            {renderFormFields()}
            
            <div style={styles.modalActions}>
              <button 
                type="button"
                style={{...styles.button, ...styles.cancelButton}}
                onClick={handleClose}
                disabled={loading}
              >
                Cancelar
              </button>
              <button 
                type="submit"
                style={{...styles.button, ...styles.saveButton}}
                disabled={loading}
              >
                {loading ? 'Creando...' : 'Crear'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {showCloseConfirmation && (
        <div style={styles.confirmationModal}>
          <p>¿Estás seguro que quieres cerrar? Los datos no se guardarán.</p>
          <div style={styles.confirmationButtons}>
            <button 
              style={{...styles.confirmationButton, ...styles.confirmButton}}
              onClick={confirmClose}
            >
              Sí, cerrar
            </button>
            <button 
              style={{...styles.confirmationButton, ...styles.cancelConfirmationButton}}
              onClick={cancelClose}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateModalData;