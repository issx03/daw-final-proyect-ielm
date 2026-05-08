import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

// Mock dependencies before importing the module that uses them
vi.mock('../api/userService', () => ({
  userService: {
    getMe: vi.fn(),
    getProfile: vi.fn()
  }
}));

vi.mock('../api/axios', () => {
  const mockApi = {
    post: vi.fn(),
    get: vi.fn(),
    interceptors: {
      request: { use: vi.fn(), eject: vi.fn() },
      response: { use: vi.fn(), eject: vi.fn() }
    }
  };
  return {
    default: mockApi,
    ...mockApi
  };
});

// Now import after mocks are defined
import { AuthProvider, useAuth } from './AuthContext';
import { userService } from '../api/userService';
import api from '../api/axios';

const TestComponent = () => {
  const { user, login, logout, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return (
    <div>
      <div data-testid="user">{user ? user.username : 'no user'}</div>
      <button onClick={() => login('testuser', 'password')}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('provides authentication state', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(await screen.findByTestId('user')).toHaveTextContent('no user');
  });

  it('handles login successfully', async () => {
    const mockUser = { username: 'testuser', email: 'test@example.com' };
    api.post.mockResolvedValueOnce({ data: { access_token: 'fake-token' } });
    userService.getMe.mockResolvedValue(mockUser);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginButton = screen.getByText('Login');
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBe('fake-token');
      expect(screen.getByTestId('user')).toHaveTextContent('testuser');
    });
  });

  it('handles logout', async () => {
    localStorage.setItem('token', 'existing-token');
    userService.getMe.mockResolvedValue({ username: 'existing-user' });
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const logoutButton = await screen.findByText('Logout');
    fireEvent.click(logoutButton);

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBeNull();
      expect(screen.getByTestId('user')).toHaveTextContent('no user');
    });
  });
});
