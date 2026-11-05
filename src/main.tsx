import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { StatusBar, Style } from '@capacitor/status-bar';

if (typeof window !== 'undefined') {
  StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
  StatusBar.setBackgroundColor({ color: '#000000' }).catch(() => {});
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
