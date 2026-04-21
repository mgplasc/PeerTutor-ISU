import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, FlatList,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { COLORS } from '../constants/colors';
import TutorCard from '../components/TutorCard';
import { getTutors } from '../services/tutorService';
import { useAuth } from '../context/AuthContext';

type HomeScreenProps = {
  navigation: {
    navigate: (screen: string, params: object) => void;
  };
};

type Tutor = {
  id: string;
  firstName: string;
  lastName: string;
  courses: string[];
  rating: number;
  reviews: number;
  rate: string;
  mode: string;
  available: boolean;
  avatar: string;
  avatarBg: string;
  year: string;
  // optional if not used in HomeScreen, but may be included from mapping
  major?: string;
  bio?: string;
};

function HomeScreen({ navigation }: HomeScreenProps) {
  const auth = useAuth();
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(function() {
    loadTutors('');
  }, []);

  async function loadTutors(searchQuery: string) {
    setLoading(true);
    try {
      const results = await getTutors(searchQuery);
      setTutors(results);
    } catch (err) {
      setTutors([]);
    }
    setLoading(false);
  }

  function handleSearch(text: string) {
    setQuery(text);
    loadTutors(text);
  }

  //pass tutorId 
  function handleTutorPress(tutor: Tutor) {
    navigation.navigate('TutorProfile', { tutorId: tutor.id });
  }

  let greeting = 'Find a Tutor';
  if (auth.user.studentProfile !== null && auth.user.studentProfile !== undefined) {
    greeting = 'Hi, ' + auth.user.studentProfile.firstName + '!';
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.greeting}>{greeting}</Text>
        <Text style={styles.sub}>Find a tutor for any course</Text>
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={handleSearch}
          placeholder="Search by course or name..."
          placeholderTextColor={COLORS.darkGray}
        />
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.red} style={styles.spinner} />
      ) : (
        <FlatList
          data={tutors}
          keyExtractor={function(item: Tutor) { return item.id; }}
          contentContainerStyle={styles.list}
          renderItem={function({ item }) {
            return (
              <TutorCard
                tutor={item}
                onPress={function() { handleTutorPress(item); }}
              />
            );
          }}
          ListEmptyComponent={
            <Text style={styles.empty}>No tutors found for that search.</Text>
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
    paddingBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.white,
  },
  sub: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
    marginBottom: 14,
  },
  searchInput: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: COLORS.black,
  },
  spinner: {
    marginTop: 40,
  },
  list: {
    padding: 16,
  },
  empty: {
    textAlign: 'center',
    color: COLORS.darkGray,
    marginTop: 40,
    fontSize: 14,
  },
});

export default HomeScreen;