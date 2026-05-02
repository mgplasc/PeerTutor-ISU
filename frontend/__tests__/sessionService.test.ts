// __tests__/sessionService.test.ts
// Unit tests for session booking and management
// run: npx jest __tests__/sessionService.test.ts

import api from '../src/services/api';
import {
  getSessionsForUser,
  bookSession,
  confirmSession,
  declineSession,
} from '../src/services/sessionService';

const mockApi = api as jest.Mocked<typeof api>;

const mockSession = {
  id: 'session-uuid-1',
  studentId: 'student-uuid',
  tutorId: 'tutor-uuid',
  studentFirstName: 'Jane',
  studentLastName: 'Doe',
  tutorFirstName: 'Alice',
  tutorLastName: 'Smith',
  courseNumber: 'IT 168',
  sessionDate: '2026-04-25',
  sessionTime: '14:00',
  mode: 'Online',
  status: 'PENDING',
};

describe('sessionService', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── getSessionsForUser ───

  describe('getSessionsForUser', () => {
    it('fetches sessions for the logged-in user', async () => {
      mockApi.get.mockResolvedValueOnce({ data: [mockSession] });

      const result = await getSessionsForUser('student-uuid');

      expect(mockApi.get).toHaveBeenCalledWith('/api/sessions');
      expect(result).toHaveLength(1);
      expect(result[0].courseNumber).toBe('IT 168');
      expect(result[0].status).toBe('PENDING');
    });

    it('returns empty array when user has no sessions', async () => {
      mockApi.get.mockResolvedValueOnce({ data: [] });

      const result = await getSessionsForUser('student-uuid');
      expect(result).toEqual([]);
    });

    it('returns both student and tutor sessions', async () => {
      const tutorSession = { ...mockSession, id: 'session-2', tutorId: 'student-uuid', studentId: 'other-uuid' };
      mockApi.get.mockResolvedValueOnce({ data: [mockSession, tutorSession] });

      const result = await getSessionsForUser('student-uuid');
      expect(result).toHaveLength(2);
    });
  });

  // ─── bookSession ───

  describe('bookSession', () => {
    it('books a session and returns session DTO with PENDING status', async () => {
      mockApi.post.mockResolvedValueOnce({ data: mockSession });

      const payload = {
        tutorId: 'tutor-uuid',
        courseNumber: 'IT 168',
        sessionDate: '2026-04-25',
        sessionTime: '14:00',
        mode: 'Online',
      };

      const result = await bookSession(payload);

      expect(mockApi.post).toHaveBeenCalledWith('/api/sessions', payload);
      expect(result.status).toBe('PENDING');
      expect(result.tutorId).toBe('tutor-uuid');
    });

    it('throws error if tutor not found', async () => {
      mockApi.post.mockRejectedValueOnce({
        response: { status: 400, data: { error: 'Tutor not found' } },
      });

      await expect(bookSession({
        tutorId: 'bad-uuid',
        courseNumber: 'IT 168',
        sessionDate: '2026-04-25',
        sessionTime: '14:00',
        mode: 'Online',
      })).rejects.toBeTruthy();
    });
  });

  // ─── confirmSession ───

  describe('confirmSession', () => {
    it('confirms a session and returns CONFIRMED status', async () => {
      const confirmed = { ...mockSession, status: 'CONFIRMED' };
      mockApi.post.mockResolvedValueOnce({ data: confirmed });

      const result = await confirmSession('session-uuid-1');

      expect(mockApi.post).toHaveBeenCalledWith('/api/sessions/session-uuid-1/confirm');
      expect(result.status).toBe('CONFIRMED');
    });

    it('throws 403 when non-tutor tries to confirm', async () => {
      mockApi.post.mockRejectedValueOnce({
        response: { status: 403, data: { error: 'Only the tutor can confirm this session' } },
      });

      await expect(confirmSession('session-uuid-1')).rejects.toBeTruthy();
    });
  });

  // ─── declineSession ───

  describe('declineSession', () => {
    it('declines a session and returns DECLINED status', async () => {
      const declined = { ...mockSession, status: 'DECLINED' };
      mockApi.post.mockResolvedValueOnce({ data: declined });

      const result = await declineSession('session-uuid-1');

      expect(mockApi.post).toHaveBeenCalledWith('/api/sessions/session-uuid-1/decline');
      expect(result.status).toBe('DECLINED');
    });
  });
});
