import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { RoutinesProvider } from './context/RoutinesContext';
import { DietsProvider } from './context/DietsContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <RoutinesProvider>
        <DietsProvider>
          <App />
        </DietsProvider>
      </RoutinesProvider>
    </AuthProvider>
  </React.StrictMode>
);
