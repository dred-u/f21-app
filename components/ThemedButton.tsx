import React from 'react';
import { TouchableOpacity, StyleSheet, type TouchableOpacityProps } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';

interface ThemedButtonProps extends TouchableOpacityProps {
  title: string;
  textType?: 
    'default' | 
    'title' | 
    'defaultSemiBold' |
    'defaultCardBold' | 
    'subtitle' | 
    'light' | 
    'titleBold';
  lightColor?: string;
  darkColor?: string;
}

const ThemedButton: React.FC<ThemedButtonProps> = ({
  onPress,
  title,
  disabled,
  textType = 'default',
  style,
  lightColor,
  darkColor,
  ...rest
}) => {
  const backgroundColor = useThemeColor({}, 'tabIconSelected');
  const textColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: disabled ? textColor : backgroundColor },
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      {...rest}
    >
      <ThemedText style={[styles.buttonText, { color: textColor }]} type={textType}>
        {title}
      </ThemedText>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 15,
    borderRadius: 5,
    alignSelf: 'center',
    alignItems: 'center',
    marginVertical: 20,
    width: '60%',
  },
  buttonText: {
    fontSize: 16,
  },
});

export default ThemedButton;
