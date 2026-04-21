import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

const ACTIVE_ROLE_KEY = '@PeerTutor_activeRole';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<AuthUser>(emptyUser);
  const [activeRole, setActiveRoleState] = useState<ActiveRole>('STUDENT');
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved active role on startup
  useEffect(() => {
    const loadSavedRole = async () => {
      try {
        const savedRole = await AsyncStorage.getItem(ACTIVE_ROLE_KEY);
        if (savedRole === 'STUDENT' || savedRole === 'TUTOR') {
          setActiveRoleState(savedRole);
        }
      } catch (error) {
        console.error('Failed to load active role', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadSavedRole();
  }, []);

  // Save active role whenever it changes
  const setActiveRole = async (role: ActiveRole) => {
    setActiveRoleState(role);
    try {
      await AsyncStorage.setItem(ACTIVE_ROLE_KEY, role);
    } catch (error) {
      console.error('Failed to save active role', error);
    }
  };

  function setUser(newUser: AuthUser, newToken?: string) {
    setUserState(newUser);
    if (newToken !== undefined) {
      setToken(newToken);
      setAuthToken(newToken);
    }
    // Determine initial active role: prefer student if both exist, otherwise the one that exists
    let defaultRole: ActiveRole = 'STUDENT';
    if (newUser.hasStudentProfile) {
      defaultRole = 'STUDENT';
    } else if (newUser.hasTutorProfile) {
      defaultRole = 'TUTOR';
    }
    // Only set if not already set (avoid overwriting saved role on login)
    // But on login we want to respect the saved role if it's valid.
    // We'll check if saved role is valid for this user.
    AsyncStorage.getItem(ACTIVE_ROLE_KEY).then(savedRole => {
      if (savedRole === 'STUDENT' && newUser.hasStudentProfile) {
        setActiveRoleState('STUDENT');
      } else if (savedRole === 'TUTOR' && newUser.hasTutorProfile) {
        setActiveRoleState('TUTOR');
      } else {
        setActiveRoleState(defaultRole);
        AsyncStorage.setItem(ACTIVE_ROLE_KEY, defaultRole);
      }
    }).catch(() => {
      setActiveRoleState(defaultRole);
    });
  }

  function logout() {
    setUserState(emptyUser);
    setActiveRoleState('STUDENT');
    setToken(null);
    setAuthToken(null);
    AsyncStorage.removeItem(ACTIVE_ROLE_KEY);
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
    // You could return a splash screen or null
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