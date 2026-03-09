import React, { createContext, useContext, useState } from 'react';

export type StudentProfile = {
  id: string;
  firstName: string;
  lastName: string;
  major: string;
  expectedGraduation: number;
  profilePhotoUrl: string;
  bio: string;
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
  coursesOffered: string[];
};

export type AuthUser = {
  id: string;
  email: string;
  emailVerified: boolean;
  hasStudentProfile: boolean;
  hasTutorProfile: boolean;
  studentProfile: StudentProfile;
  tutorProfile: TutorProfile;
};

export type ActiveRole = 'STUDENT' | 'TUTOR';

type AuthContextType = {
  user: AuthUser;
  activeRole: ActiveRole;
  setUser: (user: AuthUser) => void;
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
  setUser: () => {},
  setActiveRole: () => {},
  logout: () => {},
  displayName: '',
  initials: '',
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<AuthUser>(emptyUser);
  const [activeRole, setActiveRole] = useState<ActiveRole>('STUDENT');

  function setUser(newUser: AuthUser) {
    setUserState(newUser);
    if (newUser.hasStudentProfile) {
      setActiveRole('STUDENT');
    } else if (newUser.hasTutorProfile) {
      setActiveRole('TUTOR');
    }
  }

  function logout() {
    setUserState(emptyUser);
    setActiveRole('STUDENT');
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
    <AuthContext.Provider value={{ user, activeRole, setUser, setActiveRole, logout, displayName, initials }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
