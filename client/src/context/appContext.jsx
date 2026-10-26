import React, { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const rawBackendUrl = import.meta.env.VITE_BACKEND_URI || 'http://localhost:3000';
  const backendUrl = rawBackendUrl.endsWith('/') ? rawBackendUrl.slice(0, -1) : rawBackendUrl;
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(false);

  // Sync token to localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  // Fetch logged in user profile
  const fetchUserProfile = async (authToken) => {
    try {
      const res = await fetch(`${backendUrl}/api/users/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data);
      } else {
        logout();
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUserProfile(token);
    }
  }, [token]);

  // Auth: Register
  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('isNewUser', 'true');
      localStorage.removeItem('hasSeenTour_dashboard');
      localStorage.removeItem('hasSeenTour_builder');
      return data;
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Auth: Login
  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('hasSeenTour_dashboard', 'true');
      localStorage.setItem('hasSeenTour_builder', 'true');
      localStorage.removeItem('isNewUser');
      return data;
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Auth: Logout
  const logout = () => {
    setToken('');
    setUser(null);
    setResumes([]);
    localStorage.removeItem('token');
    localStorage.removeItem('isNewUser');
    localStorage.removeItem('hasSeenTour_dashboard');
    localStorage.removeItem('hasSeenTour_builder');
  };

  // Resume: Get User Resumes
  const fetchResumes = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/users/resumes`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch resumes');
      setResumes(data.resumes || []);
      return data.resumes;
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Resume: Create Resume
  const createResume = async (title) => {
    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/resumes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create resume');
      
      // Refresh local resumes
      await fetchResumes();
      return data.resume;
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Resume: Delete Resume
  const deleteResume = async (resumeId) => {
    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/resumes/${resumeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete resume');
      
      // Update local state list directly
      setResumes(prev => prev.filter(r => r._id !== resumeId));
      return data;
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Resume: Get Resume By ID
  const getResumeById = async (resumeId) => {
    try {
      const res = await fetch(`${backendUrl}/api/resumes/${resumeId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch resume');
      return data.resume;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  // Resume: Get Public Resume By ID (No Token Required)
  const getPublicResumeById = async (resumeId) => {
    try {
      const res = await fetch(`${backendUrl}/api/resumes/public/${resumeId}`, {
        method: 'GET'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch public resume');
      return data.resume;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  // Resume: Update Resume (multipart/form-data)
  const updateResume = async (resumeId, resumeData, imageFile, removeBackground) => {
    try {
      const formData = new FormData();
      formData.append('resumeId', resumeId);
      formData.append('removeBackground', removeBackground ? 'true' : 'false');

      // Strip File object from JSON payload
      const dataCopy = { ...resumeData };
      if (dataCopy.personal_info && typeof dataCopy.personal_info.image === 'object') {
        delete dataCopy.personal_info.image;
      }
      formData.append('resumeData', JSON.stringify(dataCopy));

      if (imageFile) {
        formData.append('image', imageFile);
      }

      const res = await fetch(`${backendUrl}/api/resumes`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update resume');
      return data.resume;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  // AI: Enhance Professional Summary
  const enhanceProfessionalSummary = async (userContent) => {
    try {
      const res = await fetch(`${backendUrl}/api/ai/enhance-summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userContent })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to enhance summary');
      return data.enhancedContent;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  // AI: Enhance Job Description
  const enhanceJobDescription = async (userContent) => {
    try {
      const res = await fetch(`${backendUrl}/api/ai/enhance-job`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userContent })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to enhance job description');
      return data.enhancedContent;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  // AI: Upload & Parse PDF Resume
  const uploadResume = async (resumeText, title) => {
    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/ai/upload-resume`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ resumeText, title })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to upload and parse resume');
      
      // Refresh local list
      await fetchResumes();
      return data.resumeId;
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // AI: Analyze Resume for ATS Compatibility
  const analyzeResumeATS = async (resumeId) => {
    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/ai/analyze-ats/${resumeId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'ATS Analysis failed');
      
      // Refresh local list so dashboard has the latest atsAnalysis
      await fetchResumes();
      return data.atsAnalysis;
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Payments: Create Stripe Checkout Session
  const createCheckoutSession = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/payments/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create checkout session');
      return data.url; // Returns Stripe checkout URL
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Payments: Verify Stripe Checkout Session (Local dev fallback)
  const verifyCheckoutSession = async (sessionId) => {
    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/payments/verify-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ sessionId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Verification failed');
      
      // Update user subscription state on the frontend
      if (data.success && data.user) {
        setUser(data.user);
      }
      return data;
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Resume: Send resume ready/preview email
  const sendResumePreviewEmail = async (resumeId) => {
    if (!token) return;
    try {
      const res = await fetch(`${backendUrl}/api/resumes/${resumeId}/send-email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send preview email');
      return data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  return (
    <AppContext.Provider value={{
      backendUrl,
      token,
      setToken,
      user,
      setUser,
      resumes,
      setResumes,
      loading,
      register,
      login,
      logout,
      fetchResumes,
      createResume,
      deleteResume,
      getResumeById,
      getPublicResumeById,
      updateResume,
      enhanceProfessionalSummary,
      enhanceJobDescription,
      uploadResume,
      analyzeResumeATS,
      createCheckoutSession,
      verifyCheckoutSession,
      sendResumePreviewEmail
    }}>
      {children}
    </AppContext.Provider>
  );
};
