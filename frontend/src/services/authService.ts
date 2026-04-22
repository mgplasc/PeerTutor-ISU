import api from './api';

// Signup types
export type SignupPayload = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  profileType: string;
  major: string;
  expectedGraduation: number;
  hourlyRate: number;
  coursesOffered: string[];
  availableForOnline: boolean;
  availableForInPerson: boolean;
};

export type SignupResponseRaw = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  emailVerified: boolean;
  hasStudentProfile: boolean;
  hasTutorProfile: boolean;
  message: string;
};

// Login types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  id: string;
  email: string;
  emailVerified: boolean;
  hasStudentProfile: boolean;
  hasTutorProfile: boolean;
  studentProfile?: any;
  tutorProfile?: any;
}

// Email verification types
export interface VerifyEmailResponse {
  success: boolean;
  message: string;
  email?: string;
}

export interface DeleteAccountRequest{
  deleteType: "STUDENT" | "TUTOR" | "BOTH";
}

// ============== API Functions ==============

/**
 * Register a new user (student or tutor)
 * POST /api/auth/signup
 */
export async function registerUser(payload: SignupPayload): Promise<SignupResponseRaw> {
  try {
    const response = await api.post('/auth/signup', payload);  // Removed /api since baseURL has it
    return response.data as SignupResponseRaw;
  } catch (error) {
    console.error('Registration failed:', error);
    throw error;
  }
}

/**
 * Check if email is already registered
 * GET /api/auth/check-email?email=xxx
 */
export async function checkEmailAvailable(email: string): Promise<boolean> {
  try {
    const response = await api.get('/auth/check-email', {
      params: { email },
    });
    return response.data.available as boolean;
  } catch (error) {
    console.error('Email check failed:', error);
    return false; // Assume email is not available if check fails
  }
}

/**
 * Verify user email with token
 * GET /api/auth/verify?token=xxx
 */
export async function verifyEmail(token: string): Promise<VerifyEmailResponse> {
  try {
    const response = await api.get('/auth/verify', {
      params: { token },
    });
    return response.data;
  } catch (error) {
    console.error('Email verification failed:', error);
    throw error;
  }
}

/**
 * Login user
 * POST /api/auth/login
 */
export async function loginUser(email: string, password: string): Promise<LoginResponse> {
  try {
    const response = await api.post('/auth/login', {
      email,
      password
    });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Login failed');
    }
    throw new Error('Network error. Please try again.');
  }
}
/**
 * Send password reset email
 * POST /auth/forgot-password
 */
export async function forgotPassword(email: string): Promise<void> {
  try {
    await api.post('/auth/forgot-password', { email });
  } catch (error) {
    console.error('Forgot password request failed:', error);
    throw error;
  }
}

/**
 * Reset password using token from email link
 * POST /auth/reset-password
 */
export async function resetPassword(token: string, newPassword: string): Promise<void> {
  try {
    await api.post('/auth/reset-password', { token, newPassword });
  } catch (error) {
    console.error('Password reset failed:', error);
    throw error;
  }
}

/**
 * Delete user account
 * @param deleteType 
 * @returns 
 */
export async function deleteAccount(deleteType: string): Promise<any> {
  const response = await api.delete('/auth/delete-account', {
    data: { deleteType }
  });
  return response.data;
}
