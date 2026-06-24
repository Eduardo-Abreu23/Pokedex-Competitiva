import React from 'react';
import ReactDOM from 'react-dom/client';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { HelmetProvider } from 'react-helmet-async';
import { queryClient, idbPersister } from './lib/queryClient';
import App from './App';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{ persister: idbPersister, buster: 'v1' }}
      >
        <App />
      </PersistQueryClientProvider>
    </HelmetProvider>
  </React.StrictMode>,
);
