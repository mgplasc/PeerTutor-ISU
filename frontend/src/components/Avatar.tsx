import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

type AvatarProps = {
  initials: string;
  bg: string;
  size: number;
};

function Avatar(props: AvatarProps) {
  const bg = props.bg || COLORS.red;
  const size = props.size || 44;

  return (
    <View style={[
      styles.avatar,
      {
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: bg,
      }
    ]}>
      <Text style={[styles.text, { fontSize: size * 0.34 }]}>
        {props.initials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: COLORS.white,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default Avatar;
