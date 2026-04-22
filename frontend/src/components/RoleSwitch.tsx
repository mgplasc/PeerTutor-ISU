import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ActivityIndicator,
  StyleSheet, Alert, TextInput, ScrollView,
} from 'react-native';
import { COLORS } from '../constants/colors';
import { useAuth } from '../context/AuthContext';
import { createTutorProfile, createStudentProfile, getUserProfiles } from '../services/profileService';
import CoursePicker from './CoursePicker';

type FormView = 'none' | 'addTutor' | 'addStudent';

function RoleSwitch() {
  const auth = useAuth();
  const [loading, setLoading] = useState(false);
  const [formView, setFormView] = useState<FormView>('none');

  // Tutor form fields
  const [hourlyRate, setHourlyRate] = useState('');
  const [selectedCourseIds, setSelectedCourseIds] = useState<number[]>([]);
  const [onlineAvail, setOnlineAvail] = useState(false);
  const [inPersonAvail, setInPersonAvail] = useState(false);
  const [major, setMajor] = useState('');

  // Student form fields
  const [gradYear, setGradYear] = useState('');
  const [studentMajor, setStudentMajor] = useState('');

  if (auth.user.id === '') {
    return null;
  }

  // Both profiles exist — show toggle with success alerts
  if (auth.user.hasStudentProfile && auth.user.hasTutorProfile) {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>Switch Role</Text>
        <View style={styles.toggle}>
          <TouchableOpacity
            style={[styles.option, auth.activeRole === 'STUDENT' && styles.activeOption]}
            onPress={() => {
              auth.setActiveRole('STUDENT');
              Alert.alert('Role Switched', 'You are now viewing as a student.');
            }}
          >
            <Text style={[styles.optionText, auth.activeRole === 'STUDENT' && styles.activeText]}>
              Student
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.option, auth.activeRole === 'TUTOR' && styles.activeOption]}
            onPress={() => {
              auth.setActiveRole('TUTOR');
              Alert.alert('Role Switched', 'You are now viewing as a tutor.');
            }}
          >
            <Text style={[styles.optionText, auth.activeRole === 'TUTOR' && styles.activeText]}>
              Tutor
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  async function handleAddTutorProfile() {
    const parsedRate = parseFloat(hourlyRate);
    if (Number.isNaN(parsedRate) || parsedRate <= 0) {
      Alert.alert('Invalid Rate', 'Please enter a valid hourly rate.');
      return;
    }
    if (selectedCourseIds.length === 0) {
      Alert.alert('Missing Courses', 'Please select at least one course.');
      return;
    }
    if (major.trim() === '') {
      Alert.alert('Missing Major', 'Please enter your major.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        firstName: auth.user.studentProfile ? auth.user.studentProfile.firstName : '',
        lastName: auth.user.studentProfile ? auth.user.studentProfile.lastName : '',
        major: major,
        hourlyRate: parsedRate,
        courseIds: selectedCourseIds,
        availableForOnline: onlineAvail,
        availableForInPerson: inPersonAvail,
      };

      await createTutorProfile(auth.user.id, payload);

      const profiles = await getUserProfiles(auth.user.id);
      const updated = {
        id: auth.user.id,
        email: auth.user.email,
        emailVerified: auth.user.emailVerified,
        hasStudentProfile: profiles.studentProfileExists,
        hasTutorProfile: profiles.tutorProfileExists,
        studentProfile: profiles.studentProfile,
        tutorProfile: profiles.tutorProfile,
      };
      auth.setUser(updated, auth.token ?? undefined);
      auth.setActiveRole('TUTOR');
      setFormView('none');
      Alert.alert('Tutor Profile Added', 'You can now switch to Tutor mode.');
    } catch (err) {
      Alert.alert('Error', 'Could not create tutor profile. Please try again.');
    }
    setLoading(false);
  }

  async function handleAddStudentProfile() {
    const parsedYear = parseInt(gradYear, 10);
    if (Number.isNaN(parsedYear) || parsedYear < 2024) {
      Alert.alert('Invalid Year', 'Please enter a valid graduation year.');
      return;
    }
    if (studentMajor.trim() === '') {
      Alert.alert('Missing Major', 'Please enter your major.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        firstName: auth.user.tutorProfile ? auth.user.tutorProfile.firstName : '',
        lastName: auth.user.tutorProfile ? auth.user.tutorProfile.lastName : '',
        major: studentMajor,
        expectedGraduation: parsedYear,
      };

      await createStudentProfile(auth.user.id, payload);

      const profiles = await getUserProfiles(auth.user.id);
      const updated = {
        id: auth.user.id,
        email: auth.user.email,
        emailVerified: auth.user.emailVerified,
        hasStudentProfile: profiles.studentProfileExists,
        hasTutorProfile: profiles.tutorProfileExists,
        studentProfile: profiles.studentProfile,
        tutorProfile: profiles.tutorProfile,
      };
      auth.setUser(updated, auth.token ?? undefined);
      auth.setActiveRole('STUDENT');
      setFormView('none');
      Alert.alert('Student Profile Added', 'You can now switch to Student mode.');
    } catch (err) {
      Alert.alert('Error', 'Could not create student profile. Please try again.');
    }
    setLoading(false);
  }

  // Show add tutor form
  if (formView === 'addTutor') {
    return (
      <View style={styles.container}>
        <Text style={styles.formTitle}>Set Up Tutor Profile</Text>

        <Text style={styles.fieldLabel}>Major</Text>
        <TextInput
          style={styles.input}
          value={major}
          onChangeText={setMajor}
          placeholder="e.g. Information Technology"
          placeholderTextColor={COLORS.darkGray}
        />

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

        <View style={styles.formBtns}>
          {loading ? (
            <ActivityIndicator color={COLORS.red} />
          ) : (
            <>
              <TouchableOpacity style={styles.primaryBtn} onPress={handleAddTutorProfile}>
                <Text style={styles.primaryBtnText}>Create Tutor Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setFormView('none')}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    );
  }

  // Show add student form
  if (formView === 'addStudent') {
    return (
      <View style={styles.container}>
        <Text style={styles.formTitle}>Set Up Student Profile</Text>

        <Text style={styles.fieldLabel}>Major</Text>
        <TextInput
          style={styles.input}
          value={studentMajor}
          onChangeText={setStudentMajor}
          placeholder="e.g. Information Technology"
          placeholderTextColor={COLORS.darkGray}
        />

        <Text style={styles.fieldLabel}>Expected Graduation Year</Text>
        <TextInput
          style={styles.input}
          value={gradYear}
          onChangeText={setGradYear}
          placeholder="e.g. 2027"
          placeholderTextColor={COLORS.darkGray}
          keyboardType="numeric"
        />

        <View style={styles.formBtns}>
          {loading ? (
            <ActivityIndicator color={COLORS.red} />
          ) : (
            <>
              <TouchableOpacity style={styles.primaryBtn} onPress={handleAddStudentProfile}>
                <Text style={styles.primaryBtnText}>Create Student Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setFormView('none')}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    );
  }

  // Default — show current role badge and add button
  let currentRoleLabel = '';
  let addRoleLabel = '';
  let targetForm: FormView = 'none';

  if (auth.user.hasStudentProfile) {
    currentRoleLabel = 'Student';
    addRoleLabel = 'Add Tutor Profile';
    targetForm = 'addTutor';
  } else {
    currentRoleLabel = 'Tutor';
    addRoleLabel = 'Add Student Profile';
    targetForm = 'addStudent';
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Current Role</Text>
      <View style={styles.badgeRow}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{currentRoleLabel}</Text>
        </View>
        <TouchableOpacity onPress={() => setFormView(targetForm)}>
          <Text style={styles.addLink}>{addRoleLabel}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  label: {
    fontSize: 13,
    color: COLORS.darkGray,
    marginBottom: 8,
    fontWeight: '500',
  },
  formTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: 4,
  },
  toggle: {
    flexDirection: 'row',
    backgroundColor: COLORS.lightGray,
    borderRadius: 10,
    padding: 3,
  },
  option: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeOption: {
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.darkGray,
  },
  activeText: {
    color: COLORS.red,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  badge: {
    backgroundColor: '#FEE2E6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeText: {
    color: COLORS.red,
    fontWeight: '700',
    fontSize: 13,
  },
  addLink: {
    color: COLORS.red,
    fontWeight: '600',
    fontSize: 13,
    textDecorationLine: 'underline',
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
  formBtns: {
    marginTop: 20,
    gap: 10,
  },
  primaryBtn: {
    backgroundColor: COLORS.red,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
  },
  cancelBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.medGray,
  },
  cancelBtnText: {
    color: COLORS.darkGray,
    fontSize: 15,
    fontWeight: '600',
  },
});

export default RoleSwitch;