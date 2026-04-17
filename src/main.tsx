import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Read initial data injected by the server
let initialBooks = [];
const dataElement = document.getElementById('__INITIAL_DATA__');
if (dataElement && dataElement.textContent) {
  try {
    const data = JSON.parse(dataElement.textContent);
    initialBooks = data.books || [];
  } catch (e) {
    console.error('Failed to parse initial data', e);
  }
}

ReactDOM.hydrateRoot(
  document.getElementById('root')!,
  <React.StrictMode>
    <App initialBooks={initialBooks} />
  </React.StrictMode>
);
