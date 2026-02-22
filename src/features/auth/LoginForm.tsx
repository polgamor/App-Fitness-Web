import { useState, useEffect, FormEvent, ChangeEvent, CSSProperties } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { auth, signOut } from '../../firebase';
import { AuthError } from 'firebase/auth';

interface LoginFormProps {
  onClose?: () => void;
}

export default function LoginForm({}: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showVerifiedModal, setShowVerifiedModal] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Mostrar modal solo si se vino con estado correcto
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const verifiedSuccess = params.get('verified') === 'success';
    const cameFromEmail = location.state?.fromEmailVerification;

    if (verifiedSuccess && cameFromEmail) {
      setShowVerifiedModal(true);
    } else if (verifiedSuccess && !cameFromEmail) {
      navigate('/login', { replace: true }); // evitar acceso manual
    }
  }, [location, navigate]);

  const handleCloseModal = () => {
    setShowVerifiedModal(false);
    navigate('/login', { replace: true });
  };

  const styles: {
    container: CSSProperties;
    inputGroup: CSSProperties;
    label: CSSProperties;
    input: CSSProperties;
    error: CSSProperties;
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      await login(email, password);
      const { currentUser } = auth;

      if (currentUser && !currentUser.emailVerified) {
        setError('Please verify your email before signing in');
        await signOut(auth);
        return;
      }

      setPassword('');
      navigate('/work');
    } catch (err) {
      setError(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const formatAuthError = (error: unknown): string => {
    if (!(error instanceof Error)) return 'Unknown error signing in';

    const authError = error as AuthError;
    switch (authError.code) {
      case 'auth/user-not-found':
        return 'User not registered';
      case 'auth/wrong-password':
        return 'Incorrect password';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/invalid-email':
        return 'Invalid email address';
      case 'auth/unverified-email':
        return 'Email not verified';
      case 'auth/role-not-allowed':
        return 'You do not have permission to access this platform';
      default:
        return 'Error signing in. Please try again.';
    }
  };

  return (
    <>
      {showVerifiedModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(52, 78, 65, 0.9)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(6px)',
        }}>
          <div style={{
            backgroundColor: '#DAD7CD',
            padding: '2rem',
            borderRadius: '1rem',
            width: '90%',
            maxWidth: '500px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
            textAlign: 'center',
          }}>
            <h2 style={{
              fontSize: '1.75rem',
              fontWeight: 600,
              color: '#344E41',
              fontFamily: '"Bebas Neue", sans-serif',
              marginBottom: '1rem',
              textTransform: 'uppercase',
            }}>
              Email Verified!
            </h2>
            <p style={{
              fontSize: '1rem',
              color: '#3A5A40',
              fontFamily: '"ABeeZee", sans-serif',
              marginBottom: '1.5rem',
            }}>
              Your email address has been successfully verified. You can now sign in.
            </p>
            <button onClick={handleCloseModal} style={{
              backgroundColor: '#3A5A40',
              color: '#DAD7CD',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontFamily: '"ABeeZee", sans-serif',
              fontSize: '1rem',
              fontWeight: 500,
            }}>
              Accept
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} style={styles.container}>
        <div style={styles.inputGroup}>
          <label htmlFor="email" style={styles.label}>Email</label>
          <input
            id="email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            required
            disabled={loading}
            style={styles.input}
          />
        </div>

        <div style={styles.inputGroup}>
          <label htmlFor="password" style={styles.label}>Password</label>
          <input
            id="password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            required
            disabled={loading}
            style={styles.input}
          />
        </div>

        {error && <p style={styles.error}>{error}</p>}

        <button
          type="submit"
          disabled={loading}
          style={{
            ...styles.submitButton,
            backgroundColor: loading ? '#A3B18A' : '#A3B18A',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </>
  );
}