import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navbar from './Navbar';
import { useAuth } from '../../context/AuthContext';

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn()
}));

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Navbar Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the brand name', () => {
    useAuth.mockReturnValue({ token: null, logout: vi.fn(), user: null });
    renderWithRouter(<Navbar />);
    expect(screen.getByText(/Trellix/i)).toBeInTheDocument();
  });

  it('renders login link when unauthenticated', () => {
    useAuth.mockReturnValue({ token: null, logout: vi.fn(), user: null });
    renderWithRouter(<Navbar />);
    expect(screen.getByText(/Log in/i)).toBeInTheDocument();
  });

  it('renders user info when authenticated on protected page', () => {
    useAuth.mockReturnValue({ 
      token: 'fake-token', 
      logout: vi.fn(), 
      user: { username: 'testuser' } 
    });

    renderWithRouter(<Navbar />);
    
    expect(screen.getByText('testuser')).toBeInTheDocument();
  });
});
