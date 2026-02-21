import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { auth, applyActionCode } from '../../firebase';

export default function VerificationHandler() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    const verifyEmail = async () => {
      // Extract the oobCode (verification code) from URL parameters
      const oobCode = searchParams.get('oobCode');
      const continueUrl = searchParams.get('continueUrl');

      // Debug logging (remove in production)
      console.log('URL completa recibida:', window.location.href);
      console.log('oobCode encontrado:', oobCode);
      
      if (!oobCode || oobCode.includes('%OOB_CODE%')) {
        console.error('Código de verificación inválido:', oobCode);
        navigate('/error?cause=invalid-token', { replace: true });
        return;
      }

      try {
        // Apply the verification code to Firebase
        await Promise.race([
          applyActionCode(auth, oobCode),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 8000)
          )
        ]);
        
        // Force refresh user token to update email verification status
        if (auth.currentUser) {
          await auth.currentUser.reload();
        }

        // Handle successful verification
        setVerifying(false);

        // If there's a continueUrl, use it, otherwise go to success page
        if (continueUrl) {
          window.location.href = continueUrl;
        } else {
          navigate('/verify-success', { 
            state: { fromEmailVerification: true },
            replace: true 
          });
        }
      } catch (error) {
        console.error('Error de verificación:', error);
        navigate('/error?cause=verification-failed', {
          state: {
            error: error instanceof Error ? error.message : 'Error desconocido',
            code: oobCode
          },
          replace: true
        });
      }
    };

    verifyEmail();
  }, [navigate, searchParams]);

  return (
    <div style={{ 
      padding: '2rem', 
      textAlign: 'center',
      fontFamily: '"ABeeZee", sans-serif',
      backgroundColor: '#DAD7CD',
      borderRadius: '1rem',
      maxWidth: '500px',
      margin: '4rem auto',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
    }}>
      <h2 style={{ color: '#344E41', fontFamily: '"Bebas Neue", sans-serif' }}>
        {verifying ? 'Verificando su email...' : 'Verificación completada'}
      </h2>
      <p style={{ color: '#3A5A40' }}>
        {verifying 
          ? 'Por favor espere mientras procesamos su verificación.'
          : 'Su email ha sido verificado correctamente.'}
      </p>
    </div>
  );
}