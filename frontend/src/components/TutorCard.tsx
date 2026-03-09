import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';
import Avatar from './Avatar';
import StarRating from './StarRating';
import Tag from './Tag';

type Tutor = {
  id: string;
  firstName: string;
  lastName: string;
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

type TutorCardProps = {
  tutor: Tutor;
  onPress: () => void;
};

function TutorCard(props: TutorCardProps) {
  const tutor = props.tutor;
  const name = tutor.firstName + ' ' + tutor.lastName;

  let modeTagType = 'blue';
  if (tutor.mode === 'In-Person') {
    modeTagType = 'green';
  } else if (tutor.mode === 'Both') {
    modeTagType = 'yellow';
  }

  return (
    <TouchableOpacity style={styles.card} onPress={props.onPress} activeOpacity={0.9}>
      <View style={styles.row}>
        <Avatar initials={tutor.avatar} bg={tutor.avatarBg} size={52} />
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{name}</Text>
          </View>
          <Text style={styles.year}>{tutor.year} · {tutor.rate}</Text>
          <StarRating rating={tutor.rating} />
        </View>
        <Tag text={tutor.mode} type={modeTagType} />
      </View>

      {/* TODO: replace temp courses with tutor.coursesOffered from backend */}
      <View style={styles.courses}>
        {tutor.courses.slice(0, 3).map(function(course) {
          return (
            <View key={course} style={styles.courseTag}>
              <Text style={styles.courseText}>{course}</Text>
            </View>
          );
        })}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  info: {
    flex: 1,
    gap: 3,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.black,
  },
  year: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  courses: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  courseTag: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  courseText: {
    fontSize: 11,
    color: COLORS.darkGray,
    fontWeight: '500',
  },
});

export default TutorCard;
