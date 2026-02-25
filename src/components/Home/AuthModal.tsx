import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LoginForm from '../../features/auth/LoginForm';
import RegisterForm from '../../features/auth/RegisterForm';
import loginBackground from '../../media/fotologin.jpg';
import registerBackground from '../../media/fotoregistro.jpg';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const animationVariants = {
  initial: { opacity: 0, x: -30 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 30 }
};

const MODAL_HEIGHT = '600px';
const MODAL_WIDTH = '900px';

const modalStyles = {
  overlay: {
    position: 'fixed' as const,
    inset: 0,
    zIndex: 100,
    overflowY: 'auto' as const,
    fontFamily: '"ABeeZee", sans-serif'
  },
  background: {
    position: 'fixed' as const,
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    backdropFilter: 'blur(8px)'
  },
  container: {
    display: 'flex',
    minHeight: '100vh',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem'
  },
  content: {
    position: 'relative' as const,
    backgroundColor: 'white',
    borderRadius: '1rem',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
    width: MODAL_WIDTH,
    height: MODAL_HEIGHT,
    display: 'flex',
    overflow: 'hidden'
  },
  formContainer: {
    flex: 1,
    padding: '3rem',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    backgroundColor: '#DAD7CD'
  },
  imageContainer: (isLogin: boolean) => ({
    flex: 1,
    backgroundImage: `url(${isLogin ? loginBackground : registerBackground})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    position: 'relative' as const
  }),
  imageOverlay: {
    position: 'absolute' as const,
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(52, 78, 65, 0.7)',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    alignItems: 'center',
    padding: '2rem',
    color: 'white'
  },
  title: {
    fontSize: '2rem',
    fontWeight: 400,
    marginBottom: '2rem',
    color: '#344E41',
    fontFamily: '"Bebas Neue", sans-serif',
    letterSpacing: '1px',
    textTransform: 'uppercase' as const
  },
  motivationalText: {
    fontSize: '2.5rem',
    fontWeight: 400,
    marginBottom: '1rem',
    textAlign: 'center' as const,
    fontFamily: '"Bebas Neue", sans-serif',
    letterSpacing: '2px',
    textTransform: 'uppercase' as const
  },
  subText: {
    fontSize: '1.1rem',
    opacity: 0.9,
    textAlign: 'center' as const,
    marginTop: '1rem',
    fontFamily: '"ABeeZee", sans-serif',
    maxWidth: '80%',
    lineHeight: '1.6'
  },
  closeButton: {
    position: 'absolute' as const,
    top: '1.5rem',
    right: '1.5rem',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: '#DAD7CD',
    fontSize: '1.5rem',
    zIndex: 10
  },
  switchText: {
    marginTop: '1.5rem',
    textAlign: 'center' as const,
    color: '#588157',
    fontFamily: '"ABeeZee", sans-serif'
  },
  switchLink: {
    color: '#D65A31',
    cursor: 'pointer',
    fontWeight: 500,
    marginLeft: '0.5rem',
    textDecoration: 'underline'
  }
};

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [direction, setDirection] = useState(1);

  const handleSwitch = () => {
    setDirection(isLogin ? 1 : -1);
    setIsLogin(!isLogin);
  };

  if (!isOpen) return null;

  return (
    <div style={modalStyles.overlay}>
      <div style={modalStyles.background} onClick={onClose} />

      <div style={modalStyles.container}>
        <motion.div
          style={modalStyles.content}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
        >
          <button style={modalStyles.closeButton} onClick={onClose} aria-label="Close">
            ✕
          </button>

          <AnimatePresence custom={direction} mode="wait">
            <motion.div
              key={isLogin ? 'login' : 'register'}
              style={modalStyles.formContainer}
              custom={direction}
              variants={animationVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <h2 style={modalStyles.title}>
                {isLogin ? 'Sign In' : 'Create Account'}
              </h2>

              {isLogin ? (
                <LoginForm />
              ) : (
                <RegisterForm onSuccess={onClose} />
              )}

              <p style={modalStyles.switchText}>
                {isLogin ? "Don't have an account?" : 'Already have an account?'}
                <span style={modalStyles.switchLink} onClick={handleSwitch}>
                  {isLogin ? ' Create account' : ' Sign in'}
                </span>
              </p>
            </motion.div>
          </AnimatePresence>

          <div style={modalStyles.imageContainer(isLogin)}>
            <motion.div
              style={modalStyles.imageOverlay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h3 style={modalStyles.motivationalText}>
                {isLogin ? 'Welcome back' : 'Join us today'}
              </h3>
              <p style={modalStyles.subText}>
                {isLogin
                  ? 'We are excited to see you again'
                  : 'Every new member is a new chapter in your fitness journey'}
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
