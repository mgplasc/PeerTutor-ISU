import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../navigation/AppNavigator';

type Tutor = {
  firstName: string;
  lastName: string;
  rate: string;
  avatar: string;
  avatarBg: string;
};

type ConfirmationScreenProps = NativeStackScreenProps<HomeStackParamList, 'Confirmation'>;

function ConfirmationScreen({ route, navigation }: ConfirmationScreenProps) {
  const { tutor, date, time, mode } = route.params;
  const name = `${tutor.firstName} ${tutor.lastName}`;

  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.checkmark}>✓</Text>
        <Text style={styles.title}>Request Sent!</Text>
        <Text style={styles.subtitle}>Waiting for tutor confirmation</Text>

        <View style={styles.details}>
          <View style={styles.row}>
            <Text style={styles.label}>Tutor</Text>
            <Text style={styles.value}>{name}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.label}>Date</Text>
            <Text style={styles.value}>{date}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.label}>Time</Text>
            <Text style={styles.value}>{time}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.label}>Mode</Text>
            <Text style={styles.value}>{mode}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.label}>Rate</Text>
            <Text style={styles.value}>{tutor.rate}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.homeBtn}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.homeBtnText}>Back to Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.messagesBtn}
          onPress={() => navigation.getParent()?.navigate('Messages')}
        >
          <Text style={styles.messagesBtnText}>Message Tutor</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  checkmark: {
    fontSize: 48,
    color: COLORS.green,
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.black,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 24,
  },
  details: {
    width: '100%',
    backgroundColor: COLORS.lightGray,
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.medGray,
  },
  label: {
    fontSize: 13,
    color: COLORS.darkGray,
  },
  value: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.black,
  },
  homeBtn: {
    backgroundColor: COLORS.red,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
  },
  homeBtnText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
  },
  messagesBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    width: '100%',
    borderWidth: 2,
    borderColor: COLORS.red,
  },
  messagesBtnText: {
    color: COLORS.red,
    fontSize: 15,
    fontWeight: '700',
  },
});

export default ConfirmationScreen;