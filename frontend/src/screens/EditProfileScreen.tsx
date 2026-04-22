import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { COLORS } from '../constants/colors';
import { useAuth } from '../context/AuthContext';
import { updateStudentProfile, updateTutorProfile, getUserProfiles } from '../services/profileService';
import CoursePicker from '../components/CoursePicker';
import { ProfileStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<ProfileStackParamList, 'EditProfile'>;

function EditProfileScreen({ navigation }: Props) {
  const auth = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [major, setMajor] = useState('');
  const [bio, setBio] = useState('');

  const [expectedGraduation, setExpectedGraduation] = useState('');

  const [hourlyRate, setHourlyRate] = useState('');
  const [onlineAvail, setOnlineAvail] = useState(false);
  const [inPersonAvail, setInPersonAvail] = useState(false);
  const [selectedCourseIds, setSelectedCourseIds] = useState<number[]>([]);

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      try {
        if (auth.activeRole === 'STUDENT' && auth.user.studentProfile) {
          const sp = auth.user.studentProfile;
          setMajor(sp.major || '');
          setBio(sp.bio || '');
          setExpectedGraduation(sp.expectedGraduation ? String(sp.expectedGraduation) : '');
        } else if (auth.activeRole === 'TUTOR' && auth.user.tutorProfile) {
          const tp = auth.user.tutorProfile;
          setMajor(tp.major || '');
          setBio(tp.bio || '');
          setHourlyRate(tp.hourlyRate ? String(tp.hourlyRate) : '');
          setOnlineAvail(tp.availableForOnline || false);
          setInPersonAvail(tp.availableForInPerson || false);
          if (tp.coursesOffered && tp.coursesOffered.length > 0) {
            setSelectedCourseIds(tp.coursesOffered.map(c => c.id));
          }
        }
      } catch (error) {
        console.error('Failed to load profile data', error);
        Alert.alert('Error', 'Could not load profile data.');
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [auth.activeRole, auth.user]);

  async function handleSave() {
    if (saving) return;

    if (auth.activeRole === 'STUDENT') {
      if (!major.trim()) {
        Alert.alert('Missing Field', 'Please enter your major.');
        return;
      }
      if (expectedGraduation && (parseInt(expectedGraduation) < 2024 || parseInt(expectedGraduation) > 2030)) {
        Alert.alert('Invalid Year', 'Please enter a valid graduation year (2024-2030).');
        return;
      }
    } else if (auth.activeRole === 'TUTOR') {
      if (!major.trim()) {
        Alert.alert('Missing Field', 'Please enter your major.');
        return;
      }
      const rate = parseFloat(hourlyRate);
      if (hourlyRate && (isNaN(rate) || rate <= 0)) {
        Alert.alert('Invalid Rate', 'Hourly rate must be a positive number.');
        return;
      }
      if (!onlineAvail && !inPersonAvail) {
        Alert.alert('Missing Availability', 'Please select at least one availability option (Online or In-Person).');
        return;
      }
    }

    setSaving(true);
    try {
      const userId = auth.user.id;

      if (auth.activeRole === 'STUDENT') {
        const payload: any = {
          major: major.trim(),
          bio: bio.trim() || null,
        };
        if (expectedGraduation) {
          payload.expectedGraduation = parseInt(expectedGraduation);
        }
        await updateStudentProfile(userId, payload);
      } else {
        const payload: any = {
          major: major.trim(),
          bio: bio.trim() || null,
          hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null,
          availableForOnline: onlineAvail,
          availableForInPerson: inPersonAvail,
          courseIds: selectedCourseIds,
        };
        await updateTutorProfile(userId, payload);
      }

      const profiles = await getUserProfiles(userId);
      const updatedUser = {
        ...auth.user,
        hasStudentProfile: profiles.studentProfileExists,
        hasTutorProfile: profiles.tutorProfileExists,
        studentProfile: profiles.studentProfile,
        tutorProfile: profiles.tutorProfile,
      };
      auth.setUser(updatedUser, auth.token ?? undefined);

      Alert.alert('Success', 'Profile updated successfully.');
      navigation.goBack();
    } catch (error: any) {
      console.error('Save error', error);
      Alert.alert('Error', error.response?.data || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.red} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>Edit {auth.activeRole === 'STUDENT' ? 'Student' : 'Tutor'} Profile</Text>

      <Text style={styles.label}>Major *</Text>
      <TextInput
        style={styles.input}
        value={major}
        onChangeText={setMajor}
        placeholder="e.g., Information Technology"
        placeholderTextColor={COLORS.darkGray}
      />

      <Text style={styles.label}>Bio</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={bio}
        onChangeText={setBio}
        placeholder="Tell others about yourself..."
        placeholderTextColor={COLORS.darkGray}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />

      {auth.activeRole === 'STUDENT' ? (
        <>
          <Text style={styles.label}>Expected Graduation Year</Text>
          <TextInput
            style={styles.input}
            value={expectedGraduation}
            onChangeText={setExpectedGraduation}
            placeholder="e.g., 2027"
            placeholderTextColor={COLORS.darkGray}
            keyboardType="numeric"
          />
        </>
      ) : (
        <>
          <Text style={styles.label}>Hourly Rate ($)</Text>
          <TextInput
            style={styles.input}
            value={hourlyRate}
            onChangeText={setHourlyRate}
            placeholder="e.g., 20"
            placeholderTextColor={COLORS.darkGray}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Availability</Text>
          <View style={styles.checkRow}>
            <TouchableOpacity
              style={[styles.checkbox, onlineAvail && styles.checkboxActive]}
              onPress={() => setOnlineAvail(!onlineAvail)}
            >
              <Text style={[styles.checkboxText, onlineAvail && styles.checkboxActiveText]}>Online</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.checkbox, inPersonAvail && styles.checkboxActive]}
              onPress={() => setInPersonAvail(!inPersonAvail)}
            >
              <Text style={[styles.checkboxText, inPersonAvail && styles.checkboxActiveText]}>In-Person</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Courses Offered</Text>
          <CoursePicker
            selectedIds={selectedCourseIds}
            onSelectionChange={setSelectedCourseIds}
          />
        </>
      )}

      <TouchableOpacity
        style={[styles.saveBtn, saving && styles.disabledBtn]}
        onPress={handleSave}
        disabled={saving}
      >
        <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save Changes'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.cancelBtnText}>Cancel</Text>
      </TouchableOpacity>
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
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.black,
    borderWidth: 1,
    borderColor: COLORS.medGray,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  checkRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
    marginBottom: 8,
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
  saveBtn: {
    backgroundColor: COLORS.red,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 30,
  },
  saveBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  disabledBtn: {
    opacity: 0.6,
  },
  cancelBtn: {
    marginTop: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: COLORS.darkGray,
    fontSize: 15,
    fontWeight: '600',
  },
});

export default EditProfileScreen;