import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {colors, typography, spacing} from '../../theme';

const Button = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  ...props
}) => {
  const buttonStyle = [
    styles.base,
    styles[variant],
    styles[size],
    disabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.textBase,
    styles[`text${variant.charAt(0).toUpperCase() + variant.slice(1)}`],
    styles[`text${size.charAt(0).toUpperCase() + size.slice(1)}`],
    disabled && styles.textDisabled,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}>
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? colors.text.primary : colors.primary}
          size="small"
        />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: spacing.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  // Variantes
  primary: {
    backgroundColor: colors.button.primary,
  },
  secondary: {
    backgroundColor: colors.button.secondary,
    borderWidth: spacing.borderWidth.thin,
    borderColor: colors.border.primary,
  },
  success: {
    backgroundColor: colors.button.success,
  },
  danger: {
    backgroundColor: colors.button.danger,
  },
  outline: {
    backgroundColor: colors.transparent,
    borderWidth: spacing.borderWidth.thin,
    borderColor: colors.primary,
  },
  text: {
    backgroundColor: colors.transparent,
  },

  // Tamanhos
  small: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 32,
  },
  medium: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 40,
  },
  large: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    minHeight: 48,
  },

  // Estados
  disabled: {
    backgroundColor: colors.button.disabled,
    opacity: 0.6,
  },

  // Textos
  textBase: {
    fontFamily: typography.fontFamily.regular,
    fontWeight: typography.fontWeight.semibold,
  },
  textPrimary: {
    color: colors.text.primary,
  },
  textSecondary: {
    color: colors.text.primary,
  },
  textSuccess: {
    color: colors.text.primary,
  },
  textDanger: {
    color: colors.text.primary,
  },
  textOutline: {
    color: colors.primary,
  },
  textText: {
    color: colors.primary,
  },
  textDisabled: {
    color: colors.text.tertiary,
  },

  // Tamanhos de texto
  textSmall: {
    fontSize: typography.fontSize.sm,
  },
  textMedium: {
    fontSize: typography.fontSize.base,
  },
  textLarge: {
    fontSize: typography.fontSize.lg,
  },
});

export default Button;
