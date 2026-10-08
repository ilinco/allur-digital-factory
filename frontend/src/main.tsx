import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RootProvider } from './components/providers/RootProvider.tsx';
import '@/assets/styles/main.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootProvider />
  </StrictMode>,
);
