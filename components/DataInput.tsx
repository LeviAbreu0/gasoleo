import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';

type Props = {
  value: string;
  onChange: (val: string) => void;
};

export default function DataInput({ value, onChange }: Props) {
  const handleChange = (text: string) => {
    // Remove tudo que não é número
    let numeric = text.replace(/\D/g, '');
    
    // Coloca as barras automaticamente
    if (numeric.length > 2 && numeric.length <= 4) {
      numeric = numeric.slice(0,2) + '/' + numeric.slice(2);
    } else if (numeric.length > 4) {
      numeric = numeric.slice(0,2) + '/' + numeric.slice(2,4) + '/' + numeric.slice(4,8);
    }

    // Limita a 10 caracteres (dd/mm/aaaa)
    if (numeric.length > 10) numeric = numeric.slice(0,10);

    onChange(numeric);
  };

  return (
    <View style={{ marginTop: 5 }}>
      <TextInput
        style={styles.input}
        placeholder="__/__/____"
        keyboardType="number-pad"
        value={value}
        onChangeText={handleChange}
        maxLength={10}
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
