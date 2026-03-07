import React from 'react';  
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../theme'; 


type RoleSwitchProps = {
  isTutor: boolean;
  setIsTutor: (value: boolean) => void;
};

const RoleSwitch = ({ isTutor, setIsTutor }: RoleSwitchProps) => {
  
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Current Mode: {isTutor ? "👨‍🏫 Tutor" : "🎓 Student"}
      </Text>
      
      <TouchableOpacity 
        style={[styles.button, isTutor && styles.tutorButton]} 
        onPress={() => setIsTutor(!isTutor)}
      >
        <Text style={styles.buttonText}>Switch Role</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    padding: 20, 
    alignItems: 'center',
    backgroundColor: Colors.lightGray,  
  },
  text: { 
    fontSize: 18, 
    marginBottom: 10,
    color: Colors.black, 
  },
  button: { 
    backgroundColor: Colors.redbirdRed,  
    padding: 15, 
    borderRadius: 8,
    minWidth: 150,
    alignItems: 'center',
  },
  tutorButton: {
    backgroundColor: Colors.redbirdYellow,  
  },
  buttonText: { 
    color: Colors.white,  
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default RoleSwitch;