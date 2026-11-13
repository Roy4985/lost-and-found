import { useEffect, useState } from 'react';
import { AuthContext } from './AuthContext.js';
import { apiFetch } from '../api.js';

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  // When the app opens: if a token was saved earlier, ask the backend who it belongs to.
  useEffect(() => {
    async function restoreSession() {
      if (!localStorage.getItem('token')) {
        setChecking(false);
        return;
      }
      try {
        setUser(await apiFetch('/api/auth/me'));
      } catch {
        localStorage.removeItem('token'); // expired or invalid: forget it
      } finally {
        setChecking(false);
      }
    }
    restoreSession();
  }, []);

  async function login(email, password) {
    const data = await apiFetch('/api/auth/login', { method: 'POST', body: { email, password } });
    localStorage.setItem('token', data.token);
    setUser(data.user);
  }

  async function signup(name, email, password) {
    const data = await apiFetch('/api/auth/signup', { method: 'POST', body: { name, email, password } });
    localStorage.setItem('token', data.token);
    setUser(data.user);
  }

  function logout() {
    localStorage.removeItem('token');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, checking, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}