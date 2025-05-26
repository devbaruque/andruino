import {Platform} from 'react-native';

export const typography = {
  // Famílias de fonte
  fontFamily: {
    regular: Platform.OS === 'ios' ? 'System' : 'Roboto',
    bold: Platform.OS === 'ios' ? 'System' : 'Roboto',
    mono: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },

  // Tamanhos de fonte
  fontSize: {
    xs: 10,
    sm: 12,
    base: 14,
    lg: 16,
    xl: 18,
    xxl: 20,
    '2xl': 20,
    '3xl': 24,
    '3x1': 28,
    '4xl': 32,
    '5xl': 48,
  },

  // Pesos de fonte
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },

  // Altura de linha
  lineHeight: {
    tight: 16,
    normal: 20,
    relaxed: 24,
    loose: 28,
  },

  // Estilos de texto predefinidos
  styles: {
    h1: {
      fontSize: 32,
      fontWeight: '700',
      lineHeight: 40,
    },
    h2: {
      fontSize: 24,
      fontWeight: '700',
      lineHeight: 32,
    },
    h3: {
      fontSize: 20,
      fontWeight: '600',
      lineHeight: 28,
    },
    h4: {
      fontSize: 18,
      fontWeight: '600',
      lineHeight: 24,
    },
    body: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 24,
    },
    bodySmall: {
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 20,
    },
    caption: {
      fontSize: 12,
      fontWeight: '400',
      lineHeight: 16,
    },
    code: {
      fontSize: 14,
      fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
      lineHeight: 20,
    },
  },
};
