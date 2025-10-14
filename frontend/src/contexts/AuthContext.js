import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import jwtDecode from 'jwt-decode';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = 'http://localhost:8080'; // Spring Boot backend

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('name');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userId');
    localStorage.removeItem('EnrolledCourses')
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  // Setup user from stored token
  const setupUserFromToken = () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        if (decoded.exp > currentTime) {
          setUser(decoded);
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
          logout();
        }
      } catch (err) {
        console.error("Invalid token:", err);
        logout();
      }
    }
  };

  useEffect(() => {
    setupUserFromToken();
    setLoading(false);
  }, []);

  // Login user
  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
      const { token, user } = response.data;

      if (!token) return { success: false, error: 'No token received from server' };

      localStorage.setItem('token', token);
      localStorage.setItem('userId', user.id);
      localStorage.setItem('userEmail', user.email);
      localStorage.setItem('name', user.name);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      const decoded = jwtDecode(token);
      setUser({ ...decoded, ...user });

      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Login failed' };
    }
  };

  // Register user
  const register = async (formData) => {
    try {
      // Convert numeric fields to number
      const payload = {
        name: formData.name, // must match DTO
        email: formData.email,
        password: formData.password,
        secondarySchool: formData.secondarySchool,
        secondarySchoolPassingYear: Number(formData.secondarySchoolPassingYear),
        secondarySchoolPercentage: Number(formData.secondarySchoolPercentage),
        higherSecondarySchool: formData.higherSecondarySchool,
        higherSecondaryPassingYear: Number(formData.higherSecondaryPassingYear),
        higherSecondaryPercentage: Number(formData.higherSecondaryPercentage),
        universityName: formData.universityName,
        Major :formData.Major,
        universityPassingYear: Number(formData.universityPassingYear),
        universityPassingGPA: Number(formData.universityPassingGPA),
      };

      console.log("Register payload:", payload);

      const response = await axios.post(`${API_BASE_URL}/auth/register`, payload, {
        headers: { "Content-Type": "application/json" }
      });

      const { token,user} = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('userId', user.id);
      localStorage.setItem('userEmail', user.email);
      localStorage.setItem('name', user.name);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      setUser(user);
      return { success: true };
    } catch (error) {
      console.error("Registration error:", error.response?.data || error.message);
      return { success: false, error: error.response?.data?.message || "Registration failed" };
    }
  };

  // Update profile
  const updateProfile = async (profileData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/users/profile`, profileData);
      setUser(prev => ({ ...prev, ...response.data }));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Profile update failed' };
    }
  };

  const value = { user, loading, login, register, logout, updateProfile };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
