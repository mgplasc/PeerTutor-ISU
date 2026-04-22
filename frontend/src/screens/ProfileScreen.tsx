import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS } from '../constants/colors';
import Avatar from '../components/Avatar';
import RoleSwitch from '../components/RoleSwitch';
import { useAuth } from '../context/AuthContext';
import { deleteAccount } from '../services/authService';
import { getUserProfiles } from '../services/profileService';
import { ProfileStackParamList } from '../navigation/AppNavigator';

type ProfileScreenNavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'Profile'>;

function ProfileScreen() {
  const auth = useAuth();
  const [deleting, setDeleting] = useState(false);
  const navigation = useNavigation<ProfileScreenNavigationProp>();

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => navigation.navigate('EditProfile')} style={{ marginRight: 15 }}>
          <Text style={{ color: COLORS.white, fontSize: 16, fontWeight: '600' }}>Edit</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  if (auth.user.id === '') {
    return (
      <View style={styles.centered}>
        <Text style={styles.notLoggedIn}>You are not logged in.</Text>
      </View>
    );
  }

  let major = '';
  let extraLabel = '';
  let extraValue = '';
  let bio = '';

  if (auth.activeRole === 'STUDENT' && auth.user.studentProfile !== null) {
    const sp = auth.user.studentProfile;
    major = sp.major;
    extraLabel = 'Graduation Year';
    extraValue = String(sp.expectedGraduation);
    bio = sp.bio;
  } else if (auth.activeRole === 'TUTOR' && auth.user.tutorProfile !== null) {
    const tp = auth.user.tutorProfile;
    major = tp.major;
    extraLabel = 'Hourly Rate';
    extraValue = '$' + tp.hourlyRate + '/hr';
    bio = tp.bio;
  }

  let coursesSection = null;
  if (auth.activeRole === 'TUTOR' && auth.user.tutorProfile !== null) {
    const tp = auth.user.tutorProfile;
    if (tp.coursesOffered !== null && tp.coursesOffered.length > 0) {
      coursesSection = (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Courses Offered</Text>
          <View style={styles.courseRow}>
            {tp.coursesOffered.map((course: any) => (
              <View key={String(course.id)} style={styles.courseTag}>
                <Text style={styles.courseText}>{course.courseNumber}</Text>
              </View>
            ))}
          </View>
        </View>
      );
    }
  }

  function handleDeleteProfile() {
    const hasBoth = auth.user.hasStudentProfile && auth.user.hasTutorProfile;

    if (hasBoth) {
      Alert.alert(
        'Delete Profile',
        'You have both a student and tutor profile. What would you like to delete?',
        [
          { text: 'Student Profile', onPress: () => confirmDelete('STUDENT') },
          { text: 'Tutor Profile', onPress: () => confirmDelete('TUTOR') },
          { text: 'Both (Delete Account)', onPress: () => confirmDelete('BOTH') },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    } else {
      const profileName = auth.user.hasStudentProfile ? 'student' : 'tutor';
      Alert.alert(
        'Delete Account',
        `Are you sure you want to delete your ${profileName} profile? This will permanently remove all your data.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', onPress: () => confirmDelete('BOTH'), style: 'destructive' },
        ]
      );
    }
  }

  async function confirmDelete(type: 'STUDENT' | 'TUTOR' | 'BOTH') {
    setDeleting(true);
    try {
      await deleteAccount(type);

      if (type === 'BOTH') {
        auth.logout();
      } else {
        const profiles = await getUserProfiles(auth.user.id);
        const updatedUser = {
          ...auth.user,
          hasStudentProfile: profiles.studentProfileExists,
          hasTutorProfile: profiles.tutorProfileExists,
          studentProfile: profiles.studentProfile,
          tutorProfile: profiles.tutorProfile,
        };
        auth.setUser(updatedUser, auth.token ?? undefined);

        if ((type === 'STUDENT' && auth.activeRole === 'STUDENT') ||
            (type === 'TUTOR' && auth.activeRole === 'TUTOR')) {
          const newRole = type === 'STUDENT' ? 'TUTOR' : 'STUDENT';
          auth.setActiveRole(newRole);
        }

        Alert.alert('Success', `${type} profile deleted successfully.`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to delete profile. Please try again.');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <ScrollView style={styles.screen}>
      <View style={styles.headerBand}>
        <Avatar initials={auth.initials} bg={COLORS.red} size={72} />
        <Text style={styles.name}>{auth.displayName}</Text>
        <Text style={styles.email}>{auth.user.email}</Text>
        {auth.user.emailVerified ? (
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>✓ Verified</Text>
          </View>
        ) : (
          <View style={styles.unverifiedBadge}>
            <Text style={styles.unverifiedText}>Email not verified</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <RoleSwitch />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile Info</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Major</Text>
          <Text style={styles.infoValue}>{major !== '' ? major : '—'}</Text>
        </View>
        {extraLabel !== '' ? (
          <View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{extraLabel}</Text>
              <Text style={styles.infoValue}>{extraValue}</Text>
            </View>
          </View>
        ) : null}
        {bio !== '' ? (
          <View>
            <View style={styles.divider} />
            <View style={styles.infoColumn}>
              <Text style={styles.infoLabel}>Bio</Text>
              <Text style={styles.bioText}>{bio}</Text>
            </View>
          </View>
        ) : null}
      </View>

      {coursesSection}

      <View style={styles.section}>
        <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteProfile} disabled={deleting}>
          <Text style={styles.deleteText}>{deleting ? 'Deleting...' : 'Delete Profile'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutBtn} onPress={auth.logout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notLoggedIn: {
    color: COLORS.darkGray,
    fontSize: 16,
  },
  headerBand: {
    backgroundColor: COLORS.red,
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 28,
    gap: 6,
  },
  name: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.white,
    marginTop: 8,
  },
  email: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },
  verifiedBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: 4,
  },
  verifiedText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  unverifiedBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: 4,
  },
  unverifiedText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  section: {
    backgroundColor: COLORS.white,
    marginTop: 10,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  infoColumn: {
    paddingVertical: 6,
  },
  infoLabel: {
    fontSize: 13,
    color: COLORS.darkGray,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.black,
  },
  bioText: {
    fontSize: 13,
    color: COLORS.darkGray,
    marginTop: 4,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.lightGray,
  },
  courseRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  courseTag: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  courseText: {
    fontSize: 12,
    color: COLORS.darkGray,
    fontWeight: '500',
  },
  logoutBtn: {
    borderWidth: 2,
    borderColor: COLORS.red,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  logoutText: {
    color: COLORS.red,
    fontSize: 15,
    fontWeight: '700',
  },
  deleteBtn: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  deleteText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
  },
});

export default ProfileScreen;