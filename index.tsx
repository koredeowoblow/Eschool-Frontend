
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { NotificationProvider } from './context/NotificationContext';

// Disable console logs in production for security and performance
if (window.location.hostname !== 'localhost') {
  console.log = () => {};
  console.debug = () => {};
  console.info = () => {};
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    {/* Fix: ErrorBoundary now correctly identifies nested children as props after definition fix */}
    <ErrorBoundary>
      <NotificationProvider>
        <App />
      </NotificationProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
