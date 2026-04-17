import React from 'react';
import { renderToString } from 'react-dom/server';
import App from './App';

export async function render(url: string, initialData?: any) {
  const html = renderToString(
    <React.StrictMode>
      <App initialBooks={initialData?.books} />
    </React.StrictMode>
  );
  return { html };
}
