import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { COLORS } from '../constants/colors';
import Avatar from '../components/Avatar';
import StarRating from '../components/StarRating';
import Tag from '../components/Tag';
import { getTutorById } from '../services/tutorService';

// Define the param list for the stack that includes TutorProfile
type HomeStackParamList = {
  Home: undefined;
  TutorProfile: { tutorId: string };
  Booking: { tutor: Tutor };
  Confirmation: undefined;
  // add other screens in this stack if needed
};

// Use the correct props type for a native stack screen
type TutorProfileScreenProps = NativeStackScreenProps<HomeStackParamList, 'TutorProfile'>;

// Tutor type (can be moved to a shared types file)
type Tutor = {
  id: string;
  firstName: string;
  lastName: string;
  major: string;
  bio: string;
  courses: string[];
  rating: number;
  reviews: number;
  rate: string;
  mode: string;
  available: boolean;
  avatar: string;
  avatarBg: string;
  year: string;
};

function TutorProfileScreen({ route, navigation }: TutorProfileScreenProps) {
  const { tutorId } = route.params;
  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTutor() {
      try {
        const data = await getTutorById(tutorId);
        setTutor(data);
      } catch (err) {
        console.error('Failed to fetch tutor:', err);
        setError('Could not load tutor details. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    fetchTutor();
  }, [tutorId]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.red} />
      </View>
    );
  }

  if (error || !tutor) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error || 'Tutor not found.'}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const name = `${tutor.firstName} ${tutor.lastName}`;

  let modeTagType = 'blue';
  if (tutor.mode === 'In-Person') modeTagType = 'green';
  else if (tutor.mode === 'Both') modeTagType = 'yellow';

  const availabilityTag = tutor.available ? (
    <Tag text="Available" type="green" />
  ) : (
    <Tag text="Unavailable" type="red" />
  );

  const handleBook = () => {
    navigation.navigate('Booking', { tutor });
  };

  return (
    <ScrollView style={styles.screen}>
      <View style={styles.heroCard}>
        <Avatar initials={tutor.avatar} bg={tutor.avatarBg} size={80} />
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.year}>
          {tutor.year} · {tutor.major}
        </Text>
        <View style={styles.tagRow}>
          <Tag text={tutor.mode} type={modeTagType} />
          {availabilityTag}
        </View>
        <StarRating rating={tutor.rating} />
        <Text style={styles.reviews}>{tutor.reviews} reviews</Text>
        <Text style={styles.rate}>{tutor.rate}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.bio}>{tutor.bio || 'No bio provided yet.'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Courses</Text>
        <View style={styles.courseList}>
          {tutor.courses.map((course) => (
            <View key={course} style={styles.courseTag}>
              <Text style={styles.courseText}>{course}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.bookSection}>
        <TouchableOpacity
          style={styles.bookBtn}
          onPress={handleBook}
          activeOpacity={0.85}
        >
          <Text style={styles.bookBtnText}>Book a Session</Text>
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.darkGray,
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: COLORS.red,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: COLORS.white,
    fontWeight: '600',
  },
  heroCard: {
    backgroundColor: COLORS.white,
    alignItems: 'center',
    padding: 28,
    gap: 6,
  },
  name: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.black,
    marginTop: 8,
  },
  year: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  tagRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 4,
  },
  reviews: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  rate: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.red,
  },
  section: {
    backgroundColor: COLORS.white,
    marginTop: 10,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: 8,
  },
  bio: {
    fontSize: 14,
    color: COLORS.darkGray,
    lineHeight: 20,
  },
  courseList: {
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
    fontSize: 13,
    color: COLORS.darkGray,
    fontWeight: '500',
  },
  bookSection: {
    padding: 20,
    paddingBottom: 40,
  },
  bookBtn: {
    backgroundColor: COLORS.red,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: COLORS.red,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  bookBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default TutorProfileScreen;