import React from 'react';
import { TextInput, StyleSheet } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

interface ThemedTextInputProps {
  style?: any;
  secureTextEntry?: boolean;
  placeholder?: string;
  value?: string;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  onChangeText?: (text: string) => void;
}

const ThemedTextInput: React.FC<ThemedTextInputProps> = ({
  style,
  secureTextEntry,
  placeholder,
  value,
  autoCapitalize,
  keyboardType,
  onChangeText,
}) => {
  const borderColor = useThemeColor({}, 'border');
  const textColor = useThemeColor({}, 'text');

  return (
    <TextInput
      keyboardType={keyboardType}
      style={[styles.input, { borderColor, color: textColor }, style]}
      secureTextEntry={secureTextEntry}
      placeholder={placeholder}
      placeholderTextColor={'#A09D9D'}
      value={value}
      onChangeText={onChangeText}
      autoCapitalize={autoCapitalize}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
});

export default ThemedTextInput;
