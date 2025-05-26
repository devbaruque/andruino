import React from 'react';
import {TextInput, View, Text, StyleSheet} from 'react-native';
import {colors, typography, spacing} from '../../theme';

const Input = ({
  label,
  error,
  style,
  inputStyle,
  labelStyle,
  errorStyle,
  ...props
}) => {
  return (
    <View style={[styles.container, style]}>
      {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}
      <TextInput
        style={[styles.input, error && styles.inputError, inputStyle]}
        placeholderTextColor={colors.text.placeholder}
        {...props}
      />
      {error && <Text style={[styles.error, errorStyle]}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.background.secondary,
    borderRadius: spacing.borderRadius.md,
    padding: spacing.input,
    color: colors.text.primary,
    fontSize: typography.fontSize.lg,
    borderWidth: spacing.borderWidth.thin,
    borderColor: colors.border.primary,
    fontFamily: typography.fontFamily.regular,
  },
  inputError: {
    borderColor: colors.error,
  },
  error: {
    fontSize: typography.fontSize.sm,
    color: colors.error,
    marginTop: spacing.xs,
    fontFamily: typography.fontFamily.regular,
  },
});

export default Input;
