import api from './api';

// signupRequest.java on backend
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

// signupResponse.java on backend
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

// calls POST /api/auth/signup
export async function registerUser(payload: SignupPayload) {
  const response = await api.post('/api/auth/signup', payload);
  return response.data as SignupResponseRaw;
}

// calls GET /api/auth/check-email?email=xxx
export async function checkEmailAvailable(email: string) {
  const response = await api.get('/api/auth/check-email', {
    params: { email: email },
  });
  return response.data.available as boolean;
}

// calls GET /api/auth/verify?token=xxx
export async function verifyEmail(token: string) {
  const response = await api.get('/api/auth/verify', {
    params: { token: token },
  });
  return response.data;
}

// TODO: setup when backend adds POST /api/auth/login
export async function loginUser(email: string, password: string) {
  // const response = await api.post('/api/auth/login', { email, password });
  // return response.data;
  throw new Error('LOGIN_NOT_IMPLEMENTED');
}
