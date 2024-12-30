'use client'

import { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  GoogleAuthProvider, 
  signInWithPopup,
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail 
} from 'firebase/auth';
import { auth } from '../firebase/config';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const saveUserToDB = async (user) => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firebaseId: user.uid,
          name: user.displayName,
          image: user.photoURL,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save user to database');
      }
    } catch (error) {
      console.error('Error saving user to database:', error);
      // We might want to handle this error differently
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
        });
        saveUserToDB(user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await saveUserToDB(result.user);
      return result.user;
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const signUpWithEmail = async (email, password, name) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, {
        displayName: name
      });
      await saveUserToDB({
        ...userCredential.user,
        displayName: name
      });
      return userCredential.user;
    } catch (error) {
      console.error('Error signing up with email:', error);
      throw error;
    }
  };

  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Error sending reset password email:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      signInWithGoogle, 
      signOut,
      signUpWithEmail,
      resetPassword 
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 