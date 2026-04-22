import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import VerificationScreen from './src/screens/VerificationScreen';
import AppNavigator from './src/navigation/AppNavigator';

// Define the param list for the root stack
export type RootStackParamList = {
  Login: undefined;
  ForgotPassword: undefined;
  Verification: { token: string };
  Main: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function RootNavigator() {
  const auth = useAuth();
  const isLoggedIn = auth.user.id !== '';

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isLoggedIn ? (
          <Stack.Screen name="Main" component={AppNavigator} />
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen
              name="ForgotPassword"
              component={ForgotPasswordScreen}
              options={{
                headerShown: true,
                headerTitle: 'Reset Password',
                headerStyle: { backgroundColor: '#CE1126' },
                headerTintColor: '#FFFFFF',
                headerTitleStyle: { fontWeight: '700' },
              }}
            />
            <Stack.Screen
              name="Verification"
              // Cast to any to resolve type mismatch
              component={VerificationScreen as any}
              options={{
                headerShown: true,
                headerTitle: 'Verify Email',
                headerStyle: { backgroundColor: '#CE1126' },
                headerTintColor: '#FFFFFF',
                headerTitleStyle: { fontWeight: '700' },
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function App() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}

export default App;