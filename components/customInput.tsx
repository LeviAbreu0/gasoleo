import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';

type Props = {
  date: string; // agora é string
  setDate: (date: string) => void;
};

export default function DataInput({ date, setDate }: Props) {
  return (
    <View style={{ marginTop: 5 }}>
      <TextInput
        style={styles.input}
        placeholder="__/__/____"
        keyboardType="number-pad"
        value={date}
        onChangeText={setDate}
        maxLength={10} // dd/mm/aaaa
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
