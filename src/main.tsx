import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Read initial data injected by the server
let initialBooks = [];
let initialVisits = 0;
const dataElement = document.getElementById('__INITIAL_DATA__');
if (dataElement && dataElement.textContent) {
  try {
    const data = JSON.parse(dataElement.textContent);
    initialBooks = data.books || [];
    initialVisits = data.visits || 0;
  } catch (e) {
    console.error('Failed to parse initial data', e);
  }
}

ReactDOM.hydrateRoot(
  document.getElementById('root')!,
  <React.StrictMode>
    <App initialBooks={initialBooks} initialVisits={initialVisits} initialPath={window.location.pathname} />
  </React.StrictMode>
);
