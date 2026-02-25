import { useState, useEffect, FormEvent, ChangeEvent, CSSProperties } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { auth, signOut } from '../../config/firebase.config';
import { AuthError } from 'firebase/auth';

const FORM_STYLES: {
  container: CSSProperties;
  inputGroup: CSSProperties;
  label: CSSProperties;
  input: CSSProperties;
  error: CSSProperties;
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

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showVerifiedModal, setShowVerifiedModal] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const verifiedSuccess = params.get('verified') === 'success';
    const cameFromEmail = location.state?.fromEmailVerification;

    if (verifiedSuccess && cameFromEmail) {
      setShowVerifiedModal(true);
    } else if (verifiedSuccess && !cameFromEmail) {
      navigate('/login', { replace: true });
    }
  }, [location, navigate]);

  const handleCloseModal = () => {
    setShowVerifiedModal(false);
    navigate('/login', { replace: true });
  };

  const formatAuthError = (err: unknown): string => {
    if (!(err instanceof Error)) return 'Unknown sign-in error';

    const authError = err as AuthError;
    switch (authError.code) {
      case 'auth/user-not-found':
        return 'No account found with this email';
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
        return 'Sign-in failed. Please try again.';
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
        setError('Please verify your email address before signing in');
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
          backdropFilter: 'blur(6px)'
        }}>
          <div style={{
            backgroundColor: '#DAD7CD',
            padding: '2rem',
            borderRadius: '1rem',
            width: '90%',
            maxWidth: '500px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
            textAlign: 'center'
          }}>
            <h2 style={{
              fontSize: '1.75rem',
              fontWeight: 600,
              color: '#344E41',
              fontFamily: '"Bebas Neue", sans-serif',
              marginBottom: '1rem',
              textTransform: 'uppercase'
            }}>
              Email Verified!
            </h2>
            <p style={{
              fontSize: '1rem',
              color: '#3A5A40',
              fontFamily: '"ABeeZee", sans-serif',
              marginBottom: '1.5rem'
            }}>
              Your email address has been verified. You can now sign in.
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
              fontWeight: 500
            }}>
              Continue
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} style={FORM_STYLES.container}>
        <div style={FORM_STYLES.inputGroup}>
          <label htmlFor="email" style={FORM_STYLES.label}>Email</label>
          <input
            id="email"
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            required
            disabled={loading}
            style={FORM_STYLES.input}
          />
        </div>

        <div style={FORM_STYLES.inputGroup}>
          <label htmlFor="password" style={FORM_STYLES.label}>Password</label>
          <input
            id="password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            required
            disabled={loading}
            style={FORM_STYLES.input}
          />
        </div>

        {error && <p style={FORM_STYLES.error}>{error}</p>}

        <button
          type="submit"
          disabled={loading}
          style={{ ...FORM_STYLES.submitButton, cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </>
  );
}
