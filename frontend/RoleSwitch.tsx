import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const RoleSwitch = () => {
  const [isTutor, setIsTutor] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Current Mode: {isTutor ? "👨‍🏫 Tutor" : "🎓 Student"}
      </Text>
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => setIsTutor(!isTutor)}
      >
        <Text style={styles.buttonText}>Switch Role</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, alignItems: 'center' },
  text: { fontSize: 18, marginBottom: 10 },
  button: { backgroundColor: '#CE1126', padding: 15, borderRadius: 8 }, // ISU Red color
  buttonText: { color: 'white', fontWeight: 'bold' }
});

export default RoleSwitch;