import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

type TagProps = {
  text: string;
  type: string;
};

function Tag(props: TagProps) {
  let bg = COLORS.lightGray;
  let color = COLORS.darkGray;
  let border = COLORS.medGray;

  if (props.type === 'red') {
    bg = '#FEE2E6';
    color = COLORS.red;
    border = '#FCA5A5';
  } else if (props.type === 'yellow') {
    bg = '#FEFCE8';
    color = '#92400E';
    border = '#FDE68A';
  } else if (props.type === 'green') {
    bg = '#D1FAE5';
    color = '#065F46';
    border = '#A7F3D0';
  } else if (props.type === 'blue') {
    bg = '#DBEAFE';
    color = '#1E40AF';
    border = '#93C5FD';
  }

  return (
    <View style={[styles.tag, { backgroundColor: bg, borderColor: border }]}>
      <Text style={[styles.text, { color: color }]}>{props.text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
  },
});

export default Tag;
