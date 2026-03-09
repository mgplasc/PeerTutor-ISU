import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

type StarRatingProps = {
  rating: number;
};

function StarRating(props: StarRatingProps) {
  const full = Math.floor(props.rating);
  const empty = 5 - full;
  const stars = '★'.repeat(full) + '☆'.repeat(empty);

  return (
    <View style={styles.row}>
      <Text style={styles.stars}>{stars}</Text>
      <Text style={styles.value}>{props.rating}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stars: {
    color: '#F9DD16', //or #E6B800 idk it looks better
    fontSize: 13,
  },
  value: {
    color: COLORS.darkGray,
    fontSize: 12,
    marginLeft: 4,
  },
});

export default StarRating;
