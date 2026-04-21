import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { COLORS } from '../constants/colors';
import Avatar from '../components/Avatar';
import { bookSession } from '../services/sessionService';

type Tutor = {
  id: string;
  firstName: string;
  lastName: string;
  rate: string;
  avatar: string;
  avatarBg: string;
  courses: string[];
  mode: string;
};

type BookingScreenProps = {
  route: {
    params: {
      tutor: Tutor;
    };
  };
  navigation: {
    navigate: (screen: string, params: object) => void;
  };
};

// Generate the next 7 days starting from tomorrow
function getUpcomingDates(): { label: string; value: string }[] {
  const dates = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  for (let i = 1; i <= 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const label = dayNames[d.getDay()] + ' ' + monthNames[d.getMonth()] + ' ' + d.getDate();
    const value = y + '-' + m + '-' + day;
    dates.push({ label, value });
  }
  return dates;
}

const UPCOMING_DATES = getUpcomingDates();

// Display label → ISO HH:mm value for LocalTime.parse()
const TIME_SLOTS: { label: string; value: string }[] = [
  { label: '9:00 AM',  value: '09:00' },
  { label: '10:00 AM', value: '10:00' },
  { label: '11:00 AM', value: '11:00' },
  { label: '1:00 PM',  value: '13:00' },
  { label: '2:00 PM',  value: '14:00' },
  { label: '3:00 PM',  value: '15:00' },
  { label: '4:00 PM',  value: '16:00' },
];

function BookingScreen({ route, navigation }: BookingScreenProps) {
  const tutor = route.params.tutor;
  const name = tutor.firstName + ' ' + tutor.lastName;

  const [selectedDate, setSelectedDate] = useState<{ label: string; value: string } | null>(null);
  const [selectedTime, setSelectedTime] = useState<{ label: string; value: string } | null>(null);
  const [selectedMode, setSelectedMode] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [loading, setLoading] = useState(false);

  // Only show mode options the tutor actually supports
  const modeOptions: string[] = [];
  if (tutor.mode === 'Online' || tutor.mode === 'Both') { modeOptions.push('Online'); }
  if (tutor.mode === 'In-Person' || tutor.mode === 'Both') { modeOptions.push('In-Person'); }
  if (modeOptions.length === 0) { modeOptions.push('Online', 'In-Person'); }

  async function handleConfirm() {
    if (!selectedDate || !selectedTime || selectedMode === '' || selectedCourse === '') {
      Alert.alert('Incomplete', 'Please select a date, time, mode, and course.');
      return;
    }
    setLoading(true);
    try {
      await bookSession({
        tutorId: tutor.id,
        courseNumber: selectedCourse,
        sessionDate: selectedDate.value,
        sessionTime: selectedTime.value,
        mode: selectedMode,
      });
      navigation.navigate('Confirmation', {
        tutor,
        date: selectedDate.label,
        time: selectedTime.label,
        mode: selectedMode,
        course: selectedCourse,
      });
    } catch (err) {
      Alert.alert('Error', 'Could not book session. Please try again.');
    }
    setLoading(false);
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.tutorRow}>
        <Avatar initials={tutor.avatar} bg={tutor.avatarBg} size={48} />
        <View>
          <Text style={styles.tutorName}>{name}</Text>
          <Text style={styles.tutorRate}>{tutor.rate}</Text>
        </View>
      </View>

      <Text style={styles.sectionLabel}>Select a Course</Text>
      <View style={styles.optionRow}>
        {tutor.courses.map(function(course) {
          const isSelected = selectedCourse === course;
          return (
            <TouchableOpacity
              key={course}
              style={[styles.optionBtn, isSelected && styles.optionBtnActive]}
              onPress={function() { setSelectedCourse(course); }}
            >
              <Text style={[styles.optionText, isSelected && styles.optionTextActive]}>{course}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.sectionLabel}>Select a Date</Text>
      <View style={styles.optionRow}>
        {UPCOMING_DATES.map(function(date) {
          const isSelected = selectedDate?.value === date.value;
          return (
            <TouchableOpacity
              key={date.value}
              style={[styles.optionBtn, isSelected && styles.optionBtnActive]}
              onPress={function() { setSelectedDate(date); }}
            >
              <Text style={[styles.optionText, isSelected && styles.optionTextActive]}>{date.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.sectionLabel}>Select a Time</Text>
      <View style={styles.optionRow}>
        {TIME_SLOTS.map(function(slot) {
          const isSelected = selectedTime?.value === slot.value;
          return (
            <TouchableOpacity
              key={slot.value}
              style={[styles.optionBtn, isSelected && styles.optionBtnActive]}
              onPress={function() { setSelectedTime(slot); }}
            >
              <Text style={[styles.optionText, isSelected && styles.optionTextActive]}>{slot.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.sectionLabel}>Meeting Mode</Text>
      <View style={styles.optionRow}>
        {modeOptions.map(function(modeOption) {
          const isSelected = selectedMode === modeOption;
          return (
            <TouchableOpacity
              key={modeOption}
              style={[styles.optionBtn, isSelected && styles.optionBtnActive]}
              onPress={function() { setSelectedMode(modeOption); }}
            >
              <Text style={[styles.optionText, isSelected && styles.optionTextActive]}>{modeOption}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.red} style={styles.spinner} />
      ) : (
        <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm} activeOpacity={0.85}>
          <Text style={styles.confirmBtnText}>Send Booking Request</Text>
        </TouchableOpacity>
      )}
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
  tutorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },
  tutorName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.black,
  },
  tutorRate: {
    fontSize: 13,
    color: COLORS.darkGray,
    marginTop: 2,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: 10,
    marginTop: 8,
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  optionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.medGray,
    backgroundColor: COLORS.white,
  },
  optionBtnActive: {
    borderColor: COLORS.red,
    backgroundColor: '#FEE2E6',
  },
  optionText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.darkGray,
  },
  optionTextActive: {
    color: COLORS.red,
    fontWeight: '700',
  },
  confirmBtn: {
    backgroundColor: COLORS.red,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: COLORS.red,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  confirmBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  spinner: {
    marginTop: 20,
  },
});

export default BookingScreen;
