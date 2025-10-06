// API Service - Provides functions to interact with the backend API

// Login function
export const login = async (email: string, password: string) => {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.error || 'Login failed');
    }
    
    return data;
  } catch (error) {
    console.error('Login API service error:', error);
    throw error;
  }
};

// Logout function
export const logout = async () => {
  try {
    const res = await fetch('/api/auth/logout', {
      method: 'POST',
    });

    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.error || 'Logout failed');
    }
    
    return data;
  } catch (error) {
    console.error('Logout API service error:', error);
    throw error;
  }
};

// Get session function
export const getSession = async () => {
  try {
    const res = await fetch('/api/auth/session');
    
    if (!res.ok) {
      return { user: null };
    }
    
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Session API service error:', error);
    return { user: null };
  }
};