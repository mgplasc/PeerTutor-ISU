import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator,
  FlatList, Modal,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS } from '../constants/colors';
import { getMyAvailabilitySlots, addAvailabilitySlot, deleteAvailabilitySlot, AvailabilitySlotDto } from '../services/availabilityService';

function AvailabilityScreen() {
  const [slots, setSlots] = useState<AvailabilitySlotDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSlots();
  }, []);

  async function loadSlots() {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyAvailabilitySlots();
      setSlots(data);
      console.log('Slots from API:', data);
    } catch (err: any) {
      console.error('Failed to load slots', err);
      setError(err?.message || 'Could not load availability slots.');
    } finally {
      setLoading(false);
    }
  }

  function formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function formatTimeForDisplay(date: Date): string {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours % 12 || 12;
    return `${displayHour}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  }

  function formatTimeForApi(date: Date): string {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  function calculateDurationMinutes(start: Date, end: Date): number {
    return (end.getTime() - start.getTime()) / (1000 * 60);
  }

  async function handleAddSlot() {
    const duration = calculateDurationMinutes(startTime, endTime);
    if (duration < 30) {
      Alert.alert('Invalid Duration', 'Session must be at least 30 minutes.');
      return;
    }
    if (duration > 180) {
      Alert.alert('Invalid Duration', 'Session cannot exceed 3 hours.');
      return;
    }
    const dateStr = formatDate(selectedDate);
    const startStr = formatTimeForApi(startTime);
    const endStr = formatTimeForApi(endTime);

    setSaving(true);
    try {
      await addAvailabilitySlot(dateStr, startStr, endStr);
      Alert.alert('Success', 'Availability slot added.');
      setModalVisible(false);
      loadSlots();
    } catch (error) {
      Alert.alert('Error', 'Could not add slot.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteSlot(slotId: string) {
    Alert.alert('Delete Slot', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteAvailabilitySlot(slotId);
            loadSlots();
          } catch (error) {
            Alert.alert('Error', 'Could not delete slot.');
          }
        },
      },
    ]);
  }

  function formatTimeRange(start: string, end: string): string {
    const format = (t: string) => {
      const [hour, minute] = t.split(':');
      const h = parseInt(hour, 10);
      const ampm = h >= 12 ? 'PM' : 'AM';
      const displayHour = h % 12 || 12;
      return `${displayHour}:${minute} ${ampm}`;
    };
    return `${format(start)} - ${format(end)}`;
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={COLORS.red} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadSlots}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>My Availability Slots</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.addButtonText}>+ Add Slot</Text>
        </TouchableOpacity>
      </View>
      {slots.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No availability slots added yet.</Text>
          <Text style={styles.emptySubtext}>Tap + Add Slot to let students book sessions.</Text>
        </View>
      ) : (
        <FlatList
          data={slots}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.slotCard}>
              <View style={styles.slotInfo}>
                <Text style={styles.slotDate}>{item.date}</Text>
                <Text style={styles.slotTime}>{formatTimeRange(item.startTime, item.endTime)}</Text>
              </View>
              <TouchableOpacity
                style={styles.deleteSlotBtn}
                onPress={() => handleDeleteSlot(item.id)}
              >
                <Text style={styles.deleteSlotText}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}
          contentContainerStyle={styles.listContent}
        />
      )}

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Add Availability Slot</Text>

            <TouchableOpacity style={styles.pickerButton} onPress={() => setShowDatePicker(true)}>
              <Text style={styles.pickerButtonText}>Date: {formatDate(selectedDate)}</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="default"
                onChange={(event, date) => {
                  setShowDatePicker(false);
                  if (date) setSelectedDate(date);
                }}
              />
            )}

            <TouchableOpacity style={styles.pickerButton} onPress={() => setShowStartPicker(true)}>
              <Text style={styles.pickerButtonText}>Start Time: {formatTimeForDisplay(startTime)}</Text>
            </TouchableOpacity>
            {showStartPicker && (
              <DateTimePicker
                value={startTime}
                mode="time"
                display="default"
                onChange={(event, date) => {
                  setShowStartPicker(false);
                  if (date) setStartTime(date);
                }}
              />
            )}

            <TouchableOpacity style={styles.pickerButton} onPress={() => setShowEndPicker(true)}>
              <Text style={styles.pickerButtonText}>End Time: {formatTimeForDisplay(endTime)}</Text>
            </TouchableOpacity>
            {showEndPicker && (
              <DateTimePicker
                value={endTime}
                mode="time"
                display="default"
                onChange={(event, date) => {
                  setShowEndPicker(false);
                  if (date) setEndTime(date);
                }}
              />
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.saveBtn]}
                onPress={handleAddSlot}
                disabled={saving}
              >
                <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.lightGray },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.medGray,
  },
  title: { fontSize: 18, fontWeight: '700', color: COLORS.black },
  addButton: { backgroundColor: COLORS.red, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  addButtonText: { color: COLORS.white, fontWeight: '600' },
  listContent: { padding: 16 },
  slotCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  slotInfo: { flex: 1 },
  slotDate: { fontSize: 15, fontWeight: '600', color: COLORS.black },
  slotTime: { fontSize: 13, color: COLORS.darkGray, marginTop: 4 },
  deleteSlotBtn: { backgroundColor: '#FFE5E5', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  deleteSlotText: { color: COLORS.error, fontWeight: '600' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyText: { fontSize: 16, color: COLORS.darkGray, textAlign: 'center' },
  emptySubtext: { fontSize: 13, color: COLORS.darkGray, marginTop: 8, textAlign: 'center' },
  errorText: { fontSize: 16, color: COLORS.error, textAlign: 'center', marginBottom: 16 },
  retryButton: { backgroundColor: COLORS.red, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  retryButtonText: { color: COLORS.white, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContainer: { backgroundColor: COLORS.white, borderRadius: 20, padding: 20, width: '85%' },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16, textAlign: 'center' },
  pickerButton: { backgroundColor: COLORS.lightGray, padding: 12, borderRadius: 8, marginBottom: 12 },
  pickerButtonText: { fontSize: 14, color: COLORS.black },
  modalButtons: { flexDirection: 'row', gap: 12, marginTop: 20 },
  modalBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  cancelBtn: { backgroundColor: COLORS.lightGray },
  cancelBtnText: { color: COLORS.darkGray, fontWeight: '600' },
  saveBtn: { backgroundColor: COLORS.red },
  saveBtnText: { color: COLORS.white, fontWeight: '700' },
});

export default AvailabilityScreen;