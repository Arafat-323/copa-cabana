import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import Admin from './admin/Admin.jsx';
import './index.css';

const isAdmin = window.location.pathname.startsWith('/admin');
createRoot(document.getElementById('root')).render(isAdmin ? <Admin /> : <App />);
