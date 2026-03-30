import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from 'react-native';
import { COLORS } from '../constants/colors';
import Avatar from '../components/Avatar';
import RoleSwitch from '../components/RoleSwitch';
import { useAuth } from '../context/AuthContext';

function ProfileScreen() {
  const auth = useAuth();

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
            {tp.coursesOffered.map(function(course) {
              return (
                <View key={String(course.id)} style={styles.courseTag}>
                  <Text style={styles.courseText}>{course.courseNumber}</Text>
                </View>
              );
            })}
          </View>
        </View>
      );
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
});

export default ProfileScreen;
