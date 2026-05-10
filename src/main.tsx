import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

// StrictMode is intentionally disabled — React Flow v12 triggers false
// "getSnapshot not cached" warnings in strict double-invoke mode.
createRoot(document.getElementById('root')!).render(<App />);
