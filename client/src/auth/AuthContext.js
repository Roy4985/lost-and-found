import { createContext, useContext } from 'react';

// The shared "box" that holds who is logged in.
export const AuthContext = createContext(null);

// Any component calls useAuth() to read what's in the box.
export function useAuth() {
  return useContext(AuthContext);
}