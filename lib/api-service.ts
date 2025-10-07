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
    console.log('[API Service] Fetching session...');
    const res = await fetch('/api/auth/session');
    
    console.log('[API Service] Session response status:', res.status);
    
    if (!res.ok) {
      console.log('[API Service] Session response not OK');
      return { user: null };
    }
    
    const data = await res.json();
    console.log('[API Service] Session data:', data);
    return data;
  } catch (error) {
    console.error('[API Service] Session error:', error);
    return { user: null };
  }
};