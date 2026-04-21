import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, FlatList, Modal, TouchableOpacity,
  StyleSheet, ActivityIndicator, ScrollView,
} from 'react-native';
import { COLORS } from '../constants/colors';
import TutorCard from '../components/TutorCard';
import { getTutors, TutorFilters } from '../services/tutorService';
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
  major?: string;
  bio?: string;
};

const SESSION_FORMAT_OPTIONS: { label: string; value: TutorFilters['sessionFormat'] | undefined }[] = [
  { label: 'Any',       value: undefined    },
  { label: 'Online',    value: 'online'     },
  { label: 'In-Person', value: 'inPerson'   },
  { label: 'Both',      value: 'both'       },
];

const RATING_OPTIONS: { label: string; value: number | undefined }[] = [
  { label: 'Any',  value: undefined },
  { label: '3.0+', value: 3.0       },
  { label: '4.0+', value: 4.0       },
  { label: '4.5+', value: 4.5       },
];

const PRICE_OPTIONS: { label: string; value: number | undefined }[] = [
  { label: 'Any',     value: undefined },
  { label: '≤ $10',   value: 10        },
  { label: '≤ $15',   value: 15        },
  { label: '≤ $20',   value: 20        },
  { label: '≤ $25',   value: 25        },
];

function HomeScreen({ navigation }: HomeScreenProps) {
  const auth = useAuth();
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Filter state
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sessionFormat, setSessionFormat] = useState<TutorFilters['sessionFormat'] | undefined>(undefined);
  const [minRating, setMinRating] = useState<number | undefined>(undefined);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);

  // Draft filter state (edited inside modal, applied on "Apply")
  const [draftAvailable, setDraftAvailable] = useState(false);
  const [draftFormat, setDraftFormat] = useState<TutorFilters['sessionFormat'] | undefined>(undefined);
  const [draftRating, setDraftRating] = useState<number | undefined>(undefined);
  const [draftPrice, setDraftPrice] = useState<number | undefined>(undefined);

  useEffect(function () {
    loadTutors(query, { available: availableOnly, sessionFormat, minRating, maxPrice });
  }, []);

  async function loadTutors(searchQuery: string, filters: TutorFilters) {
    setLoading(true);
    try {
      const results = await getTutors(searchQuery, filters);
      setTutors(results);
    } catch (err) {
      setTutors([]);
    }
    setLoading(false);
  }

  function handleSearch(text: string) {
    setQuery(text);
    loadTutors(text, { available: availableOnly, sessionFormat, minRating, maxPrice });
  }

  function openFilters() {
    setDraftAvailable(availableOnly);
    setDraftFormat(sessionFormat);
    setDraftRating(minRating);
    setDraftPrice(maxPrice);
    setShowFilters(true);
  }

  function applyFilters() {
    setAvailableOnly(draftAvailable);
    setSessionFormat(draftFormat);
    setMinRating(draftRating);
    setMaxPrice(draftPrice);
    setShowFilters(false);
    loadTutors(query, {
      available: draftAvailable,
      sessionFormat: draftFormat,
      minRating: draftRating,
      maxPrice: draftPrice,
    });
  }

  function clearFilters() {
    setDraftAvailable(false);
    setDraftFormat(undefined);
    setDraftRating(undefined);
    setDraftPrice(undefined);
  }

  function handleTutorPress(tutor: Tutor) {
    navigation.navigate('TutorProfile', { tutorId: tutor.id });
  }

  const activeFilterCount = [availableOnly, sessionFormat, minRating, maxPrice].filter(Boolean).length;

  let greeting = 'Find a Tutor';
  if (auth.user.studentProfile !== null && auth.user.studentProfile !== undefined) {
    greeting = 'Hi, ' + auth.user.studentProfile.firstName + '!';
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.greeting}>{greeting}</Text>
        <Text style={styles.sub}>Find a tutor for any course</Text>
        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={handleSearch}
            placeholder="Search by course or name..."
            placeholderTextColor={COLORS.darkGray}
          />
          <TouchableOpacity style={styles.filterBtn} onPress={openFilters} activeOpacity={0.8}>
            <Text style={styles.filterBtnText}>Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}</Text>
          </TouchableOpacity>
        </View>

        {/* Active filter chips */}
        {activeFilterCount > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
            {availableOnly && (
              <View style={styles.chip}><Text style={styles.chipText}>Available</Text></View>
            )}
            {sessionFormat && (
              <View style={styles.chip}>
                <Text style={styles.chipText}>
                  {SESSION_FORMAT_OPTIONS.find(o => o.value === sessionFormat)?.label}
                </Text>
              </View>
            )}
            {minRating !== undefined && (
              <View style={styles.chip}><Text style={styles.chipText}>{minRating}+ stars</Text></View>
            )}
            {maxPrice !== undefined && (
              <View style={styles.chip}><Text style={styles.chipText}>≤ ${maxPrice}/hr</Text></View>
            )}
          </ScrollView>
        )}
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.red} style={styles.spinner} />
      ) : (
        <FlatList
          data={tutors}
          keyExtractor={function (item: Tutor) { return item.id; }}
          contentContainerStyle={styles.list}
          renderItem={function ({ item }) {
            return (
              <TutorCard
                tutor={item}
                onPress={function () { handleTutorPress(item); }}
              />
            );
          }}
          ListEmptyComponent={
            <Text style={styles.empty}>No tutors found for that search.</Text>
          }
        />
      )}

      {/* Filter Modal */}
      <Modal visible={showFilters} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filters</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView>
              {/* Availability */}
              <Text style={styles.sectionLabel}>Availability</Text>
              <TouchableOpacity
                style={[styles.toggleRow, draftAvailable && styles.toggleRowActive]}
                onPress={() => setDraftAvailable(!draftAvailable)}
                activeOpacity={0.8}
              >
                <Text style={[styles.toggleText, draftAvailable && styles.toggleTextActive]}>
                  Available tutors only
                </Text>
                <View style={[styles.toggle, draftAvailable && styles.toggleOn]}>
                  <View style={[styles.toggleThumb, draftAvailable && styles.toggleThumbOn]} />
                </View>
              </TouchableOpacity>

              {/* Session Format */}
              <Text style={styles.sectionLabel}>Session Format</Text>
              <View style={styles.optionRow}>
                {SESSION_FORMAT_OPTIONS.map(opt => (
                  <TouchableOpacity
                    key={String(opt.value)}
                    style={[styles.optionChip, draftFormat === opt.value && styles.optionChipActive]}
                    onPress={() => setDraftFormat(opt.value)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.optionChipText, draftFormat === opt.value && styles.optionChipTextActive]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Min Rating */}
              <Text style={styles.sectionLabel}>Minimum Rating</Text>
              <View style={styles.optionRow}>
                {RATING_OPTIONS.map(opt => (
                  <TouchableOpacity
                    key={String(opt.value)}
                    style={[styles.optionChip, draftRating === opt.value && styles.optionChipActive]}
                    onPress={() => setDraftRating(opt.value)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.optionChipText, draftRating === opt.value && styles.optionChipTextActive]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Max Price */}
              <Text style={styles.sectionLabel}>Max Price</Text>
              <View style={styles.optionRow}>
                {PRICE_OPTIONS.map(opt => (
                  <TouchableOpacity
                    key={String(opt.value)}
                    style={[styles.optionChip, draftPrice === opt.value && styles.optionChipActive]}
                    onPress={() => setDraftPrice(opt.value)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.optionChipText, draftPrice === opt.value && styles.optionChipTextActive]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.clearBtn} onPress={clearFilters} activeOpacity={0.8}>
                <Text style={styles.clearBtnText}>Clear All</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyBtn} onPress={applyFilters} activeOpacity={0.8}>
                <Text style={styles.applyBtnText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingBottom: 16,
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
  searchRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: COLORS.black,
  },
  filterBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  filterBtnText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '600',
  },
  chipRow: {
    marginTop: 10,
    flexDirection: 'row',
  },
  chip: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 6,
  },
  chipText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '500',
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
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.black,
  },
  modalClose: {
    fontSize: 18,
    color: COLORS.darkGray,
    padding: 4,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.darkGray,
    marginTop: 16,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: COLORS.lightGray,
  },
  toggleRowActive: {
    backgroundColor: '#FEE2E2',
  },
  toggleText: {
    fontSize: 14,
    color: COLORS.black,
  },
  toggleTextActive: {
    color: COLORS.red,
    fontWeight: '600',
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.medGray,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleOn: {
    backgroundColor: COLORS.red,
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.white,
  },
  toggleThumbOn: {
    alignSelf: 'flex-end',
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.medGray,
    backgroundColor: COLORS.white,
  },
  optionChipActive: {
    borderColor: COLORS.red,
    backgroundColor: '#FEE2E2',
  },
  optionChipText: {
    fontSize: 13,
    color: COLORS.darkGray,
  },
  optionChipTextActive: {
    color: COLORS.red,
    fontWeight: '600',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  clearBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.medGray,
    alignItems: 'center',
  },
  clearBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.darkGray,
  },
  applyBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.red,
    alignItems: 'center',
  },
  applyBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.white,
  },
});

export default HomeScreen;
