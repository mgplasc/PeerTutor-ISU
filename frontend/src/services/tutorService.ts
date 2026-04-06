import api from './api';

// Avatar background colors — one is picked deterministically from the tutor's id
const AVATAR_COLORS = ['#CE1126', '#1D4ED8', '#7C3AED', '#0369A1', '#065F46', '#B45309', '#9D174D'];

function getAvatarColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

// Maps a TutorProfileDto from the backend to the Tutor shape used by TutorCard / HomeScreen
function mapTutor(dto: any) {
  const online = dto.availableForOnline === true;
  const inPerson = dto.availableForInPerson === true;
  let mode = 'Online';
  if (online && inPerson) {
    mode = 'Both';
  } else if (inPerson) {
    mode = 'In-Person';
  }

  const initials =
    (dto.firstName ? dto.firstName[0] : '') +
    (dto.lastName  ? dto.lastName[0]  : '');

  return {
    id:        dto.id,
    firstName: dto.firstName  || '',
    lastName:  dto.lastName   || '',
    courses:   (dto.coursesOffered || []).map(function(c: any) { return c.courseNumber; }),
    rating:    dto.rating       || 0,
    reviews:   dto.totalSessions || 0,
    rate:      dto.hourlyRate ? '$' + dto.hourlyRate + '/hr' : 'Rate TBD',
    mode,
    available: true,
    avatar:    initials,
    avatarBg:  getAvatarColor(dto.id),
    year:      dto.major || '',
  };
}

// GET /api/tutors  or  GET /api/tutors?courseNumber=xxx
export async function getTutors(courseQuery: string) {
  const params: Record<string, string> = {};
  if (courseQuery && courseQuery.trim() !== '') {
    params.courseNumber = courseQuery.trim();
  }
  const response = await api.get('/api/tutors', { params });
  return response.data.map(mapTutor);
}

// GET /api/tutors/:id
export async function getTutorById(id: string) {
  const response = await api.get('/api/tutors/' + id);
  if (!response.data) {
    return null;
  }
  return mapTutor(response.data);
}
