import { useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';
import api from '@/lib/api';

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface GoogleLoginPayload {
  idToken: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
}

export function useAuth() {
  const { user, isAuthenticated, isLoading, setAuth, clearAuth, setLoading } =
    useAuthStore();

  const login = useCallback(
    async (payload: LoginPayload) => {
      setLoading(true);
      try {
        const { data } = await api.post('/auth/login', payload);
        setAuth(data.data.user, data.data.accessToken);
        return data.data;
      } catch (error) {
        clearAuth();
        throw error;
      }
    },
    [setAuth, clearAuth, setLoading],
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      setLoading(true);
      try {
        const { data } = await api.post('/auth/register', payload);
        setAuth(data.data.user, data.data.accessToken);
        return data.data;
      } catch (error) {
        clearAuth();
        throw error;
      }
    },
    [setAuth, clearAuth, setLoading],
  );

  const loginWithGoogle = useCallback(
    async (payload: GoogleLoginPayload) => {
      setLoading(true);
      try {
        const { data } = await api.post('/auth/google', payload);
        setAuth(data.data.user, data.data.accessToken);
        return data.data;
      } catch (error) {
        clearAuth();
        throw error;
      }
    },
    [setAuth, clearAuth, setLoading],
  );

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Best-effort: clear local state even if API call fails
    } finally {
      clearAuth();
    }
  }, [clearAuth]);

  const refreshToken = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/refresh');
      setAuth(data.data.user, data.data.accessToken);
      return data.data;
    } catch {
      clearAuth();
      return null;
    }
  }, [setAuth, clearAuth, setLoading]);

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    loginWithGoogle,
    logout,
    refreshToken,
  };
}
