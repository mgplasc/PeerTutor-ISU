// TutorView component - tutor-specific features
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../theme';

const TutorView = () => {
  return (
    <View style={styles.container}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>👨‍🏫 TUTOR MODE</Text>
      </View>
      <Text style={styles.welcomeMessage}>
        Welcome Tutor! Manage your sessions and students.
      </Text>
      <Text style={styles.hint}>
        (Tutor view - more features coming soon!)
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  badge: {
    backgroundColor: Colors.redbirdYellow, // Yellow for tutor
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    marginBottom: 20,
  },
  badgeText: {
    color: Colors.black,
    fontWeight: 'bold',
    fontSize: 16,
  },
  welcomeMessage: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.black,
    textAlign: 'center',
    marginBottom: 10,
  },
  hint: {
    fontSize: 14,
    color: Colors.darkGray,
    fontStyle: 'italic',
  },
});

export default TutorView;