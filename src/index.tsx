import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Debug logging
console.log('Plugin UI: Starting to mount React app');

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('Plugin UI: Could not find root element');
  throw new Error("Could not find root element to mount to");
}

console.log('Plugin UI: Root element found, creating React root');

// Hide test loading element
const testEl = document.getElementById('test-loading');
if (testEl) {
  testEl.style.display = 'none';
  console.log('Plugin UI: Hidden test loading element');
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

console.log('Plugin UI: React app mounted');