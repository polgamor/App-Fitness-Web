import { useState, FormEvent, ChangeEvent, CSSProperties } from 'react';
import { auth, db } from '../../config/firebase.config';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, sendEmailVerification, AuthError } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

interface RegisterFormProps {
  onSuccess: () => void | Promise<void>;
}

interface FormData {
  email: string;
  password: string;
  firstName: string;
}

const FORM_STYLES: {
  container: CSSProperties;
  inputGroup: CSSProperties;
  label: CSSProperties;
  input: CSSProperties;
  error: CSSProperties;
  success: CSSProperties;
  submitButton: CSSProperties;
} = {
  container: { width: '100%' },
  inputGroup: {
    marginBottom: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  label: { fontSize: '0.875rem', color: '#3A5A40', fontWeight: 500 },
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
    backgroundColor: '#A3B18A',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    fontWeight: 500,
    fontSize: '1rem',
    marginTop: '0.5rem',
    transition: 'background-color 0.3s ease',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)'
  }
};

export default function RegisterForm({ onSuccess }: RegisterFormProps) {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    firstName: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.firstName.trim()) {
      setError('First name is required');
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }

    return true;
  };

  const formatAuthError = (err: unknown): string => {
    if (!(err instanceof Error)) return 'Unknown registration error';

    const authError = err as AuthError;
    switch (authError.code) {
      case 'auth/email-already-in-use':
        return 'This email is already registered';
      case 'auth/invalid-email':
        return 'Invalid email address';
      case 'auth/weak-password':
        return 'Password must be at least 6 characters';
      case 'auth/operation-not-allowed':
        return 'Operation not allowed';
      default:
        return 'Registration failed. Please try again.';
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!validateForm()) return;

    setLoading(true);

    try {
      const { email, password, firstName } = formData;
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      await sendEmailVerification(userCredential.user, {
        url: window.location.origin + '/verify-success',
        handleCodeInApp: true
      });

      await setDoc(doc(db, 'entrenadores', userCredential.user.uid), {
        email,
        nombre: firstName,
        edad: 0,
        activo: true,
        fechaRegistro: new Date(),
        rol: 'entrenador',
        telefono: '',
        direccion: ''
      });

      setSuccess(true);
      navigate('/verify-pending', { state: { fromRegister: true } });
      await onSuccess();
    } catch (err) {
      setError(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={FORM_STYLES.container}>
      <div style={FORM_STYLES.inputGroup}>
        <label htmlFor="firstName" style={FORM_STYLES.label}>First Name</label>
        <input
          id="firstName"
          type="text"
          value={formData.firstName}
          onChange={handleChange}
          required
          disabled={loading}
          style={FORM_STYLES.input}
        />
      </div>

      <div style={FORM_STYLES.inputGroup}>
        <label htmlFor="email" style={FORM_STYLES.label}>Email</label>
        <input
          id="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
          disabled={loading}
          style={FORM_STYLES.input}
        />
      </div>

      <div style={FORM_STYLES.inputGroup}>
        <label htmlFor="password" style={FORM_STYLES.label}>Password (minimum 6 characters)</label>
        <input
          id="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          minLength={6}
          required
          disabled={loading}
          style={FORM_STYLES.input}
        />
      </div>

      {error && <p style={FORM_STYLES.error}>{error}</p>}
      {success && (
        <p style={FORM_STYLES.success}>
          Registration successful! Please check your email to verify your account.
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        style={{ ...FORM_STYLES.submitButton, cursor: loading ? 'not-allowed' : 'pointer' }}
      >
        {loading ? 'Creating account...' : 'Create Account'}
      </button>
    </form>
  );
}
