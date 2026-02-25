import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './features/pages/HomePage';
import WorkPage from './features/pages/WorkPage';
import ProtectedRoute from './routes/ProtectedRoute';
import EmailVerificationModal from './components/EmailVerification/EmailVerificationModal';
import EmailVerifiedModal from './components/EmailVerification/EmailVerifiedModal';
import VerificationHandler from './components/EmailVerification/VerificationHandler';
import VerificationErrorPage from './components/EmailVerification/VerificationErrorPage';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          
          {/* Email verification routes */}
          <Route path="/verify-handler" element={<VerificationHandler />} />
          <Route path="/verify-pending" element={<EmailVerificationModal />} />
          <Route path="/verify-success" element={<EmailVerifiedModal />} />
          <Route path="/error" element={<VerificationErrorPage />} />
          
          {/* Protected routes */}
          <Route 
            path="/work" 
            element={
              <ProtectedRoute>
                <WorkPage />
              </ProtectedRoute>
            } 
          />
          </Routes>
      </BrowserRouter>
    </div>
  );
}