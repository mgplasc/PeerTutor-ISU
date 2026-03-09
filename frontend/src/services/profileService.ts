import api from './api';

// calls GET /api/profiles/user/:userId
export async function getUserProfiles(userId: string) {
  const response = await api.get('/api/profiles/user/' + userId);
  return response.data;
}

// calls PUT /api/profiles/student/:userId
export async function updateStudentProfile(userId: string, payload: object) {
  const response = await api.put('/api/profiles/student/' + userId, payload);
  return response.data;
}

// calls PUT /api/profiles/tutor/:userId
export async function updateTutorProfile(userId: string, payload: object) {
  const response = await api.put('/api/profiles/tutor/' + userId, payload);
  return response.data;
}

// calls POST /api/profiles/student/:userId
// used when a tutor wants to also add a student profile
export async function createStudentProfile(userId: string, payload: object) {
  const response = await api.post('/api/profiles/student/' + userId, payload);
  return response.data;
}

// calls POST /api/profiles/tutor/:userId
// used when a student wants to also add a tutor profile
export async function createTutorProfile(userId: string, payload: object) {
  const response = await api.post('/api/profiles/tutor/' + userId, payload);
  return response.data;
}
