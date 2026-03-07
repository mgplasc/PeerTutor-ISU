// App.tsx
import React, { useState } from 'react';
import { StatusBar, StyleSheet, View, Image, Text } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import RoleSwitch from './components/RoleSwitch';
import StudentView from './components/StudentView';
import TutorView from './components/TutorView';
import { Colors } from './theme';

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor={Colors.redbirdRed} />
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const [isTutor, setIsTutor] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>PeerTutor ISU</Text>
      </View>
      
      {/* Role Switch */}
      <RoleSwitch isTutor={isTutor} setIsTutor={setIsTutor} />
      
      {/* Conditional Views */}
      {isTutor ? <TutorView /> : <StudentView />}
      
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lightGray,
  },
  header: {
    backgroundColor: Colors.redbirdRed,
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  logo: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.white,
  },
});

export default App;