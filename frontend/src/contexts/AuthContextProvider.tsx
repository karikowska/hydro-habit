import { type ReactNode, useState, useEffect } from "react";
import { AuthContext } from "../hooks/useAuth";
import type { User, AuthContextType } from "../type";
import { generateLoginString } from "../utilities";

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Simulate database storage for users in memory (for frontend demo only)
  // In a real app, this would be an API call to your backend.
  const [users, setUsers] = useState<Record<string, User>>(() => {
    // Try to load users from localStorage on initial load
    try {
      const storedUsers = localStorage.getItem('demoUsers');
      return storedUsers ? JSON.parse(storedUsers) : {};
    } catch (e) {
      console.error("Failed to load users from localStorage", e);
      return {};
    }
  });

  // Persist users to localStorage whenever 'users' state changes
  useEffect(() => {
    localStorage.setItem('demoUsers', JSON.stringify(users));
  }, [users]);


  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    // Check if user is authenticated from session storage (simple persistence)
    return localStorage.getItem('isAuthenticated') === 'true';
  });
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    // Try to load current user from localStorage on initial load
    try {
      const storedUser = localStorage.getItem('currentUser');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (e) {
      console.error("Failed to load current user from localStorage", e);
      return null;
    }
  });

  // Persist auth state to localStorage
  useEffect(() => {
    localStorage.setItem('isAuthenticated', isAuthenticated.toString());
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
  }, [isAuthenticated, currentUser]);

  const login = async (username: string, loginString: string): Promise<{ success: boolean; message: string }> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const user = users[username];
    if (user && user.loginString === loginString) {
      setIsAuthenticated(true);
      setCurrentUser(user);
      return { success: true, message: 'Login successful!' };
    } else {
      return { success: false, message: 'Invalid username or login string.' };
    }
  };

  const register = async (username: string): Promise<{ success: boolean; message: string; loginString?: string }> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    if (users[username]) {
      return { success: false, message: 'Username already taken.' };
    }

    const newLoginString = generateLoginString();
    const newUser: User = {
      username,
      loginString: newLoginString,
      createdAt: new Date(),
    };

    setUsers(prevUsers => ({
      ...prevUsers,
      [username]: newUser,
    }));

    return { success: true, message: 'Registration successful!', loginString: newLoginString };
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  const contextValue: AuthContextType = {
    isAuthenticated,
    currentUser,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};