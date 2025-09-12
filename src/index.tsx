import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Mark body as loaded once React has rendered
setTimeout(() => {
  document.body.classList.add('loaded');
}, 50);

// Core Web Vitals monitoring with Plausible integration
reportWebVitals((metric) => {
  // Send to Plausible if available (with error handling)
  try {
    if (window.plausible) {
      window.plausible('Core Web Vital', {
        props: {
          metric_name: metric.name,
          metric_value: Math.round(metric.value)
        }
      });
    }
  } catch (error) {
    // Silently ignore analytics errors - likely blocked by ad blocker
  }
  
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Web Vital:', metric);
  }
});
