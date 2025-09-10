import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders app without crashing', () => {
  render(<App />);
  const titleElement = screen.getByText(/Premier League TV Schedule UK/i);
  expect(titleElement).toBeInTheDocument();
});
