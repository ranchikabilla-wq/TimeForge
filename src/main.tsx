import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { initTheme } from './stores/themeStore';

initTheme();

document.addEventListener('mousemove', (e) => {
  const btns = document.querySelectorAll('.btn-bubble, .btn-secondary-bubble');
  btns.forEach((btn) => {
    const rect = (btn as HTMLElement).getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    (btn as HTMLElement).style.setProperty('--x', `${x}%`);
    (btn as HTMLElement).style.setProperty('--y', `${y}%`);
  });
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
