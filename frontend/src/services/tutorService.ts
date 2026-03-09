import { MOCK_TUTORS } from '../constants/mockData';

// TODO: replace mock data with API calls when backend tutor endpoints are built
// GET /api/tutors
// GET /api/tutors/:id

export async function getTutors(courseQuery: string) {
  // Simulate a small network delay
  await new Promise(function(resolve) { setTimeout(resolve, 300); });

  if (courseQuery === '' || courseQuery === null || courseQuery === undefined) {
    return MOCK_TUTORS;
  }

  const query = courseQuery.toLowerCase();
  return MOCK_TUTORS.filter(function(tutor) {
    const matchesCourse = tutor.courses.some(function(course) {
      return course.toLowerCase().includes(query);
    });
    const matchesName = (tutor.firstName + ' ' + tutor.lastName).toLowerCase().includes(query);
    return matchesCourse || matchesName;
  });
}

export async function getTutorById(id: string) {
  const found = MOCK_TUTORS.find(function(tutor) {
    return tutor.id === id;
  });
  if (found === undefined) {
    return null;
  }
  return found;
}
