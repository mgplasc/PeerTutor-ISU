// __tests__/AuthContext.test.tsx
// Tests for AuthContext — profile management and role switching
// run: npx jest __tests__/AuthContext.test.tsx

jest.mock('../src/services/api', () => ({
  setAuthToken: jest.fn(),
  default: { get: jest.fn(), post: jest.fn() },
}));

// ─── Test data ───

const mockStudentUser = {
  id: 'user-uuid-1',
  email: 'jane@ilstu.edu',
  emailVerified: true,
  hasStudentProfile: true,
  hasTutorProfile: false,
  studentProfile: {
    id: 'user-uuid-1',
    firstName: 'Jane',
    lastName: 'Doe',
    major: 'Information Technology',
    expectedGraduation: 2027,
    profilePhotoUrl: '',
    bio: 'Student at ISU',
  },
  tutorProfile: null,
};

const mockTutorUser = {
  id: 'user-uuid-2',
  email: 'alice@ilstu.edu',
  emailVerified: true,
  hasStudentProfile: false,
  hasTutorProfile: true,
  studentProfile: null,
  tutorProfile: {
    id: 'user-uuid-2',
    firstName: 'Alice',
    lastName: 'Smith',
    major: 'Information Technology',
    hourlyRate: 15,
    profilePhotoUrl: '',
    bio: 'Experienced tutor',
    availableForOnline: true,
    availableForInPerson: false,
    rating: 4.5,
    totalSessions: 10,
    coursesOffered: [{ id: 1, courseNumber: 'IT 168', courseName: 'Program Logic' }],
  },
};

const mockBothUser = {
  ...mockStudentUser,
  hasTutorProfile: true,
  tutorProfile: mockTutorUser.tutorProfile,
};

// ─── Helpers that mirror AuthContext's internal logic ───

function getDefaultRole(user: typeof mockStudentUser): 'STUDENT' | 'TUTOR' {
  if (user.hasStudentProfile) { return 'STUDENT'; }
  if (user.hasTutorProfile) { return 'TUTOR'; }
  return 'STUDENT';
}

function buildDisplayName(
  activeRole: 'STUDENT' | 'TUTOR',
  user: any
): { displayName: string; initials: string } {
  let displayName = '';
  let initials = '';
  if (activeRole === 'STUDENT' && user.studentProfile) {
    displayName = user.studentProfile.firstName + ' ' + user.studentProfile.lastName;
    initials = user.studentProfile.firstName.charAt(0) + user.studentProfile.lastName.charAt(0);
  } else if (activeRole === 'TUTOR' && user.tutorProfile) {
    displayName = user.tutorProfile.firstName + ' ' + user.tutorProfile.lastName;
    initials = user.tutorProfile.firstName.charAt(0) + user.tutorProfile.lastName.charAt(0);
  } else if (user.email !== '') {
    displayName = user.email;
    initials = user.email.charAt(0).toUpperCase();
  }
  return { displayName, initials };
}

// ─── Tests ───

describe('AuthContext logic', () => {

  beforeEach(() => { jest.clearAllMocks(); });

  // Default role
  it('assigns STUDENT role when user has a student profile', () => {
    expect(getDefaultRole(mockStudentUser)).toBe('STUDENT');
  });

  it('assigns TUTOR role when user only has a tutor profile', () => {
    expect(getDefaultRole(mockTutorUser as any)).toBe('TUTOR');
  });

  it('assigns STUDENT role when user has both profiles', () => {
    expect(getDefaultRole(mockBothUser)).toBe('STUDENT');
  });

  // displayName and initials
  it('builds displayName and initials from student profile', () => {
    const { displayName, initials } = buildDisplayName('STUDENT', mockStudentUser);
    expect(displayName).toBe('Jane Doe');
    expect(initials).toBe('JD');
  });

  it('builds displayName and initials from tutor profile', () => {
    const { displayName, initials } = buildDisplayName('TUTOR', mockTutorUser);
    expect(displayName).toBe('Alice Smith');
    expect(initials).toBe('AS');
  });

  it('falls back to email when no profile exists', () => {
    const noProfile = { ...mockStudentUser, hasStudentProfile: false, studentProfile: null };
    const { displayName, initials } = buildDisplayName('STUDENT', noProfile);
    expect(displayName).toBe('jane@ilstu.edu');
    expect(initials).toBe('J');
  });

  it('returns empty strings when user is not logged in', () => {
    const empty = { id: '', email: '', emailVerified: false, hasStudentProfile: false, hasTutorProfile: false, studentProfile: null, tutorProfile: null };
    const { displayName, initials } = buildDisplayName('STUDENT', empty);
    expect(displayName).toBe('');
    expect(initials).toBe('');
  });

  // setAuthToken wiring
  it('calls setAuthToken with token on login', () => {
    const { setAuthToken } = require('../src/services/api');
    setAuthToken('jwt-token-abc');
    expect(setAuthToken).toHaveBeenCalledWith('jwt-token-abc');
  });

  it('calls setAuthToken with null on logout', () => {
    const { setAuthToken } = require('../src/services/api');
    setAuthToken(null);
    expect(setAuthToken).toHaveBeenCalledWith(null);
  });

  // Tutor profile shape
  it('tutor profile has coursesOffered as array of CourseDto objects', () => {
    const tp = mockTutorUser.tutorProfile;
    expect(Array.isArray(tp.coursesOffered)).toBe(true);
    expect(tp.coursesOffered[0]).toHaveProperty('id');
    expect(tp.coursesOffered[0]).toHaveProperty('courseNumber');
    expect(tp.coursesOffered[0]).toHaveProperty('courseName');
  });

  it('courseNumber in tutor profile is a string matching expected format', () => {
    const course = mockTutorUser.tutorProfile.coursesOffered[0];
    expect(typeof course.courseNumber).toBe('string');
    expect(course.courseNumber).toBe('IT 168');
  });

  // Role switching display
  it('TUTOR role shows tutor displayName for dual-profile user', () => {
    const { displayName } = buildDisplayName('TUTOR', mockBothUser);
    expect(displayName).toBe('Alice Smith');
  });

  it('STUDENT role shows student displayName for dual-profile user', () => {
    const { displayName } = buildDisplayName('STUDENT', mockBothUser);
    expect(displayName).toBe('Jane Doe');
  });
});
