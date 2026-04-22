import api from './api';

export interface TutorFilters {
  available?: boolean;
  sessionFormat?: 'online' | 'inPerson' | 'both' | string;
  minRating?: number;
  maxPrice?: number;
}

export interface TutorDto {
  id: string;
  firstName: string;
  lastName: string;
  major: string;
  bio: string;
  hourlyRate: number;
  rating: number;
  totalSessions: number;
  availableForOnline: boolean;
  availableForInPerson: boolean;
  coursesOffered: { id: number; courseNumber: string; courseName: string }[];
}

export interface Tutor {
  id: string;
  firstName: string;
  lastName: string;
  courses: string[];
  rating: number;
  reviews: number;
  rate: string;
  mode: string;
  available: boolean;
  avatar: string;
  avatarBg: string;
  year: string;
  major?: string;
  bio?: string;
}

function mapTutorDtoToTutor(dto: TutorDto): Tutor {
  let mode = 'In-Person';
  if (dto.availableForOnline && dto.availableForInPerson) mode = 'Both';
  else if (dto.availableForOnline) mode = 'Online';
  else if (dto.availableForInPerson) mode = 'In-Person';

  const available = dto.availableForOnline || dto.availableForInPerson;
  const avatar = (dto.firstName?.[0] || '') + (dto.lastName?.[0] || '');
  const avatarBg = '#CE1126';
  const reviews = dto.totalSessions || 0;
  const rate = `$${dto.hourlyRate}/hr`;
  const courses = (dto.coursesOffered || []).map(c => c.courseNumber);

  return {
    id: dto.id,
    firstName: dto.firstName,
    lastName: dto.lastName,
    courses,
    rating: dto.rating || 0,
    reviews,
    rate,
    mode,
    available,
    avatar: avatar || '?',
    avatarBg,
    year: dto.major,
    major: dto.major,
    bio: dto.bio,
  };
}

export async function getTutors(searchQuery?: string, filters?: TutorFilters): Promise<Tutor[]> {
  const params: any = {};
  if (searchQuery) params.courseNumber = searchQuery;
  if (filters?.sessionFormat) params.sessionFormat = filters.sessionFormat;
  if (filters?.minRating) params.minRating = filters.minRating;
  if (filters?.maxPrice) params.maxPrice = filters.maxPrice;
  if (filters?.available) params.available = filters.available;

  const response = await api.get('/api/tutors', { params });
  const dtos: TutorDto[] = response.data;
  return dtos.map(mapTutorDtoToTutor);
}

export async function getTutorById(id: string): Promise<Tutor> {
  const response = await api.get(`/api/tutors/${id}`);
  const dto: TutorDto = response.data;
  return mapTutorDtoToTutor(dto);
}