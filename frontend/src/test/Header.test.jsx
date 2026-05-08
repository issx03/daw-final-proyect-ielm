import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Header from '../components/layout/Header';

// Use hoisted functions to properly mock the auth module
const mockLogout = vi.fn();

vi.mock('../hooks/useAuth', () => {
  return {
    useAuth: vi.fn()
  };
});

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn()
  };
});

// Import the mocked module to configure it
import { useAuth } from '../hooks/useAuth';

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Header Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock: unauthenticated user
    useAuth.mockReturnValue({ user: null, logout: mockLogout });
  });

  describe('Rendering', () => {
    it('renders the Header component without crashing', () => {
      renderWithRouter(<Header />);
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });

    it('renders the logo with correct text', () => {
      renderWithRouter(<Header />);
      expect(screen.getByText(/TRELLIX/i)).toBeInTheDocument();
      expect(screen.getByText(/\./)).toBeInTheDocument();
    });

    it('renders Sign In and Get Started buttons when user is not authenticated', () => {
      renderWithRouter(<Header />);
      expect(screen.getByText(/Sign In/i)).toBeInTheDocument();
      expect(screen.getByText(/GET STARTED/i)).toBeInTheDocument();
    });

    it('does not render Boards navigation when user is not authenticated', () => {
      renderWithRouter(<Header />);
      expect(screen.queryByText(/Boards/i)).not.toBeInTheDocument();
    });
  });

  describe('User Authentication States', () => {
    it('renders user email and Sign Out button when user is authenticated', () => {
      const authenticatedUser = { id: '1', email: 'test@example.com', role: 'user' };
      useAuth.mockReturnValue({ user: authenticatedUser, logout: mockLogout });

      renderWithRouter(<Header />);
      
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
      expect(screen.getByText(/Sign Out/i)).toBeInTheDocument();
    });

    it('renders Boards navigation when user is authenticated', () => {
      const authenticatedUser = { id: '1', email: 'test@example.com', role: 'user' };
      useAuth.mockReturnValue({ user: authenticatedUser, logout: mockLogout });

      renderWithRouter(<Header />);
      
      expect(screen.getByText(/Boards/i)).toBeInTheDocument();
    });

    it('hides Sign In and Get Started buttons when user is authenticated', () => {
      const authenticatedUser = { id: '1', email: 'test@example.com', role: 'user' };
      useAuth.mockReturnValue({ user: authenticatedUser, logout: mockLogout });

      renderWithRouter(<Header />);
      
      expect(screen.queryByText(/Sign In/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/GET STARTED/i)).not.toBeInTheDocument();
    });
  });

  describe('Navigation Links', () => {
    it('renders link to home page', () => {
      renderWithRouter(<Header />);
      const logoLink = screen.getByRole('link', { name: /TRELLIX/i });
      expect(logoLink).toHaveAttribute('href', '/');
    });

    it('renders Sign In link', () => {
      renderWithRouter(<Header />);
      const signInLink = screen.getByRole('link', { name: /Sign In/i });
      expect(signInLink).toHaveAttribute('href', '/login');
    });

    it('renders Register link', () => {
      renderWithRouter(<Header />);
      const registerLink = screen.getByRole('link', { name: /GET STARTED/i });
      expect(registerLink).toHaveAttribute('href', '/register');
    });

    it('renders Boards link when authenticated', () => {
      const authenticatedUser = { id: '1', email: 'test@example.com', role: 'user' };
      useAuth.mockReturnValue({ user: authenticatedUser, logout: mockLogout });

      renderWithRouter(<Header />);
      const boardsLink = screen.getByRole('link', { name: /Boards/i });
      expect(boardsLink).toHaveAttribute('href', '/');
    });
  });

  describe('User Interactions', () => {
    it('logout button is clickable', () => {
      const authenticatedUser = { id: '1', email: 'test@example.com', role: 'user' };
      useAuth.mockReturnValue({ user: authenticatedUser, logout: mockLogout });

      renderWithRouter(<Header />);
      
      const logoutButton = screen.getByRole('button', { name: /Sign Out/i });
      fireEvent.click(logoutButton);
      
      expect(mockLogout).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('has proper semantic header element', () => {
      renderWithRouter(<Header />);
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });

    it('has navigation element when user is authenticated', () => {
      const authenticatedUser = { id: '1', email: 'test@example.com', role: 'user' };
      useAuth.mockReturnValue({ user: authenticatedUser, logout: mockLogout });

      renderWithRouter(<Header />);
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('logout button is a button element', () => {
      const authenticatedUser = { id: '1', email: 'test@example.com', role: 'user' };
      useAuth.mockReturnValue({ user: authenticatedUser, logout: mockLogout });

      renderWithRouter(<Header />);
      const logoutButton = screen.getByRole('button', { name: /Sign Out/i });
      // Button element defaults to type="submit" in forms
      expect(logoutButton.tagName).toBe('BUTTON');
    });
  });
});
