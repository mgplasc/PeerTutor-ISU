import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  ActivityIndicator, TouchableOpacity, ScrollView, Dimensions,
} from 'react-native';
import { COLORS } from '../constants/colors';
import { getSessionsForUser, confirmSession, declineSession, SessionDto } from '../services/sessionService';
import { useAuth } from '../context/AuthContext';

type CalendarMode = 'list' | 'week' | 'month';
type StatusFilter = 'all' | 'upcoming' | 'pending' | 'completed';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const SCREEN_WIDTH = Dimensions.get('window').width;
const CELL_WIDTH = Math.floor((SCREEN_WIDTH - 24) / 7);

function CalendarScreen() {
  const auth = useAuth();
  const [sessions, setSessions] = useState<SessionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [calendarMode, setCalendarMode] = useState<CalendarMode>('list');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('upcoming');
  const [currentDate, setCurrentDate] = useState(new Date());

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

  function getFilteredSessions() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return sessions.filter(function(s) {
      if (statusFilter === 'upcoming') {
        const d = new Date(s.sessionDate);
        return (s.status === 'CONFIRMED' || s.status === 'PENDING') && d >= today;
      }
      if (statusFilter === 'pending') { return s.status === 'PENDING'; }
      if (statusFilter === 'completed') {
        return s.status === 'COMPLETED' || s.status === 'DECLINED';
      }
      return true;
    });
  }

  function getSessionsForDate(dateStr: string) {
    return sessions.filter(function(s) { return s.sessionDate === dateStr; });
  }

  function formatDateStr(date: Date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + d;
  }

  function getStatusColor(status: string) {
    if (status === 'CONFIRMED') { return COLORS.green; }
    if (status === 'PENDING') { return COLORS.warning; }
    if (status === 'DECLINED') { return COLORS.error; }
    if (status === 'COMPLETED') { return COLORS.darkGray; }
    return COLORS.darkGray;
  }

  function getStatusLabel(status: string) {
    if (status === 'CONFIRMED') { return 'Confirmed'; }
    if (status === 'PENDING') { return 'Pending'; }
    if (status === 'DECLINED') { return 'Declined'; }
    if (status === 'COMPLETED') { return 'Completed'; }
    return status;
  }

  function getOtherPersonName(session: SessionDto) {
    const myId = auth.user.id;
    if (session.studentId === myId) {
      return (session.tutorFirstName || '') + ' ' + (session.tutorLastName || '');
    }
    return (session.studentFirstName || '') + ' ' + (session.studentLastName || '');
  }

  async function handleConfirm(sessionId: string) {
    try {
      await confirmSession(sessionId);
      loadSessions();
    } catch {
      // silently refresh so UI stays consistent
      loadSessions();
    }
  }

  async function handleDecline(sessionId: string) {
    try {
      await declineSession(sessionId);
      loadSessions();
    } catch {
      loadSessions();
    }
  }

  // SESSION CARD
  function renderSessionCard(session: SessionDto) {
    const otherName = getOtherPersonName(session);
    const statusColor = getStatusColor(session.status);
    const isTutor = session.tutorId === auth.user.id;
    const showActions = isTutor && session.status === 'PENDING';

    return (
      <View key={session.id} style={styles.sessionCard}>
        <View style={[styles.sessionStatusBar, { backgroundColor: statusColor }]} />
        <View style={styles.sessionContent}>
          <View style={styles.sessionTopRow}>
            <Text style={styles.sessionCourse}>{session.courseNumber}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusColor + '22' }]}>
              <Text style={[styles.statusBadgeText, { color: statusColor }]}>
                {getStatusLabel(session.status)}
              </Text>
            </View>
          </View>
          <Text style={styles.sessionPerson}>{otherName.trim()}</Text>
          <Text style={styles.sessionDateTime}>
            {session.sessionDate} · {session.sessionTime} · {session.mode}
          </Text>
          {showActions && (
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.acceptBtn}
                onPress={function() { handleConfirm(session.id); }}
                activeOpacity={0.8}
              >
                <Text style={styles.acceptBtnText}>Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.declineBtn}
                onPress={function() { handleDecline(session.id); }}
                activeOpacity={0.8}
              >
                <Text style={styles.declineBtnText}>Decline</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  }

  // WEEK VIEW
  function getWeekDates(baseDate: Date) {
    const start = new Date(baseDate);
    start.setDate(start.getDate() - start.getDay());
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      dates.push(d);
    }
    return dates;
  }

  function renderWeekView() {
    const weekDates = getWeekDates(currentDate);
    const todayStr = formatDateStr(new Date());

    // Collect all sessions for this week for the list below the grid
    const weekSessions: { date: Date; dateStr: string; sessions: SessionDto[] }[] = [];
    weekDates.forEach(function(date) {
      const dateStr = formatDateStr(date);
      const daySessions = getSessionsForDate(dateStr);
      if (daySessions.length > 0) {
        weekSessions.push({ date, dateStr, sessions: daySessions });
      }
    });

    return (
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.calNavRow}>
          <TouchableOpacity
            style={styles.calNavBtn}
            onPress={function() {
              const d = new Date(currentDate);
              d.setDate(d.getDate() - 7);
              setCurrentDate(d);
            }}
          >
            <Text style={styles.calNavText}>‹ Prev</Text>
          </TouchableOpacity>
          <Text style={styles.calNavTitle}>
            {MONTHS[weekDates[0].getMonth()].slice(0, 3)} {weekDates[0].getDate()} –{' '}
            {MONTHS[weekDates[6].getMonth()].slice(0, 3)} {weekDates[6].getDate()},{' '}
            {weekDates[6].getFullYear()}
          </Text>
          <TouchableOpacity
            style={styles.calNavBtn}
            onPress={function() {
              const d = new Date(currentDate);
              d.setDate(d.getDate() + 7);
              setCurrentDate(d);
            }}
          >
            <Text style={styles.calNavText}>Next ›</Text>
          </TouchableOpacity>
        </View>

        {/* Week grid */}
        <View style={styles.weekGrid}>
          {weekDates.map(function(date) {
            const dateStr = formatDateStr(date);
            const daySessions = getSessionsForDate(dateStr);
            const isToday = dateStr === todayStr;
            return (
              <View key={dateStr} style={styles.weekDayCol}>
                <Text style={[styles.weekDayLabel, isToday && styles.weekDayLabelToday]}>
                  {DAYS[date.getDay()].slice(0, 1)}
                </Text>
                <View style={[styles.weekDayCircle, isToday && styles.weekDayCircleToday]}>
                  <Text style={[styles.weekDayNum, isToday && styles.weekDayNumToday]}>
                    {date.getDate()}
                  </Text>
                </View>
                {daySessions.slice(0, 2).map(function(s) {
                  return (
                    <View
                      key={s.id}
                      style={[styles.weekDot, { backgroundColor: getStatusColor(s.status) }]}
                    />
                  );
                })}
                {daySessions.length > 2 && (
                  <Text style={styles.weekMoreText}>+{daySessions.length - 2}</Text>
                )}
              </View>
            );
          })}
        </View>

        {/* Sessions list for this week */}
        <Text style={styles.sectionLabel}>This Week</Text>
        {weekSessions.length === 0 ? (
          <Text style={styles.empty}>No sessions this week.</Text>
        ) : (
          weekSessions.map(function(group) {
            return (
              <View key={group.dateStr}>
                <Text style={styles.weekDateLabel}>
                  {DAYS[group.date.getDay()]}, {MONTHS[group.date.getMonth()]} {group.date.getDate()}
                </Text>
                {group.sessions.map(function(s) { return renderSessionCard(s); })}
              </View>
            );
          })
        )}
        <View style={styles.bottomPad} />
      </ScrollView>
    );
  }

  // MONTH VIEW
  function renderMonthView() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const todayStr = formatDateStr(new Date());

    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) { cells.push(null); }
    for (let d = 1; d <= daysInMonth; d++) { cells.push(d); }
    // Pad to complete last row
    while (cells.length % 7 !== 0) { cells.push(null); }

    return (
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.calNavRow}>
          <TouchableOpacity
            style={styles.calNavBtn}
            onPress={function() {
              const d = new Date(currentDate);
              d.setMonth(d.getMonth() - 1);
              setCurrentDate(d);
            }}
          >
            <Text style={styles.calNavText}>‹ Prev</Text>
          </TouchableOpacity>
          <Text style={styles.calNavTitle}>{MONTHS[month]} {year}</Text>
          <TouchableOpacity
            style={styles.calNavBtn}
            onPress={function() {
              const d = new Date(currentDate);
              d.setMonth(d.getMonth() + 1);
              setCurrentDate(d);
            }}
          >
            <Text style={styles.calNavText}>Next ›</Text>
          </TouchableOpacity>
        </View>

        {/* Day headers */}
        <View style={styles.monthDayHeaders}>
          {DAYS.map(function(day) {
            return (
              <View key={day} style={styles.monthHeaderCell}>
                <Text style={styles.monthDayHeader}>{day.slice(0, 1)}</Text>
              </View>
            );
          })}
        </View>

        {/* Month grid */}
        <View style={styles.monthGrid}>
          {cells.map(function(day, index) {
            if (day === null) {
              return <View key={'e-' + index} style={styles.monthCell} />;
            }
            const dateStr = year + '-' +
              String(month + 1).padStart(2, '0') + '-' +
              String(day).padStart(2, '0');
            const daySessions = getSessionsForDate(dateStr);
            const isToday = dateStr === todayStr;
            return (
              <View key={dateStr} style={styles.monthCell}>
                <View style={[styles.monthDayInner, isToday && styles.monthDayInnerToday]}>
                  <Text style={[styles.monthDayNum, isToday && styles.monthDayNumToday]}>
                    {day}
                  </Text>
                </View>
                <View style={styles.monthDots}>
                  {daySessions.slice(0, 3).map(function(s) {
                    return (
                      <View
                        key={s.id}
                        style={[styles.monthDot, { backgroundColor: getStatusColor(s.status) }]}
                      />
                    );
                  })}
                </View>
              </View>
            );
          })}
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          {[
            { label: 'Confirmed', color: COLORS.green },
            { label: 'Pending', color: COLORS.warning },
            { label: 'Completed', color: COLORS.darkGray },
          ].map(function(item) {
            return (
              <View key={item.label} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                <Text style={styles.legendText}>{item.label}</Text>
              </View>
            );
          })}
        </View>
        <View style={styles.bottomPad} />
      </ScrollView>
    );
  }

  // LIST VIEW
  function renderListView() {
    const filtered = getFilteredSessions();
    return (
      <FlatList
        data={filtered}
        keyExtractor={function(item: SessionDto) { return item.id; }}
        contentContainerStyle={styles.listContent}
        onRefresh={loadSessions}
        refreshing={loading}
        renderItem={function({ item }: { item: SessionDto }) {
          return renderSessionCard(item);
        }}
        ListEmptyComponent={
          <Text style={styles.empty}>No sessions found.</Text>
        }
      />
    );
  }

  const header = (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>My Sessions</Text>
      <View style={styles.modeRow}>
        {(['list', 'week', 'month'] as CalendarMode[]).map(function(mode) {
          return (
            <TouchableOpacity
              key={mode}
              style={[styles.modeBtn, calendarMode === mode && styles.modeBtnActive]}
              onPress={function() { setCalendarMode(mode); }}
            >
              <Text style={[styles.modeBtnText, calendarMode === mode && styles.modeBtnTextActive]}>
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const filterRow = calendarMode === 'list' ? (
    <View style={styles.filterRow}>
      {(['upcoming', 'pending', 'completed', 'all'] as StatusFilter[]).map(function(f) {
        return (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, statusFilter === f && styles.filterBtnActive]}
            onPress={function() { setStatusFilter(f); }}
          >
            <Text style={[styles.filterText, statusFilter === f && styles.filterTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  ) : null;

  if (loading) {
    return (
      <View style={styles.screen}>
        {header}
        <ActivityIndicator color={COLORS.red} style={styles.spinner} />
      </View>
    );
  }

  if (calendarMode === 'list') {
    return (
      <View style={styles.screen}>
        {header}
        {filterRow}
        {renderListView()}
      </View>
    );
  }

  // Week/Month
  return (
    <View style={styles.screen}>
      {header}
      <View style={styles.calPadding}>
        {calendarMode === 'week' && renderWeekView()}
        {calendarMode === 'month' && renderMonthView()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.lightGray },

  // Header
  header: { backgroundColor: COLORS.red, padding: 20, paddingTop: 50 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: COLORS.white, marginBottom: 12 },
  modeRow: { flexDirection: 'row', gap: 6 },
  modeBtn: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  modeBtnActive: { backgroundColor: COLORS.white },
  modeBtnText: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.9)' },
  modeBtnTextActive: { color: COLORS.red },

  // Filter row (list mode only)
  filterRow: { flexDirection: 'row', padding: 12, gap: 6, flexWrap: 'wrap', backgroundColor: COLORS.lightGray },
  filterBtn: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16,
    backgroundColor: COLORS.white, borderWidth: 1.5, borderColor: COLORS.medGray,
  },
  filterBtnActive: { backgroundColor: COLORS.red, borderColor: COLORS.red },
  filterText: { fontSize: 12, fontWeight: '600', color: COLORS.darkGray },
  filterTextActive: { color: COLORS.white },

  spinner: { marginTop: 40 },

  // List mode
  listContent: { padding: 12 },

  // Week/Month wrapper
  calPadding: { flex: 1 },
  scrollContent: { flex: 1, paddingHorizontal: 12 },

  // Session card
  sessionCard: {
    backgroundColor: COLORS.white, borderRadius: 14, marginBottom: 8,
    flexDirection: 'row', overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  sessionStatusBar: { width: 4 },
  sessionContent: { flex: 1, padding: 14 },
  sessionTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sessionCourse: { fontSize: 15, fontWeight: '700', color: COLORS.black },
  statusBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  statusBadgeText: { fontSize: 11, fontWeight: '700' },
  sessionPerson: { fontSize: 13, color: COLORS.darkGray, marginTop: 3 },
  sessionDateTime: { fontSize: 12, color: COLORS.darkGray, marginTop: 2 },

  empty: { textAlign: 'center', color: COLORS.darkGray, marginTop: 40, fontSize: 14 },
  sectionLabel: { fontSize: 14, fontWeight: '700', color: COLORS.black, marginTop: 16, marginBottom: 8 },
  bottomPad: { height: 24 },

  // Nav
  calNavRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 12,
  },
  calNavBtn: { padding: 8 },
  calNavText: { fontSize: 14, color: COLORS.red, fontWeight: '600' },
  calNavTitle: { fontSize: 15, fontWeight: '700', color: COLORS.black, textAlign: 'center', flex: 1 },

  // Week view
  weekGrid: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  weekDayCol: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
    gap: 4,
  },
  weekDayLabel: { fontSize: 11, color: COLORS.darkGray, fontWeight: '600' },
  weekDayLabelToday: { color: COLORS.red },
  weekDayCircle: {
    width: 30, height: 30, borderRadius: 15,
    alignItems: 'center', justifyContent: 'center',
  },
  weekDayCircleToday: { backgroundColor: COLORS.red },
  weekDayNum: { fontSize: 14, fontWeight: '600', color: COLORS.black },
  weekDayNumToday: { color: COLORS.white },
  weekDot: { width: 6, height: 6, borderRadius: 3 },
  weekMoreText: { fontSize: 9, color: COLORS.darkGray },
  weekDateLabel: {
    fontSize: 13, fontWeight: '600', color: COLORS.darkGray,
    marginBottom: 6, marginTop: 8,
  },

  // Month view
  monthDayHeaders: { flexDirection: 'row', marginBottom: 2 },
  monthHeaderCell: { width: CELL_WIDTH, alignItems: 'center', paddingVertical: 4 },
  monthDayHeader: { fontSize: 12, color: COLORS.darkGray, fontWeight: '600' },
  monthGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    backgroundColor: COLORS.white, borderRadius: 12,
    paddingVertical: 4,
  },
  monthCell: {
    width: CELL_WIDTH,
    height: CELL_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  monthDayInner: {
    width: 28, height: 28, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  monthDayInnerToday: { backgroundColor: COLORS.red },
  monthDayNum: { fontSize: 13, color: COLORS.black, fontWeight: '500' },
  monthDayNumToday: { color: COLORS.white, fontWeight: '800' },
  monthDots: { flexDirection: 'row', gap: 2, marginTop: 2, height: 6 },
  monthDot: { width: 5, height: 5, borderRadius: 3 },

  legend: {
    flexDirection: 'row', gap: 16, marginTop: 12,
    paddingHorizontal: 4, paddingBottom: 4,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, color: COLORS.darkGray },

  // Accept / Decline buttons
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  acceptBtn: {
    flex: 1, paddingVertical: 8, borderRadius: 8,
    backgroundColor: COLORS.green, alignItems: 'center',
  },
  acceptBtnText: { color: COLORS.white, fontSize: 13, fontWeight: '700' },
  declineBtn: {
    flex: 1, paddingVertical: 8, borderRadius: 8,
    borderWidth: 1.5, borderColor: COLORS.error, alignItems: 'center',
  },
  declineBtnText: { color: COLORS.error, fontSize: 13, fontWeight: '700' },
});

export default CalendarScreen;
