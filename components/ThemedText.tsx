import React from 'react';
import { Text, type TextProps, StyleSheet } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 
  'default' | 
  'title' | 
  'defaultSemiBold' |
  'defaultCardBold' | 
  'subtitle' | 
  'light' | 
  'titleBold';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'defaultCardBold' ? styles.defaultCardBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'light' ? styles.light : undefined,
        type === 'titleBold' ? styles.titleBold : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    fontFamily: 'Barlow'
  },
  light: {
    fontSize: 18,
    fontFamily: 'BarlowLight'
  },
  defaultCardBold: {
    fontSize: 20,
    fontFamily: 'BarlowSemiBold'
  },
  defaultSemiBold: {
    fontSize: 16,
    fontFamily: 'BarlowSemiBold'
  },
  title: {
    fontSize: 40,
    lineHeight: 40,
    fontFamily: 'BarlowMedium'
  },
  titleBold: {
    fontSize: 24,
    lineHeight: 24,
    fontFamily: 'BarlowBold'
  },
  subtitle: {
    fontSize: 26,
    fontFamily: 'BarlowMedium'
  },

});
