// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get the ID token
          const token = await firebaseUser.getIdToken();
          
          // Store token in localStorage
          localStorage.setItem('authToken', token);
          
          // Verify token with backend
          await apiService.post('/auth/verify', { token });
          
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            emailVerified: firebaseUser.emailVerified
          });
        } catch (error) {
          console.error('Auth verification error:', error);
          toast.error('Authentication failed');
          setUser(null);
          localStorage.removeItem('authToken');
        }
      } else {
        setUser(null);
        localStorage.removeItem('authToken');
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signup = async (email, password, displayName) => {
    setIsAuthenticating(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      if (displayName) {
        await updateProfile(result.user, { displayName });
      }

      // Get the ID token
      const token = await result.user.getIdToken();
      
      // Send signup data to backend
      await apiService.post('/auth/signup', { 
        token,
        userData: { displayName, email }
      });
      
      toast.success('Account created successfully!');
      return result;
    } catch (error) {
      console.error('Signup error:', error);
      toast.error(getErrorMessage(error));
      throw error;
    } finally {
      setIsAuthenticating(false);
    }
  };

  const login = async (email, password) => {
    setIsAuthenticating(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      toast.success('Logged in successfully!');
      return result;
    } catch (error) {
      console.error('Login error:', error);
      toast.error(getErrorMessage(error));
      throw error;
    } finally {
      setIsAuthenticating(false);
    }
  };

  const loginWithGoogle = async () => {
    setIsAuthenticating(true);
    try {
      // Configure Google provider for popup
      googleProvider.setCustomParameters({
        prompt: 'select_account'
      });

      const result = await signInWithPopup(auth, googleProvider);
      
      // Get the ID token
      const token = await result.user.getIdToken();
      
      // Verify token with backend
      await apiService.post('/auth/verify', { token });
      
      toast.success('Logged in with Google successfully!');
      return result;
    } catch (error) {
      console.error('Google login error:', error);
      
      if (error.code === 'auth/popup-closed-by-user') {
        toast.error('Login cancelled. Please try again.');
      } else if (error.code === 'auth/popup-blocked') {
        toast.error('Popup blocked. Please allow popups and try again.');
      } else if (error.code === 'auth/unauthorized-domain') {
        toast.error('This domain is not authorized for Google sign-in. Please contact support.');
      } else {
        toast.error(getErrorMessage(error));
      }
      
      throw error;
    } finally {
      setIsAuthenticating(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      toast.success('Logged out successfully!');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
      throw error;
    }
  };

  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent!');
    } catch (error) {
      console.error('Password reset error:', error);
      toast.error(getErrorMessage(error));
      throw error;
    }
  };

  const getErrorMessage = (error) => {
    switch (error.code) {
      case 'auth/user-not-found':
        return 'No account found with this email address.';
      case 'auth/wrong-password':
        return 'Incorrect password.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters.';
      case 'auth/invalid-email':
        return 'Invalid email address.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/popup-closed-by-user':
        return 'Sign-in popup was closed.';
      case 'auth/popup-blocked':
        return 'Popup blocked by browser. Please allow popups and try again.';
      case 'auth/cancelled-popup-request':
        return 'Sign-in was cancelled.';
      case 'auth/account-exists-with-different-credential':
        return 'An account already exists with this email using a different sign-in method.';
      case 'auth/invalid-credential':
        return 'Invalid credentials. Please check your email and password.';
      case 'auth/user-disabled':
        return 'This account has been disabled.';
      case 'auth/operation-not-allowed':
        return 'This sign-in method is not allowed.';
      default:
        console.error('Auth error:', error);
        return error.message || 'An error occurred. Please try again.';
    }
  };

  const value = {
    user,
    loading,
    isAuthenticating,
    signup,
    login,
    loginWithGoogle,
    logout,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
