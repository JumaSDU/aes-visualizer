import { render, screen } from '@testing-library/react';
import App from './App';

test('renders CryptoLearn welcome', async () => {
  render(<App />);
  expect(await screen.findByText(/CryptoLearn/i)).toBeInTheDocument();
});
