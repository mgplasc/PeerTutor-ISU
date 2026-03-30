import React, { createContext, useContext, useState } from 'react';
import { setAuthToken } from '../services/api';

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
  setUser: (user: AuthUser, token?: string) => void;
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<AuthUser>(emptyUser);
  const [activeRole, setActiveRole] = useState<ActiveRole>('STUDENT');
  const [token, setToken] = useState<string | null>(null);

  function setUser(newUser: AuthUser, newToken?: string) {
    setUserState(newUser);
    if (newToken !== undefined) {
      setToken(newToken);
      setAuthToken(newToken);
    }
    if (newUser.hasStudentProfile) {
      setActiveRole('STUDENT');
    } else if (newUser.hasTutorProfile) {
      setActiveRole('TUTOR');
    }
  }

  function logout() {
    setUserState(emptyUser);
    setActiveRole('STUDENT');
    setToken(null);
    setAuthToken(null);
  }

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

  return (
    <AuthContext.Provider value={{ user, activeRole, token, setUser, setActiveRole, logout, displayName, initials }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
