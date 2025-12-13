import { render, screen, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { useEffect } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock fetch
global.fetch = vi.fn();

const TestComponent = () => {
    const { user, token, login, register, logout } = useAuth();
    return (
        <div>
            <div data-testid="user">{user ? user.username : 'null'}</div>
            <div data-testid="token">{token ? token : 'null_token'}</div>
            <button onClick={() => login('test', 'pass')}>Login</button>
            <button onClick={() => register('test', 'pass')}>Register</button>
            <button onClick={logout}>Logout</button>
        </div>
    );
};

describe('AuthContext', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    it('provides initial null user', () => {
        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );
        expect(screen.getByTestId('user')).toHaveTextContent('null');
    });

    it('login updates user on success', async () => {
        // Construct a valid-looking JWT
        const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
        const payload = btoa(JSON.stringify({ username: 'test', userId: '1' }));
        const signature = 'signature';
        const validToken = `${header}.${payload}.${signature}`;

        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ token: validToken, username: 'test', userId: '1' }),
        });

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        act(() => {
            screen.getByText('Login').click();
        });

        await waitFor(() => {
            expect(screen.getByTestId('user')).toHaveTextContent('test');
            expect(screen.getByTestId('token')).toHaveTextContent(validToken);
        });
        // Double check localStorage too, maybe inside waitFor
        await waitFor(() => expect(localStorage.getItem('token')).toBe(validToken));
    });

    it('logout clears user and token', async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ token: 'fake.jwt.token', username: 'test', userId: '1' }),
        });

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        act(() => {
            screen.getByText('Login').click();
        });

        await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('test'));

        act(() => {
            screen.getByText('Logout').click();
        });

        expect(screen.getByTestId('user')).toHaveTextContent('null');
        expect(localStorage.getItem('token')).toBeNull();
    });
});
