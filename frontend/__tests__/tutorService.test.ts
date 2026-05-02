// __tests__/tutorService.test.ts
// Unit tests for tutor search and filter logic
// run: npx jest __tests__/tutorService.test.ts

import api from '../src/services/api';
import { getTutors } from '../src/services/tutorService';

const mockApi = api as jest.Mocked<typeof api>;

// sample backend response that matches TutorDto shape
const mockTutorDtos = [
  {
    id: 'tutor-1',
    firstName: 'Alice',
    lastName: 'Smith',
    major: 'Information Technology',
    bio: 'I love teaching IT 168',
    hourlyRate: 15,
    rating: 4.5,
    totalSessions: 10,
    availableForOnline: true,
    availableForInPerson: false,
    coursesOffered: [
      { id: 1, courseNumber: 'IT 168', courseName: 'Program Logic and Design' },
      { id: 2, courseNumber: 'IT 279', courseName: 'Data Structures' },
    ],
  },
  {
    id: 'tutor-2',
    firstName: 'Bob',
    lastName: 'Jones',
    major: 'Computer Science',
    bio: '',
    hourlyRate: 20,
    rating: 3.8,
    totalSessions: 5,
    availableForOnline: false,
    availableForInPerson: true,
    coursesOffered: [
      { id: 3, courseNumber: 'IT 340', courseName: 'Database Management' },
    ],
  },
];

describe('tutorService', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── getTutors ───

  describe('getTutors', () => {
    it('fetches all tutors with no filters', async () => {
      mockApi.get.mockResolvedValueOnce({ data: mockTutorDtos });

      const result = await getTutors('', {});

      expect(mockApi.get).toHaveBeenCalledWith('/api/tutors', { params: expect.any(Object) });
      expect(result).toHaveLength(2);
    });

    it('maps TutorDto to Tutor shape correctly', async () => {
      mockApi.get.mockResolvedValueOnce({ data: [mockTutorDtos[0]] });

      const result = await getTutors('', {});

      expect(result[0].id).toBe('tutor-1');
      expect(result[0].firstName).toBe('Alice');
      expect(result[0].courses).toContain('IT 168');
      expect(result[0].courses).toContain('IT 279');
      expect(result[0].rate).toBe('$15/hr');
      expect(result[0].mode).toBe('Online');
      expect(result[0].available).toBe(true);
      expect(result[0].rating).toBe(4.5);
    });

    it('maps "Both" mode when tutor is available online and in-person', async () => {
      const bothDto = { ...mockTutorDtos[0], availableForOnline: true, availableForInPerson: true };
      mockApi.get.mockResolvedValueOnce({ data: [bothDto] });

      const result = await getTutors('', {});
      expect(result[0].mode).toBe('Both');
    });

    it('maps "In-Person" mode correctly', async () => {
      mockApi.get.mockResolvedValueOnce({ data: [mockTutorDtos[1]] });

      const result = await getTutors('', {});
      expect(result[0].mode).toBe('In-Person');
    });

    it('passes courseNumber query param when searching', async () => {
      mockApi.get.mockResolvedValueOnce({ data: [mockTutorDtos[0]] });

      await getTutors('IT 168', {});

      expect(mockApi.get).toHaveBeenCalledWith('/api/tutors', {
        params: expect.objectContaining({ courseNumber: 'IT 168' }),
      });
    });

    it('passes filter params correctly', async () => {
      mockApi.get.mockResolvedValueOnce({ data: [] });

      await getTutors('', {
        sessionFormat: 'online',
        minRating: 4.0,
        maxPrice: 20,
        available: true,
      });

      expect(mockApi.get).toHaveBeenCalledWith('/api/tutors', {
        params: expect.objectContaining({
          sessionFormat: 'online',
          minRating: 4.0,
          maxPrice: 20,
          available: true,
        }),
      });
    });

    it('returns empty array on API error', async () => {
      mockApi.get.mockRejectedValueOnce(new Error('Network error'));

      const result = await getTutors('', {});
      expect(result).toEqual([]);
    });

    it('tutor with no courses returns empty courses array', async () => {
      const noCoursesDto = { ...mockTutorDtos[0], coursesOffered: [] };
      mockApi.get.mockResolvedValueOnce({ data: [noCoursesDto] });

      const result = await getTutors('', {});
      expect(result[0].courses).toEqual([]);
    });
  });
});
