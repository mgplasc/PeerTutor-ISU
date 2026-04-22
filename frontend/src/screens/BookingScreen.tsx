import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { COLORS } from '../constants/colors';
import Avatar from '../components/Avatar';
import { bookSession } from '../services/sessionService';
import { getAvailableSlotsForTutor, AvailabilitySlotDto } from '../services/availabilityService';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../navigation/AppNavigator';

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

type BookingScreenProps = NativeStackScreenProps<HomeStackParamList, 'Booking'>;

function getUpcomingDates(): { label: string; value: string; dateObj: Date }[] {
  const dates = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  for (let i = 1; i <= 14; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const label = dayNames[d.getDay()] + ' ' + monthNames[d.getMonth()] + ' ' + d.getDate();
    const value = y + '-' + m + '-' + day;
    dates.push({ label, value, dateObj: d });
  }
  return dates;
}

const UPCOMING_DATES = getUpcomingDates();

function BookingScreen({ route, navigation }: BookingScreenProps) {
  const { tutor } = route.params;
  const name = `${tutor.firstName} ${tutor.lastName}`;

  const [selectedDate, setSelectedDate] = useState<{ label: string; value: string; dateObj: Date } | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<AvailabilitySlotDto | null>(null);
  const [selectedMode, setSelectedMode] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [loading, setLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<AvailabilitySlotDto[]>([]);
  const [fetchingSlots, setFetchingSlots] = useState(false);

  const modeOptions: string[] = [];
  if (tutor.mode === 'Online' || tutor.mode === 'Both') modeOptions.push('Online');
  if (tutor.mode === 'In-Person' || tutor.mode === 'Both') modeOptions.push('In-Person');
  if (modeOptions.length === 0) modeOptions.push('Online', 'In-Person');

  useEffect(() => {
    if (selectedDate) {
      loadSlotsForDate(selectedDate.value);
    } else {
      setAvailableSlots([]);
    }
  }, [selectedDate]);

  async function loadSlotsForDate(date: string) {
    setFetchingSlots(true);
    try {
      const slots = await getAvailableSlotsForTutor(tutor.id, date);
      setAvailableSlots(slots);
    } catch (error) {
      console.error('Failed to load slots', error);
      Alert.alert('Error', 'Could not load availability. Please try again.');
      setAvailableSlots([]);
    } finally {
      setFetchingSlots(false);
    }
  }

  async function handleConfirm() {
    if (!selectedDate || !selectedTimeSlot || selectedMode === '' || selectedCourse === '') {
      Alert.alert('Incomplete', 'Please select a date, time slot, mode, and course.');
      return;
    }
    setLoading(true);
    try {
      await bookSession({
        tutorId: tutor.id,
        courseNumber: selectedCourse,
        sessionDate: selectedDate.value,
        sessionTime: selectedTimeSlot.startTime,
        mode: selectedMode,
        availabilitySlotId: selectedTimeSlot.id,
      });
      navigation.navigate('Confirmation', {
        tutor,
        date: selectedDate.label,
        time: formatTime(selectedTimeSlot.startTime),
        mode: selectedMode,
      });
    } catch (err) {
      Alert.alert('Error', 'Could not book session. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function formatTime(time: string) {
    const [hour, minute] = time.split(':');
    const h = parseInt(hour, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayHour = h % 12 || 12;
    return `${displayHour}:${minute} ${ampm}`;
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
        {(tutor.courses || []).map((course: string) => (
          <TouchableOpacity
            key={course}
            style={[styles.optionBtn, selectedCourse === course && styles.optionBtnActive]}
            onPress={() => setSelectedCourse(course)}
          >
            <Text style={[styles.optionText, selectedCourse === course && styles.optionTextActive]}>
              {course}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionLabel}>Select a Date</Text>
      <View style={styles.optionRow}>
        {UPCOMING_DATES.map((date) => (
          <TouchableOpacity
            key={date.value}
            style={[styles.optionBtn, selectedDate?.value === date.value && styles.optionBtnActive]}
            onPress={() => setSelectedDate(date)}
          >
            <Text style={[styles.optionText, selectedDate?.value === date.value && styles.optionTextActive]}>
              {date.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {selectedDate && (
        <>
          <Text style={styles.sectionLabel}>Select a Time Slot</Text>
          {fetchingSlots ? (
            <ActivityIndicator color={COLORS.red} style={{ marginVertical: 16 }} />
          ) : availableSlots.length === 0 ? (
            <Text style={styles.noSlotsText}>No availability for this date.</Text>
          ) : (
            <View style={styles.optionRow}>
              {availableSlots.map((slot) => (
                <TouchableOpacity
                  key={slot.id}
                  style={[styles.optionBtn, selectedTimeSlot?.id === slot.id && styles.optionBtnActive]}
                  onPress={() => setSelectedTimeSlot(slot)}
                >
                  <Text style={[styles.optionText, selectedTimeSlot?.id === slot.id && styles.optionTextActive]}>
                    {formatTime(slot.startTime)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </>
      )}

      <Text style={styles.sectionLabel}>Meeting Mode</Text>
      <View style={styles.optionRow}>
        {modeOptions.map((modeOption) => (
          <TouchableOpacity
            key={modeOption}
            style={[styles.optionBtn, selectedMode === modeOption && styles.optionBtnActive]}
            onPress={() => setSelectedMode(modeOption)}
          >
            <Text style={[styles.optionText, selectedMode === modeOption && styles.optionTextActive]}>
              {modeOption}
            </Text>
          </TouchableOpacity>
        ))}
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
  screen: { flex: 1, backgroundColor: COLORS.lightGray },
  content: { padding: 20 },
  tutorRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.white, borderRadius: 14, padding: 16, marginBottom: 20 },
  tutorName: { fontSize: 16, fontWeight: '700', color: COLORS.black },
  tutorRate: { fontSize: 13, color: COLORS.darkGray, marginTop: 2 },
  sectionLabel: { fontSize: 14, fontWeight: '700', color: COLORS.black, marginBottom: 10, marginTop: 8 },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  optionBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1.5, borderColor: COLORS.medGray, backgroundColor: COLORS.white },
  optionBtnActive: { borderColor: COLORS.red, backgroundColor: '#FEE2E6' },
  optionText: { fontSize: 13, fontWeight: '500', color: COLORS.darkGray },
  optionTextActive: { color: COLORS.red, fontWeight: '700' },
  confirmBtn: { backgroundColor: COLORS.red, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 12, shadowColor: COLORS.red, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 4 },
  confirmBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  spinner: { marginTop: 20 },
  noSlotsText: { fontSize: 13, color: COLORS.darkGray, marginVertical: 8, textAlign: 'center' },
});

export default BookingScreen;