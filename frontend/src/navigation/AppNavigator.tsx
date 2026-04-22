import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { COLORS } from '../constants/colors';
import { useAuth } from '../context/AuthContext';

import HomeScreen from '../screens/HomeScreen';
import TutorProfileScreen from '../screens/TutorProfileScreen';
import BookingScreen from '../screens/BookingScreen';
import ConfirmationScreen from '../screens/ConfirmationScreen';
import MessagesScreen from '../screens/MessagesScreen';
import CalendarScreen from '../screens/CalendarScreen';
import ProfileScreen from '../screens/ProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import AvailabilityScreen from '../screens/AvailabilityScreen';

// Param list for the student home stack
export type HomeStackParamList = {
  Home: undefined;
  TutorProfile: { tutorId: string };
  Booking: { tutor: any };
  Confirmation: { tutor: any; date: string; time: string; mode: string };
};

// Param list for the profile stack
export type ProfileStackParamList = {
  Profile: undefined;
  EditProfile: undefined;
};

const Tab = createBottomTabNavigator();
const StudentStack = createNativeStackNavigator<HomeStackParamList>();
const TutorStack = createNativeStackNavigator();
const ProfileStackNav = createNativeStackNavigator<ProfileStackParamList>();

function StudentHomeStack() {
  return (
    <StudentStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.red },
        headerTintColor: COLORS.white,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <StudentStack.Screen name="Home" component={HomeScreen as any} options={{ title: 'Find a Tutor' }} />
      <StudentStack.Screen name="TutorProfile" component={TutorProfileScreen as any} options={{ title: 'Tutor Profile' }} />
      <StudentStack.Screen name="Booking" component={BookingScreen as any} options={{ title: 'Book Session' }} />
      <StudentStack.Screen name="Confirmation" component={ConfirmationScreen as any} options={{ title: 'Confirmed!' }} />
    </StudentStack.Navigator>
  );
}

function TutorAvailabilityStack() {
  return (
    <TutorStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.red },
        headerTintColor: COLORS.white,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <TutorStack.Screen name="Availability" component={AvailabilityScreen} options={{ title: 'My Availability' }} />
    </TutorStack.Navigator>
  );
}

function ProfileStack() {
  return (
    <ProfileStackNav.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.red },
        headerTintColor: COLORS.white,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <ProfileStackNav.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
      <ProfileStackNav.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Edit Profile' }} />
    </ProfileStackNav.Navigator>
  );
}

function AppNavigator() {
  const auth = useAuth();

  const firstTab = auth.activeRole === 'TUTOR' ? (
    <Tab.Screen
      name="AvailabilityTab"
      component={TutorAvailabilityStack}
      options={{ headerShown: false, tabBarLabel: 'Availability' }}
    />
  ) : (
    <Tab.Screen
      name="FindTab"
      component={StudentHomeStack}
      options={{ headerShown: false, tabBarLabel: 'Find' }}
    />
  );

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: COLORS.red,
        tabBarInactiveTintColor: COLORS.darkGray,
        tabBarStyle: {
          borderTopColor: COLORS.medGray,
          backgroundColor: COLORS.white,
          height: 70,
          paddingBottom: 8,
        },
        tabBarLabelStyle: { fontSize: 13, fontWeight: '600' },
        tabBarIconStyle: { display: 'none' },
        tabBarShowLabel: true,
      }}
    >
      {firstTab}
      <Tab.Screen name="Messages" component={MessagesScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Schedule" component={CalendarScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Profile" component={ProfileStack} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
}

export default AppNavigator;