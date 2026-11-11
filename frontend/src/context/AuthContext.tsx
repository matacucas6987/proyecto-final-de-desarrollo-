import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, UserRole, LoginCredentials } from '../types';
import { authService } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  role: UserRole | null;
  isAdmin: boolean;
  isLibrarian: boolean;
  isProfessor: boolean;
  isStudent: boolean;
  canManageUsers: boolean;
  canManageResources: boolean;
  canManageFines: boolean;
  canManageLoans: boolean;
  canViewStudentLoans: boolean;
  login: (credentials: LoginCredentials) => Promise<User>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('token');
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Cargar y validar perfil al iniciar
  const refreshProfile = useCallback(async () => {
    const currentToken = localStorage.getItem('token');
    if (!currentToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const profile = await authService.getProfile();
      setUser(profile);
      localStorage.setItem('user', JSON.stringify(profile));
    } catch (err) {
      console.warn('Sesión expirada o inválida, cerrando sesión.');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const login = async (credentials: LoginCredentials): Promise<User> => {
    setIsLoading(true);
    try {
      const response = await authService.login(credentials);
      const { accessToken, user: loggedUser } = response;

      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify(loggedUser));

      setToken(accessToken);
      setUser(loggedUser);
      return loggedUser;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
  };

  // Helper flags
  const role = user?.role || null;
  const isAdmin = role === UserRole.ADMIN;
  const isLibrarian = role === UserRole.BIBLIOTECARIO;
  const isProfessor = role === UserRole.PROFESOR;
  const isStudent = role === UserRole.ESTUDIANTE;

  const canManageUsers = isAdmin || isLibrarian;
  const canManageResources = isAdmin || isLibrarian;
  const canManageFines = isAdmin || isLibrarian;
  const canManageLoans = isAdmin || isLibrarian;
  const canViewStudentLoans = isAdmin || isLibrarian || isProfessor;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        role,
        isAdmin,
        isLibrarian,
        isProfessor,
        isStudent,
        canManageUsers,
        canManageResources,
        canManageFines,
        canManageLoans,
        canViewStudentLoans,
        login,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};

export default AuthContext;
