import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DeleteAccountModal from './DeleteAccountModal';
import ToggleUserStatusModal from './ToggleUserStatusModal';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileModal({ isOpen, onClose }: ModalProps) {
  const { user, updateProfile } = useAuth();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'view' | 'edit'>('view');
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    apellido2: '',
    edad: 0,
    telefono: '',
    direccion: '',
    codigoPostal: '',
    ciudad: '',
    empresa: '',
    ciudadEmpresa: '',
    especialidad: '',
    experiencia: 0,
    biografia: '',
    fotoPerfilUrl: '',
    fotoPerfilFile: null as File | null
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        nombre: user.nombre || '',
        apellido: user.apellido || '',
        apellido2: user.apellido2 || '',
        edad: user.edad || 0,
        telefono: user.telefono || '',
        direccion: user.direccion || '',
        codigoPostal: user.codigoPostal || '',
        ciudad: user.ciudad || '',
        empresa: user.empresa || '',
        ciudadEmpresa: user.ciudadEmpresa || '',
        especialidad: user.especialidad || '',
        experiencia: user.experiencia || 0,
        biografia: user.biografia || '',
        fotoPerfilUrl: user.fotoPerfilUrl || '',
        fotoPerfilFile: null
      });
    }
  }, [user, activeTab]);

  const styles = {
    overlay: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(52, 78, 65, 0.9)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(8px)',
    },
    content: {
      backgroundColor: '#DAD7CD',
      padding: '2rem',
      borderRadius: '1rem',
      width: '90%',
      maxWidth: '700px',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
      position: 'relative' as const,
      maxHeight: '90vh',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column' as const,
      border: 'none',
    },
      scrollContainer: {
      overflowY: 'auto' as const,
      paddingRight: '1rem',
      scrollbarWidth: 'none' as const,
      msOverflowStyle: 'none' as const, 
      '&::-webkit-scrollbar': {
        display: 'none',
      },
    } as React.CSSProperties, 
    tabsContainer: {
      display: 'flex',
      borderBottom: '2px solid #588157',
      marginBottom: '1.5rem',
      position: 'sticky' as const,
      top: 0,
      backgroundColor: '#DAD7CD',
      zIndex: 1,
      paddingTop: '0.5rem',
    },
    tab: {
      padding: '0.75rem 1.5rem',
      cursor: 'pointer',
      borderBottom: '3px solid transparent',
      fontWeight: 500,
      fontSize: '1rem',
      transition: 'all 0.2s ease',
      color: '#3A5A40',
      fontFamily: '"ABeeZee", sans-serif',
    },
    activeTab: {
      borderBottom: '3px solid #D65A31',
      color: '#D65A31',
      fontWeight: 600,
    },
    tabContent: {
      padding: '0.5rem 0',
    },
    title: {
      fontSize: '1.75rem',
      fontWeight: 600,
      marginBottom: '1.5rem',
      color: '#344E41',
      fontFamily: '"Bebas Neue", sans-serif',
      letterSpacing: '1px',
      textTransform: 'uppercase' as const,
    },
    infoText: {
      margin: '0.75rem 0',
      fontSize: '1rem',
      color: '#3A5A40',
      fontFamily: '"ABeeZee", sans-serif',
      lineHeight: '1.6',
    },
    inputGroup: {
      marginBottom: '1.25rem',
    },
    label: {
      display: 'block',
      marginBottom: '0.5rem',
      fontSize: '0.95rem',
      color: '#344E41',
      fontWeight: 500,
      fontFamily: '"ABeeZee", sans-serif',
    },
    input: {
      width: '100%',
      padding: '0.75rem',
      border: '1px solid #A3B18A',
      borderRadius: '8px',
      fontSize: '0.95rem',
      transition: 'border-color 0.2s ease',
      backgroundColor: 'rgba(255, 255, 255, 0.7)',
      fontFamily: '"ABeeZee", sans-serif',
    },
    textarea: {
      width: '100%',
      padding: '0.75rem',
      border: '1px solid #A3B18A',
      borderRadius: '8px',
      fontSize: '0.95rem',
      minHeight: '120px',
      resize: 'vertical' as const,
      backgroundColor: 'rgba(255, 255, 255, 0.7)',
      fontFamily: '"ABeeZee", sans-serif',
    },
    photoContainer: {
      position: 'relative' as const,
      width: '120px',
      height: '120px',
      margin: '1rem auto',
      cursor: 'pointer',
    },
    previewImage: {
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      objectFit: 'cover' as const,
      border: '3px solid #588157',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    },
    photoEditOverlay: {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderRadius: '50%',
      backgroundColor: 'rgba(214, 90, 49, 0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      color: 'white',
      fontSize: '0.9rem',
      fontWeight: 500,
      opacity: 0,
      transition: 'opacity 0.3s ease',
    },
    fileInput: {
      display: 'none',
    },
    buttonContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      gap: '1rem',
      marginTop: '2rem',
      flexWrap: 'wrap' as const,
      position: 'sticky' as const,
      bottom: 0,
      backgroundColor: '#DAD7CD',
      padding: '1rem 0',
      borderTop: '2px solid #A3B18A',
    },
    button: {
      padding: '0.75rem 1.5rem',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '1rem',
      fontWeight: 500,
      border: 'none',
      transition: 'all 0.2s ease',
      fontFamily: '"ABeeZee", sans-serif',
      flex: '1 1 auto',
      minWidth: '120px',
    },
    saveButton: {
      backgroundColor: '#3A5A40',
      color: '#DAD7CD',
    },
    closeButton: {
      backgroundColor: '#588157',
      color: '#DAD7CD',
    },
    deleteButton: {
      backgroundColor: '#D65A31',
      color: '#DAD7CD',
    },
    statusButton: {
      backgroundColor: '#A3B18A',
      color: '#344E41',
      padding: '0.5rem 1rem',
    },
    disabledButton: {
      opacity: 0.7,
      cursor: 'not-allowed',
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'edad' || name === 'experiencia' ? parseInt(value) || 0 : value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          fotoPerfilUrl: reader.result as string,
          fotoPerfilFile: file
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const hasChanges = user && (
    formData.nombre !== user.nombre ||
    formData.apellido !== user.apellido ||
    formData.apellido2 !== user.apellido2 ||
    formData.edad !== user.edad ||
    formData.telefono !== (user.telefono || '') ||
    formData.direccion !== (user.direccion || '') ||
    formData.codigoPostal !== (user.codigoPostal || '') ||
    formData.ciudad !== (user.ciudad || '') ||
    formData.empresa !== (user.empresa || '') ||
    formData.ciudadEmpresa !== (user.ciudadEmpresa || '') ||
    formData.especialidad !== (user.especialidad || '') ||
    formData.experiencia !== (user.experiencia || 0) ||
    formData.biografia !== (user.biografia || '') ||
    formData.fotoPerfilFile !== null
  );

  const handleSave = async () => {
    if (!user || !hasChanges) return;

    try {
      setIsSaving(true);
      
      if (!formData.nombre.trim()) {
        alert('Name is required');
        return;
      }

      if (!formData.apellido.trim()) {
        alert('Surname is required');
        return;
      }

      if (formData.edad < 18 || formData.edad > 100) {
        alert('Age must be between 18 and 100');
        return;
      }

      let fotoPerfilUrl = formData.fotoPerfilUrl;
      if (formData.fotoPerfilFile) {
        //fotoPerfilUrl = await uploadProfileImage(formData.fotoPerfilFile, user.id);
      }

      await updateProfile(user.id, {
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        apellido2: formData.apellido2?.trim(),
        edad: formData.edad,
        telefono: formData.telefono.trim(),
        direccion: formData.direccion.trim(),
        codigoPostal: formData.codigoPostal.trim(),
        ciudad: formData.ciudad.trim(),
        empresa: formData.empresa.trim(),
        ciudadEmpresa: formData.ciudadEmpresa.trim(),
        especialidad: formData.especialidad.trim(),
        experiencia: formData.experiencia,
        biografia: formData.biografia.trim(),
        fotoPerfilUrl: fotoPerfilUrl
      });

      setActiveTab('view');
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      alert('Profile could not be updated. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || !user) {
    return null;
  }

  return (
    <>
      <div style={styles.overlay} onClick={onClose}>
        <div style={styles.content} onClick={(e) => e.stopPropagation()}>
          <div style={styles.tabsContainer}>
            <div 
              style={{ ...styles.tab, ...(activeTab === 'view' ? styles.activeTab : {}) }}
              onClick={() => setActiveTab('view')}
            >
              View Profile
            </div>
            <div
              style={{ ...styles.tab, ...(activeTab === 'edit' ? styles.activeTab : {}) }}
              onClick={() => setActiveTab('edit')}
            >
              Edit Profile
            </div>
          </div>

          <div style={styles.scrollContainer}>
            <div style={styles.tabContent}>
              {activeTab === 'view' ? (
                <>
                  <h2 style={styles.title}>Trainer Information</h2>
                  {user.fotoPerfilUrl && (
                    <div style={styles.photoContainer}>
                      <img src={user.fotoPerfilUrl} alt="Profile photo" style={styles.previewImage} />
                    </div>
                  )}
                  <div>
                    <p style={styles.infoText}>
                      <strong>Name:</strong> {user.nombre} {user.apellido} {user.apellido2}
                    </p>
                    <p style={styles.infoText}>
                      <strong>Email:</strong> {user.email}
                    </p>
                    <p style={styles.infoText}>
                      <strong>Age:</strong> {user.edad}
                    </p>
                    <p style={styles.infoText}>
                      <strong>Phone:</strong> {user.telefono || 'Not specified'}
                    </p>
                    <p style={styles.infoText}>
                      <strong>Address:</strong> {user.direccion || 'Not specified'}
                    </p>
                    <p style={styles.infoText}>
                      <strong>City:</strong> {user.ciudad || 'Not specified'}
                    </p>
                    <p style={styles.infoText}>
                      <strong>Zip Code:</strong> {user.codigoPostal || 'Not specified'}
                    </p>
                    <p style={styles.infoText}>
                      <strong>Company:</strong> {user.empresa || 'Not specified'}
                    </p>
                    <p style={styles.infoText}>
                      <strong>Company Location:</strong> {user.ciudadEmpresa || 'Not specified'}
                    </p>
                    <p style={styles.infoText}>
                      <strong>Specialty:</strong> {user.especialidad || 'Not specified'}
                    </p>
                    <p style={styles.infoText}>
                      <strong>Years of experience:</strong> {user.experiencia || 0}
                    </p>
                    <p style={styles.infoText}>
                      <strong>Biography:</strong> {user.biografia || 'Not specified'}
                    </p>
                    <p style={styles.infoText}>
                      <strong>Status:</strong> {user.activo ? 'Active' : 'Inactive'}
                    </p>
                    <p style={styles.infoText}>
                      <strong>Clients:</strong> {user.clientes?.length || 0}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <h2 style={styles.title}>Edit Profile</h2>

                  {/* Profile photo */}
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Profile photo</label>
                    <input
                      type="file"
                      id="fotoPerfil"
                      accept="image/*"
                      style={styles.fileInput}
                      onChange={handleFileChange}
                    />
                    {formData.fotoPerfilUrl && (
                      <div 
                        style={styles.photoContainer}
                        onClick={() => document.getElementById('fotoPerfil')?.click()}
                      >
                        <img src={formData.fotoPerfilUrl} alt="Preview" style={styles.previewImage} />
                        <div style={styles.photoEditOverlay}>
                          Change photo
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Basic information */}
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Name*</label>
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      style={styles.input}
                      required
                    />
                  </div>
                  
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>First surname*</label>
                    <input
                      type="text"
                      name="apellido"
                      value={formData.apellido}
                      onChange={handleInputChange}
                      style={styles.input}
                      required
                    />
                  </div>
                  
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Second surname</label>
                    <input
                      type="text"
                      name="apellido2"
                      value={formData.apellido2}
                      onChange={handleInputChange}
                      style={styles.input}
                    />
                  </div>
                  
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Age*</label>
                    <input
                      type="number"
                      name="edad"
                      value={formData.edad}
                      onChange={handleInputChange}
                      style={styles.input}
                      min="18"
                      max="100"
                      required
                    />
                  </div>
                  
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Phone</label>
                    <input
                      type="tel"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleInputChange}
                      style={styles.input}
                    />
                  </div>
                  
                  {/* Location information */}
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Address</label>
                    <input
                      type="text"
                      name="direccion"
                      value={formData.direccion}
                      onChange={handleInputChange}
                      style={styles.input}
                    />
                  </div>
                  
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Zip Code</label>
                    <input
                      type="text"
                      name="codigoPostal"
                      value={formData.codigoPostal}
                      onChange={handleInputChange}
                      style={styles.input}
                    />
                  </div>
                  
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>City</label>
                    <input
                      type="text"
                      name="ciudad"
                      value={formData.ciudad}
                      onChange={handleInputChange}
                      style={styles.input}
                    />
                  </div>
                  
                  {/* Professional information */}
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Company</label>
                    <input
                      type="text"
                      name="empresa"
                      value={formData.empresa}
                      onChange={handleInputChange}
                      style={styles.input}
                    />
                  </div>
                  
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Company location</label>
                    <input
                      type="text"
                      name="ciudadEmpresa"
                      value={formData.ciudadEmpresa}
                      onChange={handleInputChange}
                      style={styles.input}
                    />
                  </div>
                  
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Specialty</label>
                    <input
                      type="text"
                      name="especialidad"
                      value={formData.especialidad}
                      onChange={handleInputChange}
                      style={styles.input}
                    />
                  </div>
                  
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Years of experience</label>
                    <input
                      type="number"
                      name="experiencia"
                      value={formData.experiencia}
                      onChange={handleInputChange}
                      style={styles.input}
                      min="0"
                      max="50"
                    />
                  </div>
                  
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Biography</label>
                    <textarea
                      name="biografia"
                      value={formData.biografia}
                      onChange={handleInputChange}
                      style={styles.textarea}
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          <div style={styles.buttonContainer}>
            {activeTab === 'edit' && (
              <button 
                style={{ 
                  ...styles.button, 
                  ...styles.saveButton,
                  ...(!hasChanges || isSaving ? styles.disabledButton : {}) 
                }}
                onClick={handleSave}
                disabled={!hasChanges || isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            )}
            <button 
              style={{ 
                ...styles.button, 
                ...styles.deleteButton,
                ...(isSaving ? styles.disabledButton : {}) 
              }}
              onClick={() => setShowDeleteModal(true)}
              disabled={isSaving}
            >
              Delete Account
            </button>
            <button 
              onClick={() => setShowStatusModal(true)}
              style={{
                ...styles.button,
                ...styles.statusButton,
                ...(isSaving ? styles.disabledButton : {})
              }}
              disabled={isSaving}
            >
              {user.activo ? 'Deactivate' : 'Activate'}
            </button>
            <button 
              style={{ 
                ...styles.button, 
                ...styles.closeButton,
                ...(isSaving ? styles.disabledButton : {}) 
              }}
              onClick={onClose}
              disabled={isSaving}
            >
              Close
            </button>
          </div>
        </div>
      </div>

      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onSuccess={onClose} 
      />

      <ToggleUserStatusModal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        currentStatus={user?.activo || false}
        onSuccess={() => {
          if (user) {
            updateProfile(user.id, { activo: !user.activo });
          }
        }}
      />
    </>
  );
}