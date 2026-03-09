import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { COLORS } from '../constants/colors';
import { useAuth } from '../context/AuthContext';
import { getUserProfiles } from '../services/profileService';

function RoleSwitch() {
  const auth = useAuth();
  const [loading, setLoading] = useState(false);

  // If nobody is logged in, show nothing
  if (auth.user.id === '') {
    return null;
  }

  // If the user has both profiles, show the toggle
  if (auth.user.hasStudentProfile && auth.user.hasTutorProfile) {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>Switch Role</Text>
        <View style={styles.toggle}>
          <TouchableOpacity
            style={[
              styles.option,
              auth.activeRole === 'STUDENT' && styles.activeOption,
            ]}
            onPress={function() { auth.setActiveRole('STUDENT'); }}
          >
            <Text style={[
              styles.optionText,
              auth.activeRole === 'STUDENT' && styles.activeText,
            ]}>
              Student
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.option,
              auth.activeRole === 'TUTOR' && styles.activeOption,
            ]}
            onPress={function() { auth.setActiveRole('TUTOR'); }}
          >
            <Text style={[
              styles.optionText,
              auth.activeRole === 'TUTOR' && styles.activeText,
            ]}>
              Tutor
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // If only one profile exists, show badge and option to add the other
  let currentRoleLabel = '';
  let addRoleLabel = '';

  if (auth.user.hasStudentProfile) {
    currentRoleLabel = 'Student';
    addRoleLabel = 'Add Tutor Profile';
  } else {
    currentRoleLabel = 'Tutor';
    addRoleLabel = 'Add Student Profile';
  }

  async function handleAddProfile() {
    setLoading(true);
    try {
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
      auth.setUser(updated);
      Alert.alert('Profile Added', 'Your new profile has been added.');
    } catch (err) {
      Alert.alert('Error', 'Could not load profiles. Please try again.');
    }
    setLoading(false);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Current Role</Text>
      <View style={styles.badgeRow}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{currentRoleLabel}</Text>
        </View>
        {loading ? (
          <ActivityIndicator color={COLORS.red} />
        ) : (
          <TouchableOpacity onPress={handleAddProfile}>
            <Text style={styles.addLink}>{addRoleLabel}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    fontSize: 13,
    color: COLORS.darkGray,
    marginBottom: 8,
    fontWeight: '500',
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
});

export default RoleSwitch;
