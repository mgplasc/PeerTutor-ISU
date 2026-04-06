import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from 'react-native';
import { COLORS } from '../constants/colors';
import Avatar from '../components/Avatar';
import StarRating from '../components/StarRating';
import Tag from '../components/Tag';

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

type TutorProfileScreenProps = {
  route: {
    params: {
      tutor: Tutor;
    };
  };
  navigation: {
    navigate: (screen: string, params: object) => void;
  };
};

function TutorProfileScreen({ route, navigation }: TutorProfileScreenProps) {
  const tutor = route.params.tutor;
  const name = tutor.firstName + ' ' + tutor.lastName;

  let modeTagType = 'blue';
  if (tutor.mode === 'In-Person') {
    modeTagType = 'green';
  } else if (tutor.mode === 'Both') {
    modeTagType = 'yellow';
  }

  const availabilityTag = tutor.available
    ? <Tag text="Available" type="green" />
    : <Tag text="Unavailable" type="red" />;

  function handleBook() {
    navigation.navigate('Booking', { tutor: tutor });
  }

  return (
    <ScrollView style={styles.screen}>
      <View style={styles.heroCard}>
        <Avatar initials={tutor.avatar} bg={tutor.avatarBg} size={80} />
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.year}>{tutor.year} · {tutor.major}</Text>
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
        <Text style={styles.bio}>{tutor.bio}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Courses</Text>
        {/* TODO: Replace with tutor.coursesOffered from backend */}
        <View style={styles.courseList}>
          {tutor.courses.map(function(course: string) {
            return (
              <View key={course} style={styles.courseTag}>
                <Text style={styles.courseText}>{course}</Text>
              </View>
            );
          })}
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
