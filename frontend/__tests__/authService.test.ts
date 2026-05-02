// __tests__/authService.test.ts
// Unit tests for authentication service functions
// run: npx jest __tests__/authService.test.ts

import api from '../src/services/api';
import {
  loginUser,
  registerUser,
  checkEmailAvailable,
  forgotPassword,
} from '../src/services/authService';

// Cast api to jest mock so we can configure return values
const mockApi = api as jest.Mocked<typeof api>;

describe('authService', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── loginUser ───

  describe('loginUser', () => {
    it('returns login response on success', async () => {
      const mockResponse = {
        data: {
          token: 'jwt-token-abc',
          id: 'user-uuid-123',
          email: 'test@ilstu.edu',
          emailVerified: true,
          hasStudentProfile: true,
          hasTutorProfile: false,
          studentProfile: { firstName: 'Jane', lastName: 'Doe' },
          tutorProfile: null,
        },
      };
      mockApi.post.mockResolvedValueOnce(mockResponse);

      const result = await loginUser('test@ilstu.edu', 'password123');

      expect(mockApi.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@ilstu.edu',
        password: 'password123',
      });
      expect(result.token).toBe('jwt-token-abc');
      expect(result.email).toBe('test@ilstu.edu');
    });

    it('throws error on invalid credentials (401)', async () => {
      mockApi.post.mockRejectedValueOnce({
        response: { status: 401, data: { message: 'Invalid credentials' } },
      });

      await expect(loginUser('bad@ilstu.edu', 'wrongpass')).rejects.toBeTruthy();
    });

    it('throws error on unverified email', async () => {
      mockApi.post.mockRejectedValueOnce({
        response: { status: 403, data: { message: 'Email not verified' } },
      });

      await expect(loginUser('unverified@ilstu.edu', 'pass123')).rejects.toBeTruthy();
    });
  });

  // ─── registerUser ───

  describe('registerUser', () => {
    it('registers a student successfully', async () => {
      const mockResponse = {
        data: {
          id: 'new-user-uuid',
          email: 'newstudent@ilstu.edu',
          emailVerified: false,
          hasStudentProfile: true,
          hasTutorProfile: false,
          message: 'Registration successful',
        },
      };
      mockApi.post.mockResolvedValueOnce(mockResponse);

      const payload = {
        firstName: 'John',
        lastName: 'Smith',
        email: 'newstudent@ilstu.edu',
        password: 'password123',
        profileType: 'STUDENT',
        major: 'Information Technology',
        expectedGraduation: 2027,
        hourlyRate: 0,
        coursesOffered: [],
        availableForOnline: false,
        availableForInPerson: false,
      };

      const result = await registerUser(payload);

      expect(mockApi.post).toHaveBeenCalledWith('/auth/signup', payload);
      expect(result.email).toBe('newstudent@ilstu.edu');
      expect(result.hasStudentProfile).toBe(true);
    });

    it('registers a tutor successfully', async () => {
      const mockResponse = {
        data: {
          id: 'tutor-uuid',
          email: 'newtutor@ilstu.edu',
          emailVerified: false,
          hasStudentProfile: false,
          hasTutorProfile: true,
          message: 'Registration successful',
        },
      };
      mockApi.post.mockResolvedValueOnce(mockResponse);

      const payload = {
        firstName: 'Alice',
        lastName: 'Brown',
        email: 'newtutor@ilstu.edu',
        password: 'password123',
        profileType: 'TUTOR',
        major: 'Information Technology',
        expectedGraduation: 0,
        hourlyRate: 15,
        coursesOffered: [],
        availableForOnline: true,
        availableForInPerson: false,
      };

      const result = await registerUser(payload);
      expect(result.hasTutorProfile).toBe(true);
    });

    it('throws error when email already exists', async () => {
      mockApi.post.mockRejectedValueOnce({
        response: { status: 400, data: { error: 'Email already registered' } },
      });

      await expect(registerUser({
        firstName: 'Dup',
        lastName: 'User',
        email: 'existing@ilstu.edu',
        password: 'pass',
        profileType: 'STUDENT',
        major: 'IT',
        expectedGraduation: 2026,
        hourlyRate: 0,
        coursesOffered: [],
        availableForOnline: false,
        availableForInPerson: false,
      })).rejects.toBeTruthy();
    });
  });

  // ─── checkEmailAvailable ───

  describe('checkEmailAvailable', () => {
    it('returns true when email is available', async () => {
      mockApi.get.mockResolvedValueOnce({ data: { available: true } });

      const result = await checkEmailAvailable('fresh@ilstu.edu');

      expect(mockApi.get).toHaveBeenCalledWith(
        '/auth/check-email',
        { params: { email: 'fresh@ilstu.edu' } }
      );
      expect(result).toBe(true);
    });

    it('returns false when email is taken', async () => {
      mockApi.get.mockResolvedValueOnce({ data: { available: false } });

      const result = await checkEmailAvailable('taken@ilstu.edu');
      expect(result).toBe(false);
    });
  });

  // ─── forgotPassword ───

  describe('forgotPassword', () => {
    it('resolves without error on valid email', async () => {
      mockApi.post.mockResolvedValueOnce({
        data: { message: 'Reset email sent' },
      });

      await expect(forgotPassword('user@ilstu.edu')).resolves.not.toThrow();
      expect(mockApi.post).toHaveBeenCalledWith(
        '/auth/forgot-password',
        { email: 'user@ilstu.edu' }
      );
    });

    it('resolves even for unregistered email (security - no enumeration)', async () => {
      // backend intentionally returns 200 for unregistered emails
      mockApi.post.mockResolvedValueOnce({
        data: { message: 'If that email is registered, a reset link has been sent.' },
      });

      await expect(forgotPassword('notreal@ilstu.edu')).resolves.not.toThrow();
    });
  });
});
