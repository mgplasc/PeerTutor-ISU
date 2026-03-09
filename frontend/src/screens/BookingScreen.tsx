import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { COLORS } from '../constants/colors';
import Avatar from '../components/Avatar';
import { bookSession } from '../services/sessionService';

// TODO: replace with real time slots from tutor's availability
const TIME_SLOTS = ['9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'];

// TODO: replace with generated dates based on tutor availability
const DATES = ['Mon Mar 10', 'Tue Mar 11', 'Wed Mar 12', 'Thu Mar 13', 'Fri Mar 14'];

type Tutor = {
  id: string;
  firstName: string;
  lastName: string;
  rate: string;
  avatar: string;
  avatarBg: string;
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

function BookingScreen({ route, navigation }: BookingScreenProps) {
  const tutor = route.params.tutor;
  const name = tutor.firstName + ' ' + tutor.lastName;

  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedMode, setSelectedMode] = useState('');
  // TODO: add course selection (student should pick which of the tutor's courses to book for)
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    if (selectedDate === '' || selectedTime === '' || selectedMode === '') {
      Alert.alert('Incomplete', 'Please select a date, time, and meeting mode.');
      return;
    }
    setLoading(true);
    try {
      // TODO: replace with POST /api/sessions
      await bookSession({
        tutorId: tutor.id,
        date: selectedDate,
        time: selectedTime,
        mode: selectedMode,
      });
      navigation.navigate('Confirmation', {
        tutor: tutor,
        date: selectedDate,
        time: selectedTime,
        mode: selectedMode,
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

      <Text style={styles.sectionLabel}>Select a Date</Text>
      {/* TODO: replace temp dates with tutor's available dates */}
      <View style={styles.optionRow}>
        {DATES.map(function(date) {
          const isSelected = selectedDate === date;
          return (
            <TouchableOpacity
              key={date}
              style={[styles.optionBtn, isSelected && styles.optionBtnActive]}
              onPress={function() { setSelectedDate(date); }}
            >
              <Text style={[styles.optionText, isSelected && styles.optionTextActive]}>
                {date}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.sectionLabel}>Select a Time</Text>
      {/* TODO: replace temp time slots with tutor's available times  */}
      <View style={styles.optionRow}>
        {TIME_SLOTS.map(function(slot) {
          const isSelected = selectedTime === slot;
          return (
            <TouchableOpacity
              key={slot}
              style={[styles.optionBtn, isSelected && styles.optionBtnActive]}
              onPress={function() { setSelectedTime(slot); }}
            >
              <Text style={[styles.optionText, isSelected && styles.optionTextActive]}>
                {slot}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.sectionLabel}>Meeting Mode</Text>
      <View style={styles.optionRow}>
        {['Online', 'In-Person'].map(function(modeOption) {
          const isSelected = selectedMode === modeOption;
          return (
            <TouchableOpacity
              key={modeOption}
              style={[styles.optionBtn, isSelected && styles.optionBtnActive]}
              onPress={function() { setSelectedMode(modeOption); }}
            >
              <Text style={[styles.optionText, isSelected && styles.optionTextActive]}>
                {modeOption}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.red} style={styles.spinner} />
      ) : (
        <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm} activeOpacity={0.85}>
          <Text style={styles.confirmBtnText}>Confirm Booking</Text>
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
