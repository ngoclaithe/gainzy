import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../lib/apiClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        const me = await api.auth.me();
        if (mounted) setUser(me ?? null);
      } catch {
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    init();
    return () => { mounted = false; };
  }, []);

  const login = async (email, password) => {
    await api.auth.login({ email, password });
    const me = await api.auth.me();
    setUser(me ?? null);
    return me ?? null;
  };

  const register = async (payload) => {
    await api.auth.register(payload);
  };

  const logout = async () => {
    await api.auth.logout();
    setUser(null);
  };

  const value = useMemo(() => ({ user, loading, login, register, logout, setUser }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() { return useContext(AuthContext); }
