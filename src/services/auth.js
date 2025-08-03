// src/services/auth.js
import { signInWithEmailAndPassword, sendPasswordResetEmail, signOut } from 'firebase/auth';
import { auth } from './firebase';

export const loginUser = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error) {
        throw new Error(error.message);
    }
};

export const resetPassword = async (email) => {
    try {
        await sendPasswordResetEmail(auth, email);
        return true;
    } catch (error) {
        throw new Error(error.message);
    }
};

export const logoutUser = async () => {
    try {
        await signOut(auth);
        return true;
    } catch (error) {
        throw new Error(error.message);
    }
};
