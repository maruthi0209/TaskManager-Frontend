import { createContext, useState } from 'react';

export const AuthContext = createContext({
  authToken: null,
  setAuthToken: () => {}
});

export function AuthProvider({ children }) {
  const [authToken, setAuthToken] = useState(localStorage.getItem('token'));

  return (
    <AuthContext.Provider value={{ authToken, setAuthToken }}>
      {children}
    </AuthContext.Provider>
  );
}