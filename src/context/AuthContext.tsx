// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";

type User = Record<string, any> | null;

type AuthContextShape = {
  user: User;
  token: string | null;
  setUser: (u: User) => void;
  setToken: (t: string | null) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextShape>({
  user: null,
  token: null,
  setUser: () => {},
  setToken: () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUserState] = useState<User>(() => {
    const raw =
      typeof window !== "undefined" ? localStorage.getItem("user") : null;
    return raw ? JSON.parse(raw) : null;
  });
  const [token, setTokenState] = useState<string | null>(() => {
    return typeof window !== "undefined"
      ? localStorage.getItem("authToken")
      : null;
  });

  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  }, [user]);

  useEffect(() => {
    if (token) localStorage.setItem("authToken", token);
    else localStorage.removeItem("authToken");
  }, [token]);

  const setUser = (u: User) => setUserState(u);
  const setToken = (t: string | null) => setTokenState(t);
  const logout = () => {
    setUserState(null);
    setTokenState(null);
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
  };

  return (
    <AuthContext.Provider value={{ user, token, setUser, setToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
