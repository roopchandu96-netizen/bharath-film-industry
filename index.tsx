
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <div className="grid-floor"></div>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
