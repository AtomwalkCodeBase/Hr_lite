import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors1 } from '../Styles/appStyle';

const CustomButton = ({ title, onPress, style, variant = 'primary', disabled = false }) => {
  const buttonStyle = [
    styles.button,
    variant === 'secondary' && styles.secondaryButton,
    variant === 'outline' && styles.outlineButton,
    disabled && styles.disabledButton,
    style,
  ];

  const textStyle = [
    styles.buttonText,
    variant === 'secondary' && styles.secondaryButtonText,
    variant === 'outline' && styles.outlineButtonText,
    disabled && styles.disabledButtonText,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={textStyle}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors1.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    // elevation: 5,
  },
  secondaryButton: {
    backgroundColor: colors1.white,
    borderWidth: 1,
    borderColor: colors1.primary,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors1.primary,
  },
  disabledButton: {
    backgroundColor: colors1.subText,
  },
  buttonText: {
    color: colors1.white,
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: colors1.primary,
  },
  outlineButtonText: {
    color: colors1.primary,
  },
  disabledButtonText: {
    color: colors1.white,
  },
});

export default CustomButton;