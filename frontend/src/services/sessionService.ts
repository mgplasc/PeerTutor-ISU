import api from './api';

export type SessionDto = {
  id: string;
  studentId: string;
  studentFirstName: string;
  studentLastName: string;
  tutorId: string;
  tutorFirstName: string;
  tutorLastName: string;
  courseNumber: string;
  sessionDate: string;
  sessionTime: string;
  mode: string;
  status: string;
  createdAt: string;
};

export type BookSessionPayload = {
  tutorId: string;
  courseNumber: string;
  sessionDate: string;
  sessionTime: string;
  mode: string;
};

// GET /api/sessions — get all sessions for logged-in user
export async function getSessionsForUser(userId: string): Promise<SessionDto[]> {
  try {
    const response = await api.get('/api/sessions');
    return response.data as SessionDto[];
  } catch (error) {
    console.error('Failed to fetch sessions:', error);
    return [];
  }
}

// POST /api/sessions — book a new session
export async function bookSession(payload: BookSessionPayload): Promise<SessionDto> {
  const response = await api.post('/api/sessions', payload);
  return response.data as SessionDto;
}

// POST /api/sessions/:id/confirm — tutor confirms a session
export async function confirmSession(sessionId: string): Promise<SessionDto> {
  const response = await api.post('/api/sessions/' + sessionId + '/confirm');
  return response.data as SessionDto;
}

// POST /api/sessions/:id/decline — tutor declines a session
export async function declineSession(sessionId: string): Promise<SessionDto> {
  const response = await api.post('/api/sessions/' + sessionId + '/decline');
  return response.data as SessionDto;
}
