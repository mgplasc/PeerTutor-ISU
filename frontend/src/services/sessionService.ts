import api from './api';

export interface SessionDto {
  id: string;
  studentId: string;
  tutorId: string;
  studentFirstName?: string;
  studentLastName?: string;
  tutorFirstName?: string;
  tutorLastName?: string;
  courseNumber: string;
  sessionDate: string;      // YYYY-MM-DD
  sessionTime: string;      // HH:MM
  mode: string;             // 'Online' or 'In-Person'
  status: string;           // 'PENDING', 'CONFIRMED', 'DECLINED', 'COMPLETED'
  zoomLink?: string;        // Zoom meeting URL for online sessions
  feedbackGiven?: boolean;  // Whether student has already left feedback
}

export interface BookSessionRequest {
  tutorId: string;
  courseNumber: string;
  sessionDate: string;
  sessionTime: string;
  mode: string;
  availabilitySlotId?: string; // optional, if you have slot-based booking
}

export async function getSessionsForUser(userId: string): Promise<SessionDto[]> {
  const response = await api.get('/api/sessions');
  return response.data;
}

export async function bookSession(request: BookSessionRequest): Promise<SessionDto> {
  const response = await api.post('/api/sessions', request);
  return response.data;
}

export async function confirmSession(sessionId: string): Promise<SessionDto> {
  const response = await api.post(`/api/sessions/${sessionId}/confirm`);
  return response.data;
}

export async function declineSession(sessionId: string): Promise<SessionDto> {
  const response = await api.post(`/api/sessions/${sessionId}/decline`);
  return response.data;
}

export async function submitFeedback(sessionId: string, rating: number, notes: string): Promise<void> {
  await api.post(`/api/feedback/session/${sessionId}`, { rating, notes });
}