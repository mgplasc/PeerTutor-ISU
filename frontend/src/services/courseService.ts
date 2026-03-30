import api from './api';

export type Course = {
  id: number;
  courseNumber: string;
  courseName: string;
};

// GET /api/courses — fetch all available ISU IT courses for the picker
export async function getAllCourses(): Promise<Course[]> {
  try {
    const response = await api.get('/api/courses');
    return response.data as Course[];
  } catch (error) {
    console.error('Failed to fetch courses:', error);
    return [];
  }
}
