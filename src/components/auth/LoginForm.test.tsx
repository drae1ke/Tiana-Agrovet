import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import LoginForm from './LoginForm';

const mocks = vi.hoisted(() => ({
  login: vi.fn(),
  setLanguage: vi.fn(),
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    login: mocks.login,
  }),
}));

vi.mock('@/contexts/LanguageContext', () => ({
  useLanguage: () => ({
    language: 'en',
    setLanguage: mocks.setLanguage,
    t: (key: string) =>
      ({
        agrovetSystem: 'Agrovet Management System',
        username: 'Username',
        password: 'Password',
        login: 'Login',
        loginLoading: 'Signing in...',
        loginError: 'Invalid username or password',
        loginUnavailable: 'Unable to sign in right now. Please check your connection and try again.',
      })[key] ?? key,
  }),
}));

const renderLoginForm = () =>
  render(
    <MemoryRouter>
      <LoginForm />
    </MemoryRouter>
  );

describe('LoginForm', () => {
  beforeEach(() => {
    mocks.login.mockReset();
    mocks.setLanguage.mockReset();
  });

  it('shows loading feedback while signing in and communicates invalid credentials', async () => {
    let finishLogin!: (value: { success: false; reason: 'invalid_credentials' }) => void;
    mocks.login.mockReturnValue(
      new Promise((resolve) => {
        finishLogin = resolve;
      })
    );

    renderLoginForm();

    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'admin' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'wrong-password' } });
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));

    expect(await screen.findByRole('button', { name: 'Signing in...' })).toBeDisabled();
    expect(screen.getByLabelText('Username')).toBeDisabled();
    expect(screen.getByLabelText('Password')).toBeDisabled();
    expect(mocks.login).toHaveBeenCalledWith('admin', 'wrong-password');

    finishLogin({ success: false, reason: 'invalid_credentials' });

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Invalid username or password');
    });
    expect(screen.getByRole('button', { name: 'Login' })).toBeEnabled();
  });
});
