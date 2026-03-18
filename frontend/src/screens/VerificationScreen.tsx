import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { COLORS } from '../constants/colors';
import { verifyEmail } from '../services/authService';

// Define your navigation param list
type RootStackParamList = {
  Login: undefined;
  Verification: { token: string };
};

// Define props type using NativeStackScreenProps
type Props = NativeStackScreenProps<RootStackParamList, 'Verification'>;

function VerificationScreen({ route, navigation }: Props) {
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');

  const { token } = route.params;

  useEffect(() => {
    if (!token) {
      setError('No verification token provided');
      setVerifying(false);
      return;
    }

    handleVerification();
  }, []);

  async function handleVerification() {
    try {
      const result = await verifyEmail(token);
      if (result.success) {
        setVerified(true);
        Alert.alert(
          'Email Verified!',
          'Your email has been successfully verified. You can now log in.',
          [
            {
              text: 'Go to Login',
              onPress: () => navigation.navigate('Login')
            }
          ]
        );
      } else {
        setError(result.message || 'Verification failed');
      }
    } catch (err) {
      // Handle unknown error type properly
      const errorMessage = err instanceof Error ? err.message : 'Verification failed. Please try again.';
      setError(errorMessage);
    } finally {
      setVerifying(false);
    }
  }

  if (verifying) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.red} />
        <Text style={styles.message}>Verifying your email...</Text>
      </View>
    );
  }

  if (verified) {
    return (
      <View style={styles.container}>
        <Text style={styles.successIcon}>✅</Text>
        <Text style={styles.title}>Email Verified!</Text>
        <Text style={styles.message}>
          Your email has been successfully verified. You can now log in to your account.
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.buttonText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorIcon}>❌</Text>
        <Text style={styles.title}>Verification Failed</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.buttonText}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return null; // Add fallback return
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.lightGray,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 10,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  errorMessage: {
    fontSize: 16,
    color: COLORS.red,
    textAlign: 'center',
    marginBottom: 30,
  },
  successIcon: {
    fontSize: 60,
    marginBottom: 20,
  },
  errorIcon: {
    fontSize: 60,
    marginBottom: 20,
  },
  button: {
    backgroundColor: COLORS.red,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
    minWidth: 200,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default VerificationScreen;