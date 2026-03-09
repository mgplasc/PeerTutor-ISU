import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  disabled: boolean;
};

function PrimaryButton(props: PrimaryButtonProps) {
  const isDisabled = props.disabled === true;

  return (
    <TouchableOpacity
      onPress={props.onPress}
      disabled={isDisabled}
      style={[styles.btn, isDisabled && styles.disabled]}
      activeOpacity={0.8}
    >
      <Text style={styles.text}>{props.label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: COLORS.red,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    shadowColor: COLORS.red,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  disabled: {
    backgroundColor: COLORS.medGray,
    shadowOpacity: 0,
  },
  text: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
  },
});

export default PrimaryButton;
