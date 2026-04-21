import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { COLORS } from '../constants/colors';
import { registerUser, checkEmailAvailable, loginUser } from '../services/authService';
import { AuthUser, useAuth } from '../context/AuthContext';
import CoursePicker from '../components/CoursePicker';
import { requestUserPermission, registerDeviceToken } from '../utils/notifications';
import api, { setAuthToken } from '../services/api';

type Mode = 'login' | 'signup-student' | 'signup-tutor';

type LoginScreenProps = {
  navigation: {
    navigate: (screen: string) => void;
  };
};

function LoginScreen({ navigation }: LoginScreenProps) {
  const auth = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [loading, setLoading] = useState(false);

  // shared fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // signup fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [major, setMajor] = useState('');

  // student-only
  const [gradYear, setGradYear] = useState('');

  // tutor-only
  const [hourlyRate, setHourlyRate] = useState('');
  const [selectedCourseIds, setSelectedCourseIds] = useState<number[]>([]);
  const [onlineAvail, setOnlineAvail] = useState(false);
  const [inPersonAvail, setInPersonAvail] = useState(false);

  async function handleLogin() {
    if (email === '' || password === '') {
      Alert.alert('Missing Fields', 'Please enter your email and password.');
      return;
    }
    if (!email.endsWith('@ilstu.edu')) {
      Alert.alert('Invalid Email', 'You must use an @ilstu.edu email address.');
      return;
    }
    setLoading(true);
    try {
      const loginResponse = await loginUser(email, password);

      const user: AuthUser = {
        id: loginResponse.id,
        email: loginResponse.email,
        emailVerified: loginResponse.emailVerified,
        hasStudentProfile: loginResponse.hasStudentProfile,
        hasTutorProfile: loginResponse.hasTutorProfile,
        studentProfile: loginResponse.studentProfile || null,
        tutorProfile: loginResponse.tutorProfile || null,
      };

      auth.setUser(user, loginResponse.token);
      setAuthToken(loginResponse.token);

      await setupPushNotifications();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Could not log in. Please try again.';
      Alert.alert('Login Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  }

  async function setupPushNotifications() {
    try {
      await requestUserPermission();
      await registerDeviceToken(api);
      console.log('Push notification setup complete');
    } catch (error) {
      console.error('Error setting up push notifications:', error);
    }
  }

  async function handleSignup() {
    if (firstName === '' || lastName === '' || email === '' || password === '' || major === '') {
      Alert.alert('Missing Fields', 'Please fill in all required fields.');
      return;
    }
    if (!email.endsWith('@ilstu.edu')) {
      Alert.alert('Invalid Email', 'You must use an @ilstu.edu email address.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Weak Password', 'Password must be at least 8 characters.');
      return;
    }

    setLoading(true);

    try {
      const available = await checkEmailAvailable(email);
      if (!available) {
        Alert.alert('Email Taken', 'That email is already registered.');
        setLoading(false);
        return;
      }

      const profileType = mode === 'signup-student' ? 'STUDENT' : 'TUTOR';

      const parsedGradYear = parseInt(gradYear, 10);
      const expectedGraduation = Number.isNaN(parsedGradYear) ? 0 : parsedGradYear;

      const parsedRate = parseFloat(hourlyRate);
      const resolvedHourlyRate = Number.isNaN(parsedRate) ? 0 : parsedRate;

      // Build payload matching backend SignupRequest
      const payload: any = {
        firstName,
        lastName,
        email,
        password,
        profileType,
        major,
        availableForOnline: onlineAvail,
        availableForInPerson: inPersonAvail,
      };

      if (profileType === 'STUDENT') {
        payload.expectedGraduation = expectedGraduation;
      } else {
        // TUTOR: use courseIds (array of numbers) – backend expects List<Long>
        payload.hourlyRate = resolvedHourlyRate;
        payload.courseIds = selectedCourseIds;  // ✅ now matches backend field name
      }

      const signupResult = await registerUser(payload);

      const newUser: AuthUser = {
        id: signupResult.id,
        email: signupResult.email,
        emailVerified: signupResult.emailVerified,
        hasStudentProfile: signupResult.hasStudentProfile,
        hasTutorProfile: signupResult.hasTutorProfile,
        studentProfile: null,
        tutorProfile: null,
      };

      auth.setUser(newUser);

      Alert.alert(
        'Welcome!',
        'Account created. Please check your @ilstu.edu email to verify your account.'
      );
    } catch (err) {
      Alert.alert('Signup Failed', 'Something went wrong. Please try again.');
    }

    setLoading(false);
  }

  function renderToggle() {
    return (
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggleBtn, mode === 'login' && styles.toggleActive]}
          onPress={() => setMode('login')}
        >
          <Text style={[styles.toggleText, mode === 'login' && styles.toggleActiveText]}>
            Log In
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, mode === 'signup-student' && styles.toggleActive]}
          onPress={() => setMode('signup-student')}
        >
          <Text style={[styles.toggleText, mode === 'signup-student' && styles.toggleActiveText]}>
            Student
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, mode === 'signup-tutor' && styles.toggleActive]}
          onPress={() => setMode('signup-tutor')}
        >
          <Text style={[styles.toggleText, mode === 'signup-tutor' && styles.toggleActiveText]}>
            Tutor
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  function renderSharedSignupFields() {
    return (
      <View>
        <Text style={styles.fieldLabel}>First Name</Text>
        <TextInput
          style={styles.input}
          value={firstName}
          onChangeText={setFirstName}
          placeholder="First Name"
          placeholderTextColor={COLORS.darkGray}
        />
        <Text style={styles.fieldLabel}>Last Name</Text>
        <TextInput
          style={styles.input}
          value={lastName}
          onChangeText={setLastName}
          placeholder="Last Name"
          placeholderTextColor={COLORS.darkGray}
        />
        <Text style={styles.fieldLabel}>Major</Text>
        <TextInput
          style={styles.input}
          value={major}
          onChangeText={setMajor}
          placeholder="e.g. Information Technology"
          placeholderTextColor={COLORS.darkGray}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>PeerTutor ISU</Text>
        <Text style={styles.subtitle}>Illinois State University</Text>
      </View>

      <View style={styles.card}>
        {renderToggle()}

        {mode === 'login' && (
          <View>
            <Text style={styles.fieldLabel}>ISU Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="ULID@ilstu.edu"
              placeholderTextColor={COLORS.darkGray}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Text style={styles.fieldLabel}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor={COLORS.darkGray}
              secureTextEntry={true}
            />
            <TouchableOpacity
              style={styles.forgotLink}
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Text style={styles.forgotLinkText}>Forgot password?</Text>
            </TouchableOpacity>
            {loading ? (
              <ActivityIndicator color={COLORS.red} style={styles.spinner} />
            ) : (
              <TouchableOpacity style={styles.primaryBtn} onPress={handleLogin}>
                <Text style={styles.primaryBtnText}>Log In</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {mode === 'signup-student' && (
          <View>
            {renderSharedSignupFields()}
            <Text style={styles.fieldLabel}>Expected Graduation Year</Text>
            <TextInput
              style={styles.input}
              value={gradYear}
              onChangeText={setGradYear}
              placeholder="e.g. 2027"
              placeholderTextColor={COLORS.darkGray}
              keyboardType="numeric"
            />
            <Text style={styles.fieldLabel}>ISU Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="ULID@ilstu.edu"
              placeholderTextColor={COLORS.darkGray}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Text style={styles.fieldLabel}>Password (min 8 characters)</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor={COLORS.darkGray}
              secureTextEntry={true}
            />
            {loading ? (
              <ActivityIndicator color={COLORS.red} style={styles.spinner} />
            ) : (
              <TouchableOpacity style={styles.primaryBtn} onPress={handleSignup}>
                <Text style={styles.primaryBtnText}>Create Student Account</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {mode === 'signup-tutor' && (
          <View>
            {renderSharedSignupFields()}
            <Text style={styles.fieldLabel}>Hourly Rate ($)</Text>
            <TextInput
              style={styles.input}
              value={hourlyRate}
              onChangeText={setHourlyRate}
              placeholder="e.g. 15"
              placeholderTextColor={COLORS.darkGray}
              keyboardType="numeric"
            />
            <Text style={styles.fieldLabel}>Courses You Can Tutor</Text>
            <CoursePicker
              selectedIds={selectedCourseIds}
              onSelectionChange={setSelectedCourseIds}
            />
            <Text style={styles.fieldLabel}>Availability</Text>
            <View style={styles.checkRow}>
              <TouchableOpacity
                style={[styles.checkbox, onlineAvail && styles.checkboxActive]}
                onPress={() => setOnlineAvail(!onlineAvail)}
              >
                <Text style={[styles.checkboxText, onlineAvail && styles.checkboxActiveText]}>
                  Online
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.checkbox, inPersonAvail && styles.checkboxActive]}
                onPress={() => setInPersonAvail(!inPersonAvail)}
              >
                <Text style={[styles.checkboxText, inPersonAvail && styles.checkboxActiveText]}>
                  In-Person
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.fieldLabel}>ISU Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="ULID@ilstu.edu"
              placeholderTextColor={COLORS.darkGray}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Text style={styles.fieldLabel}>Password (min 8 characters)</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor={COLORS.darkGray}
              secureTextEntry={true}
            />
            {loading ? (
              <ActivityIndicator color={COLORS.red} style={styles.spinner} />
            ) : (
              <TouchableOpacity style={styles.primaryBtn} onPress={handleSignup}>
                <Text style={styles.primaryBtnText}>Create Tutor Account</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.red,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginTop: 4,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.lightGray,
    borderRadius: 10,
    padding: 3,
    marginBottom: 20,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  toggleActive: {
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.darkGray,
  },
  toggleActiveText: {
    color: COLORS.red,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.black,
    borderWidth: 1,
    borderColor: COLORS.medGray,
  },
  forgotLink: {
    alignSelf: 'flex-end',
    marginTop: 8,
    marginBottom: 4,
    paddingVertical: 4,
  },
  forgotLinkText: {
    fontSize: 13,
    color: COLORS.red,
    fontWeight: '600',
  },
  checkRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  checkbox: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: COLORS.medGray,
  },
  checkboxActive: {
    borderColor: COLORS.red,
    backgroundColor: '#FEE2E6',
  },
  checkboxText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.darkGray,
  },
  checkboxActiveText: {
    color: COLORS.red,
  },
  primaryBtn: {
    backgroundColor: COLORS.red,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  primaryBtnText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
  },
  spinner: {
    marginTop: 20,
  },
});

export default LoginScreen;