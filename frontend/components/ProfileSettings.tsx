import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';

const ProfileSettings = () => {
  const [name, setName] = useState('');
  const [major, setMajor] = useState('');
  const [skills, setSkills] = useState('');

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Edit Your Profile</Text>

      <Text style={styles.label}>Full Name</Text>
      <TextInput 
        style={styles.input} 
        placeholder="Enter your name" 
        value={name} 
        onChangeText={setName} 
      />

      <Text style={styles.label}>Major</Text>
      <TextInput 
        style={styles.input} 
        placeholder="e.g. Cybersecurity" 
        value={major} 
        onChangeText={setMajor} 
      />

      <Text style={styles.label}>Bio / Skills</Text>
      <TextInput 
        style={[styles.input, { height: 80 }]} 
        placeholder="What can you help with?" 
        multiline 
        value={skills} 
        onChangeText={setSkills} 
      />

      <TouchableOpacity style={styles.button} onPress={() => Alert.alert('Profile Saved!')}>
        <Text style={styles.buttonText}>Save Profile</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#ffffff' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  label: { fontSize: 16, fontWeight: '600', marginTop: 15, color: '#555' },
  input: { borderBottomWidth: 1, borderColor: '#ccc', padding: 10, fontSize: 16, marginTop: 5 },
  button: { backgroundColor: '#CE1126', padding: 15, borderRadius: 8, marginTop: 30, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});

export default ProfileSettings;