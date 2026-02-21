import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { RutinasProvider } from './context/RutinasContext'; 
import { DietasProvider } from './context/DietasContext'; 
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
     <RutinasProvider>
       <DietasProvider>
          <App />
       </DietasProvider>
     </RutinasProvider>
    </AuthProvider>
  </React.StrictMode>
);