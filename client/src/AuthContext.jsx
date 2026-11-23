import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getToken, setToken, signupApi, loginApi, meApi, logoutApi } from './api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // Token irundha mudhalla /me call panni valid-ah nu check pannanum, adhu varaikum loading
  const [loading, setLoading] = useState(() => !!getToken());

  useEffect(() => {
    if (!getToken()) return;
    meApi()
      .then((d) => setUser(d.user))
      .catch(() => setToken(null))
      .finally(() => setLoading(false));
  }, []);

  // If `api.js` detects a 401 response (expired token), it will automatically log the user out.
  useEffect(() => {
    const onExpired = () => {
      setToken(null);
      setUser(null);
    };
    window.addEventListener('auth:expired', onExpired);
    return () => window.removeEventListener('auth:expired', onExpired);
  }, []);

  const signup = async (form) => {
    const d = await signupApi(form);
    setToken(d.token);
    setUser(d.user);
  };

  const login = async (form) => {
    const d = await loginApi(form);
    setToken(d.token);
    setUser(d.user);
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch {
      /* Log out locally even if the server request fails. */
    }
    setToken(null);
    setUser(null);
  };

  const value = useMemo(() => ({ user, loading, signup, login, logout }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
