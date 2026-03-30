import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import VerificationScreen from './src/screens/VerificationScreen';
import AppNavigator from './src/navigation/AppNavigator';

const Stack = createNativeStackNavigator();

function RootNavigator() {
  const auth = useAuth();
  const isLoggedIn = auth.user.id !== ''; //true;(temp for testing)

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
              component={VerificationScreen}
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
