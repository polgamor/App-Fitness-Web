import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState, ReactElement } from 'react';
import EmailVerificationNotice from '../components/EmailVerification/EmailVerificationNotice';

export default function PrivateRoute(): ReactElement {
  const { user, isEmailVerified, loading, checkEmailVerification  } = useAuth();
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const verify = async () => {
      if (user) {
        const verified = await checkEmailVerification();
        setIsVerified(verified);
      }
    };
    verify();
  }, [user]);

  if (!user) return <Navigate to="/login" />;
  if (!isVerified) return <EmailVerificationNotice />;

  if (loading) {
    return <div>Cargando...</div>; 
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isEmailVerified) {
    return <EmailVerificationNotice />;
  }

  return <Outlet />;
}