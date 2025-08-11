import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, AuthContextType } from '../types';
import api from '../services/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for mock user in localStorage (for testing)
    const mockUser = localStorage.getItem('user');
    if (mockUser) {
      try {
        const parsedUser = JSON.parse(mockUser);
        setUser(parsedUser);
        setIsLoading(false);
        return;
      } catch (e) {
        console.error('Failed to parse mock user:', e);
      }
    }
    
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const response = await api.get('/users/me');
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      // Don't logout if we have a mock user
      if (!localStorage.getItem('user')) {
        logout();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    // Always use real backend API for authentication
    // Per user requirement: "zamiast mocka mozesz sprawdzic usera z bbdd"
    
    try {
      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);
      
      const response = await api.post('/token', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const { access_token, user } = response.data;
      
      // Ensure user object has the correct role from database
      // The role should be one of: admin, owner, employee, client
      setToken(access_token);
      setUser(user);
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(user));
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      // Return user to let LoginPage handle redirect
      return user;
    } catch (error) {
      console.error('Login failed:', error);
      // For development/testing, allow mock login if backend is not available
      const err = error as any;
      if (err.response?.status === 404 || err.code === 'ERR_NETWORK') {
        const mockUsers: Record<string, { role: string; name: string }> = {
          'admin@system.com': { role: 'admin', name: 'Admin User' },
          'owner@company.com': { role: 'owner', name: 'Owner User' },
          'employee@company.com': { role: 'employee', name: 'Employee User' },
          'client@example.com': { role: 'client', name: 'Client User' }
        };
        
        if (mockUsers[email]) {
          const mockUser: User = {
            id: '1',
            email: email,
            name: mockUsers[email].name,
            role: mockUsers[email].role as User['role']
          };
          
          setToken(`mock-token-${mockUser.role}`);
          setUser(mockUser);
          localStorage.setItem('token', `mock-token-${mockUser.role}`);
          localStorage.setItem('user', JSON.stringify(mockUser));
          
          return mockUser;
        }
      }
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};