import React, { createContext, useContext, useState, useEffect } from 'react';
import { setAuthToken } from '../services/api';

// No AsyncStorage import to prevent crash

export type StudentProfile = {
  id: string;
  firstName: string;
  lastName: string;
  major: string;
  expectedGraduation: number;
  profilePhotoUrl: string;
  bio: string;
};

export type CourseDto = {
  id: number;
  courseNumber: string;
  courseName: string;
};

export type TutorProfile = {
  id: string;
  firstName: string;
  lastName: string;
  major: string;
  hourlyRate: number;
  profilePhotoUrl: string;
  bio: string;
  availableForOnline: boolean;
  availableForInPerson: boolean;
  rating: number;
  totalSessions: number;
  coursesOffered: CourseDto[];
};

export type AuthUser = {
  id: string;
  email: string;
  emailVerified: boolean;
  hasStudentProfile: boolean;
  hasTutorProfile: boolean;
  studentProfile: StudentProfile | null;
  tutorProfile: TutorProfile | null;
};

export type ActiveRole = 'STUDENT' | 'TUTOR';

type AuthContextType = {
  user: AuthUser;
  activeRole: ActiveRole;
  token: string | null;
  setUser: (user: AuthUser, token?: string | null) => void;
  setActiveRole: (role: ActiveRole) => void;
  logout: () => void;
  displayName: string;
  initials: string;
};

const emptyUser: AuthUser = {
  id: '',
  email: '',
  emailVerified: false,
  hasStudentProfile: false,
  hasTutorProfile: false,
  studentProfile: null,
  tutorProfile: null,
};

const AuthContext = createContext<AuthContextType>({
  user: emptyUser,
  activeRole: 'STUDENT',
  token: null,
  setUser: () => {},
  setActiveRole: () => {},
  logout: () => {},
  displayName: '',
  initials: '',
});

// Simple in-memory storage (no persistence across app restarts)
let savedRole: ActiveRole | null = null;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<AuthUser>(emptyUser);
  const [activeRole, setActiveRoleState] = useState<ActiveRole>('STUDENT');
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load from memory (no AsyncStorage)
    if (savedRole) {
      setActiveRoleState(savedRole);
    }
    setIsLoading(false);
  }, []);

  const setActiveRole = (role: ActiveRole) => {
    setActiveRoleState(role);
    savedRole = role;
  };

  function setUser(newUser: AuthUser, newToken?: string | null) {
    setUserState(newUser);
    if (newToken !== undefined && newToken !== null) {
      setToken(newToken);
      setAuthToken(newToken);
    }
    // Determine default role
    let defaultRole: ActiveRole = 'STUDENT';
    if (newUser.hasStudentProfile) {
      defaultRole = 'STUDENT';
    } else if (newUser.hasTutorProfile) {
      defaultRole = 'TUTOR';
    }
    // Use saved role if valid, otherwise default
    if (savedRole === 'STUDENT' && newUser.hasStudentProfile) {
      setActiveRoleState('STUDENT');
    } else if (savedRole === 'TUTOR' && newUser.hasTutorProfile) {
      setActiveRoleState('TUTOR');
    } else {
      setActiveRoleState(defaultRole);
      savedRole = defaultRole;
    }
  }

  function logout() {
    setUserState(emptyUser);
    setActiveRoleState('STUDENT');
    setToken(null);
    setAuthToken(null);
    savedRole = null;
  }

  let displayName = '';
  let initials = '';

  if (activeRole === 'STUDENT' && user.studentProfile) {
    displayName = `${user.studentProfile.firstName} ${user.studentProfile.lastName}`;
    initials = `${user.studentProfile.firstName.charAt(0)}${user.studentProfile.lastName.charAt(0)}`;
  } else if (activeRole === 'TUTOR' && user.tutorProfile) {
    displayName = `${user.tutorProfile.firstName} ${user.tutorProfile.lastName}`;
    initials = `${user.tutorProfile.firstName.charAt(0)}${user.tutorProfile.lastName.charAt(0)}`;
  } else if (user.email !== '') {
    displayName = user.email;
    initials = user.email.charAt(0).toUpperCase();
  }

  if (isLoading) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ user, activeRole, token, setUser, setActiveRole, logout, displayName, initials }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}