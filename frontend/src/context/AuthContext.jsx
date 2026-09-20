import { createContext, useContext, useEffect, useState } from 'react';
import {
  loginUser,
  registerUser,
  logoutUser,
  fetchCurrentUser,
  refreshSession,
  updateProfile as updateProfileApi,
} from '../services/authApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { user } = await fetchCurrentUser();
        setUser(user);
      } catch {
        try {
          await refreshSession();
          const { user } = await fetchCurrentUser();
          setUser(user);
        } catch {
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (email, password) => {
    const { user } = await loginUser({ email, password });
    setUser(user);
    return user;
  };

  const register = async (payload) => {
    const { user } = await registerUser(payload);
    setUser(user);
    return user;
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
  };

  const updateProfile = async (payload) => {
    const { user } = await updateProfileApi(payload);
    setUser(user);
    return user;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
