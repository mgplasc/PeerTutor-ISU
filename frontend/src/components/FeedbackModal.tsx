import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, Alert } from 'react-native';

type FeedbackProps = {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (rating: number, notes: string) => void;
};

export default function FeedbackModal({ isVisible, onClose, onSubmit }: FeedbackProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    if (rating === 0) {
      Alert.alert('Missing Rating', 'Please select a star rating before submitting.');
      return;
    }
    onSubmit(rating, comment);
    setRating(0);
    setComment('');
  };

  return (
    <Modal visible={isVisible} transparent={true} animationType="slide">
      <View style={styles.darkBackground}>
        <View style={styles.card}>
          <Text style={styles.title}>How was your session?</Text>
          <View style={styles.starRow}>
            {[1, 2, 3, 4, 5].map((starNumber) => (
              <TouchableOpacity key={starNumber} onPress={() => setRating(starNumber)}>
                <Text style={[styles.star, rating >= starNumber ? styles.starSelected : styles.starUnselected]}>
                  ★
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            style={styles.inputBox}
            placeholder="Leave a comment about your tutor..."
            multiline={true}
            value={comment}
            onChangeText={setComment}
          />
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitText}>Submit Feedback</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={{ marginTop: 15 }}>
            <Text style={{ color: 'gray', textAlign: 'center' }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  darkBackground: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  card: { width: '85%', backgroundColor: 'white', padding: 20, borderRadius: 15 },
  title: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  starRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20 },
  star: { fontSize: 40, marginHorizontal: 5 },
  starSelected: { color: '#FFD700' },
  starUnselected: { color: '#D3D3D3' },
  inputBox: { height: 100, borderColor: '#ccc', borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 20, textAlignVertical: 'top' },
  submitButton: { backgroundColor: '#007AFF', padding: 15, borderRadius: 8, alignItems: 'center' },
  submitText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});