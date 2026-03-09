import { MOCK_SESSIONS, MOCK_TUTORS } from '../constants/mockData';

// TODO: replace with API calls when backend session endpoints are built
// POST /api/sessions
// GET  /api/sessions?userId=

export async function getSessionsForUser(userId: string) {
  await new Promise(function(resolve) { setTimeout(resolve, 300); });

  return MOCK_SESSIONS.map(function(session) {
    return {
      id: session.id,
      tutor: MOCK_TUTORS[session.tutorIndex],
      course: session.course,
      date: session.date,
      time: session.time,
      mode: session.mode,
      status: session.status,
    };
  });
}

export async function bookSession(payload: object) {
  await new Promise(function(resolve) { setTimeout(resolve, 300); });
  return { success: true };
}
