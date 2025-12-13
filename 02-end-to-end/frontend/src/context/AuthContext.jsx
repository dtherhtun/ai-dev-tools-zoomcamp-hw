import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            // Decode token or validate? For now, just assume logged in if token exists
            // In a real app, we'd fetch user profile or check expiry
            // Let's at least decode to get username if it was in payload (it is)
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setUser({ username: payload.username, id: payload.userId });
            } catch (e) {
                logout();
            }
        }
        setLoading(false);
    }, [token]);

    const login = async (username, password) => {
        try {
            const response = await fetch('http://localhost:8080/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                throw new Error('Login failed');
            }

            const data = await response.json();
            setToken(data.token);
            localStorage.setItem('token', data.token);
            setUser({ username: data.username, id: data.userId });
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    };

    const register = async (username, password) => {
        try {
            const response = await fetch('http://localhost:8080/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                throw new Error('Registration failed');
            }

            const data = await response.json();
            setToken(data.token);
            localStorage.setItem('token', data.token);
            setUser({ username: data.username, id: data.userId });
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
    };

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
