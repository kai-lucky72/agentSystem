import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import SimpleApp from './SimpleApp';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <SimpleApp />
  </React.StrictMode>
);
