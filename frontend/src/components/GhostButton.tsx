import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

type GhostButtonProps = {
  label: string;
  onPress: () => void;
  disabled: boolean;
};

function GhostButton(props: GhostButtonProps) {
  const isDisabled = props.disabled === true;

  return (
    <TouchableOpacity
      onPress={props.onPress}
      disabled={isDisabled}
      style={[styles.btn, isDisabled && styles.disabled]}
      activeOpacity={0.8}
    >
      <Text style={[styles.text, isDisabled && styles.disabledText]}>
        {props.label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.red,
  },
  disabled: {
    borderColor: COLORS.medGray,
  },
  text: {
    color: COLORS.red,
    fontSize: 15,
    fontWeight: '700',
  },
  disabledText: {
    color: COLORS.medGray,
  },
});

export default GhostButton;
