import { useState, FormEvent, ChangeEvent } from 'react';
import { auth, db } from '../../firebase';
import { useNavigate } from 'react-router-dom'; 
import { createUserWithEmailAndPassword, sendEmailVerification, AuthError } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { CSSProperties } from 'react';

interface RegisterFormProps {
  onSuccess: () => void | Promise<void>;
}

interface FormData {
  email: string;
  password: string;
  nombre: string;
}

export default function RegisterForm({ onSuccess }: RegisterFormProps) {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    nombre: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const styles: {
    container: CSSProperties;
    inputGroup: CSSProperties;
    label: CSSProperties;
    input: CSSProperties;
    error: CSSProperties;
    success: CSSProperties;
    submitButton: CSSProperties;
    link: CSSProperties;
  } = {
    container: {
      width: '100%',
    },
    inputGroup: {
      marginBottom: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem'
    },
    label: {
      fontSize: '0.875rem',
      color: '#3A5A40',
      fontWeight: 500
    },
    input: {
      padding: '0.75rem',
      borderRadius: '0.5rem',
      border: '1px solid #A3B18A',
      backgroundColor: 'white',
      fontSize: '1rem',
      color: '#344E41',
      transition: 'border-color 0.3s ease'
    },
    error: {
      color: '#D65A31',
      fontSize: '0.875rem',
      marginBottom: '1rem',
      textAlign: 'center'
    },
    success: {
      color: '#10b981',
      fontSize: '0.875rem',
      marginBottom: '1rem',
      textAlign: 'center'
    },
    submitButton: {
      width: '100%',
      padding: '0.9rem',
      backgroundColor: '#D65A31',
      color: 'white',
      border: 'none',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      fontWeight: 500,
      fontSize: '1rem',
      marginTop: '0.5rem',
      transition: 'background-color 0.3s ease',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)'
    },
    link: {
      color: '#3A5A40',
      textDecoration: 'none',
      fontSize: '0.875rem',
      textAlign: 'center',
      display: 'block',
      marginTop: '1rem',
      transition: 'color 0.3s ease'
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.nombre.trim()) {
      setError('Nombre es obligatorio');
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Ingrese un email válido');
      return false;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      const { email, password, nombre} = formData;
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      await sendEmailVerification(userCredential.user, {
        url: window.location.origin + '/verificacion-exitosa', 
        handleCodeInApp: true
      });
      
      await setDoc(doc(db, 'entrenadores', userCredential.user.uid), {
        email,
        nombre,
        edad: 0, 
        activo: true,
        fechaRegistro: new Date(),
        rol: 'entrenador',
        telefono: '',
        direccion: '',
      });

      setSuccess(true);
      navigate('/verifica-tu-email', { state: { fromRegister: true } });
      await onSuccess();

    } catch (err) {
      setError(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const formatAuthError = (error: unknown): string => {
    if (!(error instanceof Error)) return 'Error desconocido durante el registro';
    
    const authError = error as AuthError;
    switch (authError.code) {
      case 'auth/email-already-in-use':
        return 'Este correo ya está registrado';
      case 'auth/invalid-email':
        return 'Correo electrónico no válido';
      case 'auth/weak-password':
        return 'La contraseña debe tener al menos 6 caracteres';
      case 'auth/operation-not-allowed':
        return 'Operación no permitida';
      default:
        return 'Error al registrar. Por favor intente nuevamente.';
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.container}>
      <div style={styles.inputGroup}>
        <label htmlFor="nombre" style={styles.label}>Nombre</label>
        <input
          id="nombre"
          type="text"
          value={formData.nombre}
          onChange={handleChange}
          required
          disabled={loading}
          style={styles.input}
        />
      </div>

      <div style={styles.inputGroup}>
        <label htmlFor="email" style={styles.label}>Email</label>
        <input
          id="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
          disabled={loading}
          style={styles.input}
        />
      </div>

      <div style={styles.inputGroup}>
        <label htmlFor="password" style={styles.label}>Contraseña (mínimo 6 caracteres)</label>
        <input
          id="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          minLength={6}
          required
          disabled={loading}
          style={styles.input}
        />
      </div>

      {error && <p style={styles.error}>{error}</p>}
      {success && (
        <p style={styles.success}>
          ¡Registro exitoso! Por favor verifica tu correo electrónico.
        </p>
      )}

      <button 
        type="submit" 
        disabled={loading}
        style={{
          ...styles.submitButton,
          backgroundColor: loading ? '#A3B18A' : '#A3B18A',
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? 'Registrando...' : 'Crear cuenta'}
      </button>
    </form>
  );
}