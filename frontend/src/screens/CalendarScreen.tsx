import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  ActivityIndicator, TouchableOpacity,
} from 'react-native';
import { COLORS } from '../constants/colors';
import Avatar from '../components/Avatar';
import { getSessionsForUser } from '../services/sessionService';
import { useAuth } from '../context/AuthContext';

type SessionTutor = {
  firstName: string;
  lastName: string;
  avatar: string;
  avatarBg: string;
};

type Session = {
  id: string;
  tutor: SessionTutor;
  course: string;
  date: string;
  time: string;
  mode: string;
  status: string;
};

type FilterType = 'upcoming' | 'completed';

function CalendarScreen() {
  const auth = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('upcoming');

  useEffect(function() {
    loadSessions();
  }, []);

  async function loadSessions() {
    setLoading(true);
    try {
      const data = await getSessionsForUser(auth.user.id);
      setSessions(data);
    } catch (err) {
      setSessions([]);
    }
    setLoading(false);
  }

  const filtered = sessions.filter(function(s: Session) {
    return s.status === filter;
  });

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Sessions</Text>
      </View>

      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterBtn, filter === 'upcoming' && styles.filterBtnActive]}
          onPress={function() { setFilter('upcoming'); }}
        >
          <Text style={[styles.filterText, filter === 'upcoming' && styles.filterTextActive]}>
            Upcoming
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterBtn, filter === 'completed' && styles.filterBtnActive]}
          onPress={function() { setFilter('completed'); }}
        >
          <Text style={[styles.filterText, filter === 'completed' && styles.filterTextActive]}>
            Past
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.red} style={styles.spinner} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={function(item: Session) { return item.id; }}
          contentContainerStyle={styles.list}
          renderItem={function({ item }: { item: Session }) {
            const tutorName = item.tutor.firstName + ' ' + item.tutor.lastName;
            const isOnline = item.mode === 'Online';
            return (
              <View style={styles.sessionCard}>
                <View style={styles.cardLeft}>
                  <Avatar initials={item.tutor.avatar} bg={item.tutor.avatarBg} size={44} />
                  <View style={styles.cardInfo}>
                    <Text style={styles.tutorName}>{tutorName}</Text>
                    <Text style={styles.course}>{item.course}</Text>
                    <Text style={styles.dateTime}>{item.date} · {item.time}</Text>
                  </View>
                </View>
                <View style={[
                  styles.modeBadge,
                  isOnline ? styles.modeBadgeOnline : styles.modeBadgeInPerson,
                ]}>
                  <Text style={[
                    styles.modeText,
                    isOnline ? styles.modeTextOnline : styles.modeTextInPerson,
                  ]}>
                    {item.mode}
                  </Text>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <Text style={styles.empty}>No {filter} sessions.</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
  },
  header: {
    backgroundColor: COLORS.red,
    padding: 20,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.white,
  },
  filterRow: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
  },
  filterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.medGray,
  },
  filterBtnActive: {
    backgroundColor: COLORS.red,
    borderColor: COLORS.red,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.darkGray,
  },
  filterTextActive: {
    color: COLORS.white,
  },
  spinner: {
    marginTop: 40,
  },
  list: {
    padding: 12,
    paddingTop: 4,
  },
  sessionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  cardInfo: {
    flex: 1,
  },
  tutorName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.black,
  },
  course: {
    fontSize: 13,
    color: COLORS.darkGray,
    marginTop: 2,
  },
  dateTime: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginTop: 2,
  },
  modeBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  modeBadgeOnline: {
    backgroundColor: '#DBEAFE',
  },
  modeBadgeInPerson: {
    backgroundColor: '#D1FAE5',
  },
  modeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  modeTextOnline: {
    color: '#1E40AF',
  },
  modeTextInPerson: {
    color: '#065F46',
  },
  empty: {
    textAlign: 'center',
    color: COLORS.darkGray,
    marginTop: 40,
    fontSize: 14,
  },
});

export default CalendarScreen;
