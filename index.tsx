import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { SessionProvider } from './context/SessionProvider';
import { FavoritesProvider } from './context/FavoritesContext';
import { NotificationProvider } from './context/NotificationContext';
import { UserSettingsProvider } from './context/UserSettingsContext';
import './global.css';

/**
 * Entry point for the React application.
 * Finds the root element in the DOM and mounts the main App component,
 * wrapped in the SessionProvider for global state management.
 */
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
try {
  root.render(
    <React.StrictMode>
      <SessionProvider>
        <NotificationProvider>
          <UserSettingsProvider>
            <FavoritesProvider>
              <App />
            </FavoritesProvider>
          </UserSettingsProvider>
        </NotificationProvider>
      </SessionProvider>
    </React.StrictMode>
  );
} catch (error) {
  console.error("Error rendering React app:", error);
}
