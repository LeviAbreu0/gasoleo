import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';

type Props = {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
};

export default function NumberInput({ value, onChange, placeholder }: Props) {
  return (
    <View style={{ marginTop: 5 }}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        keyboardType="decimal-pad"
        value={value}
        onChangeText={onChange}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 6,
    backgroundColor: '#fff',
    fontSize: 16,
    color: '#333',
  },
});
