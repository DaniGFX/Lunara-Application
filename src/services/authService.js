/**
 * Authentication Service for LUNARA
 * Supports Supabase Auth (Sign In, Sign Up, Password Reset, Sign Out)
 * and graceful fallback for Demo accounts when offline/evaluating.
 */

import { supabase } from './supabaseClient';

const AUTH_STORAGE_KEY = 'lunara_user_session';

export const DEMO_USER = {
  id: 'demo-sofia-001',
  email: 'sofia.rodriguez@example.com',
  name: 'Sofia Rodriguez',
  currency: 'PHP',
  isDemo: true,
};

/**
 * Get current cached session or demo user
 */
export function getSavedSession() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading saved session:', err);
  }
  // New users start unauthenticated so they see Login / Sign Up after Splash
  return null;
}

/**
 * Save current session
 */
export function saveSession(user) {
  try {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  } catch (err) {
    console.error('Error saving session:', err);
  }
}

/**
 * Sign In with Email & Password
 */
export async function signIn({ email, password }) {
  if (!email || !password) {
    return { ok: false, message: 'Please enter both email and password.' };
  }

  // Quick check for demo credentials
  if (email.trim().toLowerCase() === 'sofia.rodriguez@example.com' || email.trim().toLowerCase() === 'demo@lunara.app') {
    const user = { ...DEMO_USER, email: email.trim() };
    saveSession(user);
    return { ok: true, user, message: 'Welcome back, Sofia!' };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      // If Supabase credentials are placeholder, offer demo sign-in
      if (error.message.includes('FetchError') || error.message.includes('placeholder')) {
        return { 
          ok: false, 
          message: 'Supabase credentials are not connected yet. You can sign in using the "Continue as Demo User" button below.' 
        };
      }
      return { ok: false, message: error.message };
    }

    const user = {
      id: data.user.id,
      email: data.user.email,
      name: data.user.user_metadata?.full_name || data.user.email.split('@')[0],
      currency: 'PHP',
      isDemo: false,
    };

    saveSession(user);
    return { ok: true, user, message: 'Successfully signed in!' };
  } catch (err) {
    return { ok: false, message: err.message || 'An unexpected error occurred during sign in.' };
  }
}

/**
 * Sign Up with Email, Password, and Full Name
 */
export async function signUp({ email, password, fullName }) {
  if (!email || !password || !fullName) {
    return { ok: false, message: 'Please fill in all registration fields.' };
  }

  if (password.length < 6) {
    return { ok: false, message: 'Password must be at least 6 characters long.' };
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          currency: 'PHP',
        },
      },
    });

    if (error) {
      if (error.message.includes('FetchError') || error.message.includes('placeholder')) {
        return { 
          ok: false, 
          message: 'Supabase backend is in demo mode. You can click "Continue as Demo User" to explore immediately.' 
        };
      }
      return { ok: false, message: error.message };
    }

    const user = {
      id: data.user?.id || 'new-user',
      email: data.user?.email || email.trim(),
      name: fullName.trim(),
      currency: 'PHP',
      isDemo: false,
    };

    saveSession(user);
    return { 
      ok: true, 
      user, 
      message: 'Account created successfully! Welcome to LUNARA.' 
    };
  } catch (err) {
    return { ok: false, message: err.message || 'An unexpected error occurred during registration.' };
  }
}

/**
 * Send Password Reset Email
 */
export async function resetPassword(email) {
  if (!email) {
    return { ok: false, message: 'Please provide your account email address.' };
  }

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: window.location.origin,
    });

    if (error) {
      return { ok: false, message: error.message };
    }

    return { ok: true, message: 'Password reset instructions have been sent to your email.' };
  } catch (err) {
    return { ok: false, message: err.message || 'Failed to send password reset email.' };
  }
}

/**
 * Sign Out
 */
export async function signOut() {
  try {
    await supabase.auth.signOut();
  } catch (err) {
    console.warn('Supabase signOut error:', err);
  } finally {
    saveSession(null);
  }
  return { ok: true };
}

