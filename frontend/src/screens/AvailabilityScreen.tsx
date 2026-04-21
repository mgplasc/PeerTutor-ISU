import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, Alert, ActivityIndicator,
  Switch,
} from 'react-native';
import { COLORS } from '../constants/colors';
import { useAuth } from '../context/AuthContext';
import { updateTutorProfile } from '../services/profileService';
import CoursePicker from '../components/CoursePicker';

function AvailabilityScreen() {
  const auth = useAuth();
  const tutorProfile = auth.user.tutorProfile;

  const [hourlyRate, setHourlyRate] = useState('');
  const [availableOnline, setAvailableOnline] = useState(false);
  const [availableInPerson, setAvailableInPerson] = useState(false);
  const [selectedCourseIds, setSelectedCourseIds] = useState<number[]>([]);
  const [major, setMajor] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);

  // Load existing tutor profile data
  useEffect(() => {
    if (tutorProfile) {
      setHourlyRate(tutorProfile.hourlyRate?.toString() || '');
      setAvailableOnline(tutorProfile.availableForOnline || false);
      setAvailableInPerson(tutorProfile.availableForInPerson || false);
      setSelectedCourseIds(
        (tutorProfile.coursesOffered || []).map((c: any) => c.id)
      );
      setMajor(tutorProfile.major || '');
      setBio(tutorProfile.bio || '');
    }
  }, [tutorProfile]);

  async function handleSave() {
    const rate = parseFloat(hourlyRate);
    if (isNaN(rate) || rate <= 0) {
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
        hourlyRate: rate,
        availableForOnline: availableOnline,
        availableForInPerson: availableInPerson,
        courseIds: selectedCourseIds,
        major: major.trim(),
        bio: bio.trim(),
      };
      await updateTutorProfile(auth.user.id, payload);

      // Refresh user data (optional: you could refetch profiles)
      Alert.alert('Success', 'Your tutor profile has been updated.');
    } catch (err) {
      Alert.alert('Error', 'Could not update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (!tutorProfile) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>You don't have a tutor profile.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>Hourly Rate ($)</Text>
      <TextInput
        style={styles.input}
        value={hourlyRate}
        onChangeText={setHourlyRate}
        placeholder="e.g. 15"
        keyboardType="numeric"
        placeholderTextColor={COLORS.darkGray}
      />

      <Text style={styles.sectionTitle}>Major</Text>
      <TextInput
        style={styles.input}
        value={major}
        onChangeText={setMajor}
        placeholder="e.g. Information Technology"
        placeholderTextColor={COLORS.darkGray}
      />

      <Text style={styles.sectionTitle}>Bio (optional)</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={bio}
        onChangeText={setBio}
        placeholder="Tell students about your teaching style, experience, etc."
        placeholderTextColor={COLORS.darkGray}
        multiline
        numberOfLines={4}
      />

      <Text style={styles.sectionTitle}>Courses You Tutor</Text>
      <CoursePicker
        selectedIds={selectedCourseIds}
        onSelectionChange={setSelectedCourseIds}
      />

      <Text style={styles.sectionTitle}>Availability</Text>
      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Online</Text>
        <Switch
          value={availableOnline}
          onValueChange={setAvailableOnline}
          trackColor={{ false: COLORS.medGray, true: COLORS.red }}
          thumbColor={COLORS.white}
        />
      </View>
      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>In-Person</Text>
        <Switch
          value={availableInPerson}
          onValueChange={setAvailableInPerson}
          trackColor={{ false: COLORS.medGray, true: COLORS.red }}
          thumbColor={COLORS.white}
        />
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.red} style={styles.spinner} />
      ) : (
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Save Availability</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.lightGray },
  content: { padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: COLORS.red, fontSize: 16 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
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
    minHeight: 80,
    textAlignVertical: 'top',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.medGray,
  },
  switchLabel: {
    fontSize: 14,
    color: COLORS.black,
  },
  saveBtn: {
    backgroundColor: COLORS.red,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  saveBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  spinner: { marginTop: 20 },
});

export default AvailabilityScreen;