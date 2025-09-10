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

// Core Web Vitals monitoring with Plausible integration
reportWebVitals((metric) => {
  // Send to Plausible if available
  if (window.plausible) {
    window.plausible('Core Web Vital', {
      props: {
        metric_name: metric.name,
        metric_value: Math.round(metric.value)
      }
    });
  }
  
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Web Vital:', metric);
  }
});
