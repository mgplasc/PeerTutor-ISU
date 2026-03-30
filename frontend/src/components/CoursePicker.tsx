import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  FlatList, StyleSheet, ActivityIndicator, Modal,
} from 'react-native';
import { COLORS } from '../constants/colors';
import { getAllCourses, Course } from '../services/courseService';

type CoursePickerProps = {
  // Selected course IDs (numbers matching courses.id)
  selectedIds: number[];
  onSelectionChange: (ids: number[]) => void;
};

function CoursePicker({ selectedIds, onSelectionChange }: CoursePickerProps) {
  const [visible, setVisible] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(function() {
    if (visible && courses.length === 0) {
      loadCourses();
    }
  }, [visible]);

  async function loadCourses() {
    setLoading(true);
    const data = await getAllCourses();
    setCourses(data);
    setLoading(false);
  }

  function toggleCourse(id: number) {
    const isSelected = selectedIds.includes(id);
    if (isSelected) {
      onSelectionChange(selectedIds.filter(function(i) { return i !== id; }));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  }

  const filtered = courses.filter(function(c) {
    const query = search.toLowerCase();
    return (
      c.courseNumber.toLowerCase().includes(query) ||
      c.courseName.toLowerCase().includes(query)
    );
  });

  // Build display label from selected IDs
  const selectedCourseNumbers = courses
    .filter(function(c) { return selectedIds.includes(c.id); })
    .map(function(c) { return c.courseNumber; });

  const triggerLabel = selectedCourseNumbers.length === 0
    ? 'Tap to select courses'
    : selectedCourseNumbers.join(', ');

  return (
    <View>
      <TouchableOpacity
        style={styles.trigger}
        onPress={function() { setVisible(true); }}
      >
        <Text
          style={[styles.triggerText, selectedIds.length === 0 && styles.placeholder]}
          numberOfLines={2}
        >
          {triggerLabel}
        </Text>
        <Text style={styles.triggerIcon}>▾</Text>
      </TouchableOpacity>

      <Modal
        visible={visible}
        animationType="slide"
        onRequestClose={function() { setVisible(false); }}
      >
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Courses</Text>
            <TouchableOpacity
              style={styles.doneBtn}
              onPress={function() { setVisible(false); }}
            >
              <Text style={styles.doneBtnText}>Done ({selectedIds.length})</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.search}
            value={search}
            onChangeText={setSearch}
            placeholder="Search by number or name..."
            placeholderTextColor={COLORS.darkGray}
            autoCapitalize="none"
          />

          {loading ? (
            <ActivityIndicator color={COLORS.red} style={styles.spinner} />
          ) : (
            <FlatList
              data={filtered}
              keyExtractor={function(item: Course) { return String(item.id); }}
              renderItem={function({ item }: { item: Course }) {
                const isSelected = selectedIds.includes(item.id);
                return (
                  <TouchableOpacity
                    style={[styles.courseItem, isSelected && styles.courseItemSelected]}
                    onPress={function() { toggleCourse(item.id); }}
                  >
                    <View style={styles.courseInfo}>
                      <Text style={[styles.courseNumber, isSelected && styles.courseNumberSelected]}>
                        {item.courseNumber}
                      </Text>
                      <Text
                        style={[styles.courseName, isSelected && styles.courseNameSelected]}
                        numberOfLines={1}
                      >
                        {item.courseName}
                      </Text>
                    </View>
                    {isSelected && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <Text style={styles.empty}>No courses found.</Text>
              }
            />
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  trigger: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.medGray,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  triggerText: {
    fontSize: 14,
    color: COLORS.black,
    flex: 1,
  },
  placeholder: {
    color: COLORS.darkGray,
  },
  triggerIcon: {
    fontSize: 16,
    color: COLORS.darkGray,
    marginLeft: 8,
  },
  modal: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
  },
  modalHeader: {
    backgroundColor: COLORS.red,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.white,
  },
  doneBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  doneBtnText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 14,
  },
  search: {
    backgroundColor: COLORS.white,
    margin: 12,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: COLORS.black,
    borderWidth: 1,
    borderColor: COLORS.medGray,
  },
  spinner: {
    marginTop: 40,
  },
  courseItem: {
    backgroundColor: COLORS.white,
    marginHorizontal: 12,
    marginBottom: 6,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.medGray,
  },
  courseItemSelected: {
    borderColor: COLORS.red,
    backgroundColor: '#FEE2E6',
  },
  courseInfo: {
    flex: 1,
  },
  courseNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.black,
  },
  courseNumberSelected: {
    color: COLORS.red,
  },
  courseName: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginTop: 2,
  },
  courseNameSelected: {
    color: COLORS.red,
  },
  checkmark: {
    fontSize: 16,
    color: COLORS.red,
    fontWeight: '700',
    marginLeft: 8,
  },
  empty: {
    textAlign: 'center',
    color: COLORS.darkGray,
    marginTop: 40,
    fontSize: 14,
  },
});

export default CoursePicker;
