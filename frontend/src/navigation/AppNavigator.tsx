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

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function StudentHomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.red },
        headerTintColor: COLORS.white,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Find a Tutor' }} />
      <Stack.Screen name="TutorProfile" component={TutorProfileScreen} options={{ title: 'Tutor Profile' }} />
      <Stack.Screen name="Booking" component={BookingScreen} options={{ title: 'Book Session' }} />
      <Stack.Screen name="Confirmation" component={ConfirmationScreen} options={{ title: 'Confirmed!' }} />
    </Stack.Navigator>
  );
}

function TutorDashboardStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.red },
        headerTintColor: COLORS.white,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Stack.Screen
        name="TutorDashboard"
        component={HomeScreen}
        options={{ title: 'Tutor Dashboard' }}
      />
    </Stack.Navigator>
  );
}

function AppNavigator() {
  const auth = useAuth();

  let homeTab = null;
  if (auth.activeRole === 'TUTOR') {
    homeTab = (
      <Tab.Screen
        name="FindTab"
        component={TutorDashboardStack}
        options={{
          headerShown: false,
          tabBarLabel: 'Requests',
        }}
      />
    );
  } else {
    homeTab = (
      <Tab.Screen
        name="FindTab"
        component={StudentHomeStack}
        options={{
          headerShown: false,
          tabBarLabel: 'Find',
        }}
      />
    );
  }

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: COLORS.red,
        tabBarInactiveTintColor: COLORS.darkGray,
        tabBarStyle: {
          borderTopColor: COLORS.medGray,
          backgroundColor: COLORS.white,
          height:70,
          paddingBottom: 8,
        },
        tabBarLabelStyle: {
          fontSize: 13,
          fontWeight: '600',
        },
        tabBarIconStyle: { display: 'none' },
        tabBarShowLabel: true,
      }}
    >
      {homeTab}

      <Tab.Screen
        name="Messages"
        component={MessagesScreen}
        options={{ headerShown: false }}
      />

      <Tab.Screen
        name="Schedule"
        component={CalendarScreen}
        options={{ headerShown: false }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
}

export default AppNavigator;
