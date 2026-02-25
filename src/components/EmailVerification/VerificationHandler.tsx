import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { auth, applyActionCode } from '../../config/firebase.config';

export default function VerificationHandler() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    const verifyEmail = async () => {
      const oobCode = searchParams.get('oobCode');
      const continueUrl = searchParams.get('continueUrl');

      if (!oobCode || oobCode.includes('%OOB_CODE%')) {
        navigate('/error?cause=invalid-token', { replace: true });
        return;
      }

      try {
        await Promise.race([
          applyActionCode(auth, oobCode),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout')), 8000)
          )
        ]);

        if (auth.currentUser) {
          await auth.currentUser.reload();
        }

        setVerifying(false);

        if (continueUrl) {
          window.location.href = continueUrl;
        } else {
          navigate('/verify-success', {
            state: { fromEmailVerification: true },
            replace: true
          });
        }
      } catch (error) {
        navigate('/error?cause=verification-failed', {
          state: {
            error: error instanceof Error ? error.message : 'Unknown error',
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
        {verifying ? 'Verifying your email...' : 'Verification complete'}
      </h2>
      <p style={{ color: '#3A5A40' }}>
        {verifying
          ? 'Please wait while we process your verification.'
          : 'Your email has been verified successfully.'}
      </p>
    </div>
  );
}
