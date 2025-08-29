import React, { useState } from 'react';
import { StyleSheet, Text, View, FlatList, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Picker } from '@react-native-picker/picker';
import { useRouter } from "expo-router";
import { useData } from "../context/DataContext"; // <- pega do contexto
import DataInput from '../components/DataInput';
import NumberInput from '../components/NumberInput';

type oilItem = { id: string; titulo: string; type: 'date' | 'number' | 'string' };

export default function Oil() {
  const { setLastOil } = useData();
  const router = useRouter();

  const [date, setDate] = useState('');
  const [oleo, setOleo] = useState('');
  const [preco, setPreco] = useState('');
  const [km, setKm] = useState('');

  const oilData: oilItem[] = [
    { id: "1", titulo: "Data da troca", type: 'date' },
    { id: "2", titulo: "Tipo de óleo usado", type: 'string' },
    { id: "3", titulo: "Preço pago", type: 'number' },
    { id: "4", titulo: "Quilometragem da troca", type: 'number' },
  ];

  const renderizarItem = ({ item }: { item: oilItem }) => {
    let inputField: React.ReactNode = null;

    if (item.type === 'date') {
      inputField = <DataInput value={date} onChange={setDate} />;
    } else if (item.type === 'string') {
      inputField = (
        <View style={styles.selectBox}>
          <Picker
            selectedValue={oleo}
            onValueChange={(v) => setOleo(v)}
            mode="dropdown"
          >
            <Picker.Item label="Selecione o tipo de óleo..." value="" />
            <Picker.Item label="Mineral 20W-50" value="Mineral 20W-50" />
            <Picker.Item label="Semissintético 15W-50" value="Semissintético 15W-50" />
            <Picker.Item label="Sintético 10W-40" value="Sintético 10W-40" />
            <Picker.Item label="Sintético 5W-30" value="Sintético 5W-30" />
            <Picker.Item label="ATF (câmbio)" value="ATF" />
            <Picker.Item label="2T (motos 2 tempos)" value="2T" />
          </Picker>
        </View>
      );
    } else if (item.type === 'number') {
      const valMap: Record<string, [string, React.Dispatch<React.SetStateAction<string>>]> = {
        "Preço pago": [preco, setPreco],
        "Quilometragem da troca": [km, setKm],
      };
      const [val, setVal] = valMap[item.titulo];
      inputField = <NumberInput value={val} onChange={setVal} placeholder={`Digite ${item.titulo.toLowerCase()}`} />;
    }

    return (
      <View style={styles.infotable}>
        <Text style={styles.title}>{item.titulo}</Text>
        {inputField}
      </View>
    );
  };

  const handleSave = () => {
    setLastOil({ date, km }); 
    router.push("/"); 
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView contentContainerStyle={{ paddingBottom: 50 }}>
          <Text style={styles.container}>Adicionar óleo</Text>
          <FlatList
            data={oilData}
            renderItem={renderizarItem}
            keyExtractor={(item) => item.id}
          />
          <TouchableOpacity style={styles.button} onPress={handleSave}>
            <Text style={styles.textButton}>Adicionar</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: {
    marginTop: 10,
    marginLeft: 10, 
    fontWeight: "600",
  },
  infotable: {
    backgroundColor: "#e5e5e5",
    margin: 20,
    padding: 15,
    borderRadius: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "500",
  },
  selectBox: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 6,
    backgroundColor: '#fff',
    marginTop: 8,
    height: 40,
    justifyContent: 'center',
  },
  button: {
    alignSelf: 'center',
    marginTop: 20,
  },
  textButton: {
    backgroundColor: '#6A00FF',
    borderRadius: 25,
    width: 300,
    height: 40,
    color: '#fff',
    textAlign: 'center',
    textAlignVertical: 'center',
    lineHeight: 40,
  }
});
