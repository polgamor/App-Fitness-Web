import { CSSProperties, useState, useEffect } from 'react';

// INTERFAZ CON LO QUE SE PUEDE MODIFICAR
interface UpdateDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    itemId: string | undefined,      
    subItemId: string | undefined,   
    thirdLevelId: string | undefined,          
    updates: any                     
  ) => Promise<void>;
  itemType: 'rutina' | 'dieta' | 'suplemento';
  initialData: any;
}

const UpdateDataModal = ({
  isOpen,
  onClose,
  onSave,
  itemType,
  initialData
}: UpdateDataModalProps) => {
  const [formData, setFormData] = useState<any>(initialData); 
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleNestedChange = (path: string[], value: string) => {
  const newData = { ...formData };
    let current: any = newData;

    for (let i = 0; i < path.length - 1; i++) {
      if (!current[path[i]]) current[path[i]] = {};
      current = current[path[i]];
    }

    current[path[path.length - 1]] = value;
    setFormData(newData);
  };

  // -------------------------------- FUNCIONES RUTINAS -----------------------------------------------

  // Añadir ejercicio
  const handleAddEjercicio = (diaId: string) => {
  const ejercicioId = `ej${Object.keys(formData.dias?.[diaId]?.ej || {}).length + 1}`;
  const newData = { ...formData };

    if (!newData.dias) newData.dias = {};
    if (!newData.dias[diaId]) newData.dias[diaId] = { ej: {} };
    if (!newData.dias[diaId].ej) newData.dias[diaId].ej = {};

    newData.dias[diaId].ej[ejercicioId] = {
      nombre: '',
      series: '',
      pesoE: '',
    };

    setFormData(newData);
  };

  // Añadir dia
  const handleAddDia = () => {
  const newDiaId = `dia${Object.keys(formData.dias || {}).length + 1}`;
    setFormData({
      ...formData,
      dias: {
        ...formData.dias,
        [newDiaId]: {
          ej: {}
        }
      }
    });
  };

  // Funciones eliminacion rutinas
  const handleRemoveDia = (diaId: string) => {
    const newData = { ...formData };
    if (newData.dias && newData.dias[diaId]) {
      delete newData.dias[diaId];
      setFormData(newData);
    }
  };

  const handleRemoveEjercicio = (diaId: string, ejercicioId: string) => {
    if (!formData?.dias?.[diaId]?.ej?.[ejercicioId]) {
      setError('No se encontró el ejercicio a eliminar');
      return;
    }
    if (window.confirm('¿Estás seguro de eliminar este ejercicio?')) {
      const newData = { ...formData };
      delete newData.dias[diaId].ej[ejercicioId];
      if (Object.keys(newData.dias[diaId].ej).length === 0) {
        delete newData.dias[diaId];
      }
      
      setFormData(newData);
    }
  };
  
  // -------------------------------- FUNCIONES DIETAS  -----------------------------------------------

  // Añadir comida (desayuno, almuerzo, etc)
  const handleAddComida = () => {
  const newComidaId = `comida${Object.keys(formData.comidas || {}).length + 1}`;
    setFormData({
      ...formData,
      comidas: {
        ...formData.comidas,
        [newComidaId]: {
          calorias: 0,
          opciones: {}
        }
      }
    });
  };

  // Añadir opcion de esa comida
  const handleAddOpcion = (comidaId: string) => {
  const opcionId = `opcion_${Object.keys(formData.comidas?.[comidaId]?.opciones || {}).length + 1}`;
  const newData = { ...formData };

    if (!newData.comidas) newData.comidas = {};
    if (!newData.comidas[comidaId]) newData.comidas[comidaId] = { opciones: {} };
    if (!newData.comidas[comidaId].opciones) newData.comidas[comidaId].opciones = {};

    newData.comidas[comidaId].opciones[opcionId] = {
      descripcion: '',
      proteina: 0,
      hidratos: 0,
      grasas: 0,
      otros: ''
    };

    setFormData(newData);
  };

  // Funciones eliminar datos de dieta
  const handleRemoveComida = (comidaId: string) => {
    const newData = { ...formData };
    if (newData.comidas && newData.comidas[comidaId]) {
      delete newData.comidas[comidaId];
      setFormData(newData);
    }
  };

  const handleRemoveOpcion = (comidaId: string, opcionId: string) => {
    const newData = { ...formData };
    if (newData.comidas?.[comidaId]?.opciones?.[opcionId]) {
      delete newData.comidas[comidaId].opciones[opcionId];
      setFormData(newData);
    }
  };

   // -------------------------------- FUNCIONES SUPLEMENTOS -----------------------------------------------
   
  const handleAddSuplemento = () => {
    const suplementoId = `sup${Object.keys(formData.suplementos || {}).length + 1}`;
    const newData = { ...formData };

    if (!newData.suplementos) newData.suplementos = {};
    
    newData.suplementos[suplementoId] = {
      nombre: '',
      cantidad: '',
      hora: '',
      frecuencia: '',
      notas: ''
    };

    setFormData(newData);
  };

  const handleRemoveSuplemento = (suplementoId: string) => {
    if (!formData?.suplementos?.[suplementoId]) {
      setError('No se encontró el suplemento a eliminar');
      return;
    }
    
    if (window.confirm('¿Estás seguro de eliminar este suplemento?')) {
      const newData = { ...formData };
      delete newData.suplementos[suplementoId];
      setFormData(newData);
    }
  };

  // Submit al formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await onSave(formData.id, formData.suplementoId, undefined, formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  // Visualizacion de los campos para actualizar
  const renderFormFields = () => {
    switch (itemType) {
      case 'rutina':
        return (
          <>
            <button
              type="button"
              style={styles.addButton}
              onClick={handleAddDia}
              >
              + Añadir día
            </button>

            {formData?.dias && Object.entries(formData.dias).map(([diaId, dia]: [string, any]) => (
              <div key={diaId} style={styles.section}>

                <button
                  type="button"
                  style={styles.deleteButton}
                  onClick={() => handleRemoveDia(diaId)}
                  >
                  Eliminar día
                </button>

                <h4 style={styles.sectionTitle}>Día {diaId.replace('dia', '')}</h4>

                <button
                  type="button"
                  style={styles.addButton}
                  onClick={() => handleAddEjercicio(diaId)}
                >
                  + Añadir ejercicio
                </button>

                {dia.ej && Object.entries(dia.ej).map(([ejId, ejercicio]: [string, any]) => (
                  <div key={ejId} style={styles.subSection}>
                    <button
                      type="button"
                      style={styles.deleteSmallButton}
                      onClick={() => handleRemoveEjercicio(diaId, ejId)}
                      >
                      Eliminar
                    </button>
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>Nombre del ejercicio</label>
                      <input
                        type="text"
                        value={ejercicio.nombre || ''}
                        onChange={(e) => handleNestedChange(['dias', diaId, 'ej', ejId, 'nombre'], e.target.value)}
                        style={styles.formInput}
                      />
                    </div>

                    <div style={styles.formRow}>
                      <div style={styles.formGroup}>
                        <label style={styles.formLabel}>Series</label>
                        <input
                          type="text"
                          value={ejercicio.series || ''}
                          onChange={(e) => handleNestedChange(['dias', diaId, 'ej', ejId, 'series'], e.target.value)}
                          style={styles.formInput}
                        />
                      </div>

                      <div style={styles.formGroup}>
                        <label style={styles.formLabel}>Peso</label>
                        <input
                          type="text"
                          value={ejercicio.pesoE || ''}
                          onChange={(e) => handleNestedChange(['dias', diaId, 'ej', ejId, 'pesoE'], e.target.value)}
                          style={styles.formInput}
                        />
                      </div>

                      <div style={styles.formGroup}>
                        <label style={styles.formLabel}>Repeticiones</label>
                        <input
                          type="number"
                          style={styles.formInput}
                          value={ejercicio.repsE || ''}
                          onChange={(e) => handleNestedChange(['dias', diaId, 'ej', ejId, 'repsE'], e.target.value)}
                          required
                        />
                      </div>

                      <div style={styles.formGroup}>
                        <label style={styles.formLabel}>RIR</label>
                        <input
                          type="number"
                          style={styles.formInput}
                          value={ejercicio.RIRE || ''}
                          onChange={(e) => handleNestedChange(['dias', diaId, 'ej', ejId, 'RIRE'], e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </>
        );

       case 'dieta':
        return (
          <>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Calorías totales</label>
              <input
                type="number"
                name="caloriasTotales"
                value={formData?.caloriasTotales || 0}
                onChange={handleChange}
                style={styles.formInput}
              />
            </div>

            <button
              type="button"
              style={styles.addButton}
              onClick={handleAddComida}
            >
              + Añadir comida
            </button>

            {formData?.comidas && Object.entries(formData.comidas).map(([comidaId, comida]: [string, any]) => (
              <div key={comidaId} style={styles.section}>
                <h4 style={styles.sectionTitle}>Comida: {comidaId.replace('comida', '')}</h4>

                <button
                  type="button"
                  style={styles.deleteButton}
                  onClick={() => handleRemoveComida(comidaId)}
                  >
                  Eliminar comida
                </button>

                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Calorías</label>
                  <input
                    type="number"
                    value={comida.calorias || 0}
                    onChange={(e) => handleNestedChange(['comidas', comidaId, 'calorias'], e.target.value)}
                    style={styles.formInput}
                  />
                </div>

                <button
                  type="button"
                  style={styles.addButton}
                  onClick={() => handleAddOpcion(comidaId)}
                >
                  + Añadir opción
                </button>

                {comida.opciones && Object.entries(comida.opciones).map(([opcionId, opcion]: [string, any]) => (
                  <div key={opcionId} style={styles.subSection}>
                    <button
                      type="button"
                      style={styles.deleteSmallButton}
                      onClick={() => handleRemoveOpcion(comidaId, opcionId)}
                    >
                      Eliminar
                    </button>
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>Descripción</label>
                      <input
                        type="text"
                        value={opcion.descripcion || ''}
                        onChange={(e) => handleNestedChange(['comidas', comidaId, 'opciones', opcionId, 'descripcion'], e.target.value)}
                        style={styles.formInput}
                      />
                    </div>

                    <div style={styles.formRow}>
                      <div style={styles.formGroup}>
                        <label style={styles.formLabel}>Proteínas (g)</label>
                        <input
                          type="number"
                          value={opcion.proteina || 0}
                          onChange={(e) => handleNestedChange(['comidas', comidaId, 'opciones', opcionId, 'proteina'], e.target.value)}
                          style={styles.formInput}
                        />
                      </div>

                      <div style={styles.formGroup}>
                        <label style={styles.formLabel}>Hidratos (g)</label>
                        <input
                          type="number"
                          value={opcion.hidratos || 0}
                          onChange={(e) => handleNestedChange(['comidas', comidaId, 'opciones', opcionId, 'hidratos'], e.target.value)}
                          style={styles.formInput}
                        />
                      </div>

                      <div style={styles.formGroup}>
                        <label style={styles.formLabel}>Grasas (g)</label>
                        <input
                          type="number"
                          value={opcion.grasas || 0}
                          onChange={(e) => handleNestedChange(['comidas', comidaId, 'opciones', opcionId, 'grasas'], e.target.value)}
                          style={styles.formInput}
                        />
                      </div>
                    </div>

                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>Otros</label>
                      <input
                        type="text"
                        value={opcion.otros || ''}
                        onChange={(e) => handleNestedChange(['comidas', comidaId, 'opciones', opcionId, 'otros'], e.target.value)}
                        style={styles.formInput}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </>
        );
       default:
        return null;
    }
  };

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContent}>
        <h3 style={styles.modalTitle}>Editar {itemType}</h3>

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
              style={{ ...styles.button, ...styles.cancelButton }}
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              style={{ ...styles.button, ...styles.saveButton }}
              disabled={isLoading}
            >
              {isLoading ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles: { [key: string]: CSSProperties } = {
  modalOverlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#DAD7CD',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    marginTop: '100px',
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '0.5rem',
    maxWidth: '1000px',
    width: '100%',
    maxHeight: '70vh',
    overflowY: 'auto',
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
  },
  modalTitle: {
    fontSize: '1.5rem',
    fontWeight: 600,
    marginBottom: '1.5rem',
    color: '#0B160C',
  },
  formGroup: {
    marginBottom: '1.5rem',
  },
  formRow: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1rem',
  },
  formLabel: {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: 500,
    color: '#4a5568',
  },
  formInput: {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '0.375rem',
    border: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc',
    fontSize: '1rem',
    transition: 'border-color 0.2s',
  },
  section: {
    padding: '1rem',
    marginBottom: '1.5rem',
    border: '1px solid #e2e8f0',
    borderRadius: '0.375rem',
  },
  sectionTitle: {
    fontSize: '1.125rem',
    fontWeight: 600,
    marginBottom: '1rem',
    color: '#2d3748',
  },
  subSection: {
    padding: '1rem',
    marginBottom: '1rem',
    backgroundColor: '#f8fafc',
    borderRadius: '0.375rem',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '1rem',
    marginTop: '1.5rem',
  },
  button: {
    padding: '0.75rem 1.5rem',
    borderRadius: '0.375rem',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 500,
    fontSize: '1rem',
    transition: 'all 0.2s',
  },
  cancelButton: {
    backgroundColor: '#e5e7eb',
    color: '#4b5563',
  },
  saveButton: {
    backgroundColor: '#588157',
    color: 'white',
  },
  errorMessage: {
    backgroundColor: 'rgba(214, 90, 49, 0.1)',
    color: '#d65a31',
    padding: '0.75rem',
    borderRadius: '0.375rem',
    marginBottom: '1.25rem',
    borderLeft: '3px solid #d65a31',
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
};

export default UpdateDataModal;