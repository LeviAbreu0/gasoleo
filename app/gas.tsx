import React, { useState } from 'react';
import { StyleSheet, Text, View, FlatList, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DataInput from '../components/DataInput';
import NumberInput from '../components/NumberInput';
import { useData } from "@/context/DataContext";
import { useRouter } from 'expo-router';

type gasItem = { id: string; titulo: string; type: 'date' | 'number' };

export default function Index() {
  const { setLastFuel } = useData();
  const router = useRouter(); // CORRETO

  const [date, setDate] = useState('');
  const [litros, setLitros] = useState('');
  const [preco, setPreco] = useState('');
  const [km, setKm] = useState('');

  const gasdata: gasItem[] = [
    { id: "1", titulo: "Data do Abastecimento", type: 'date' },
    { id: "2", titulo: "Litros abastecidos", type: 'number' },
    { id: "3", titulo: "Preço pago", type: 'number' },
    { id: "4", titulo: "Quilometragem atual", type: 'number' },
  ];

  const renderizarItem = ({ item }: { item: gasItem }) => {
    let inputField;
    if (item.type === 'date') {
      inputField = <DataInput value={date} onChange={setDate} />;
    } else if (item.type === 'number') {
      const valMap: Record<string, [string, React.Dispatch<React.SetStateAction<string>>]> = {
        "Litros abastecidos": [litros, setLitros],
        "Preço pago": [preco, setPreco],
        "Quilometragem atual": [km, setKm],
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

  const handleAdd = () => {
    if (date && litros && preco && km) {
      setLastFuel({
        date,
        liters: litros,
        km
      });

      // Limpar campos
      setDate('');
      setLitros('');
      setPreco('');
      setKm('');

      // Voltar para a página inicial
      router.push('/'); // usa o Expo Router para navegar
    } else {
      alert("Preencha todos os campos!");
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView contentContainerStyle={{ paddingBottom: 50 }}>
          <Text style={styles.container}>Adicionar Gasolina</Text>
          <FlatList
            data={gasdata}
            renderItem={renderizarItem}
            keyExtractor={(item) => item.id}
          />
          <TouchableOpacity style={styles.button} onPress={handleAdd}>
            <Text style={styles.textButton}>Adicionar</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { marginTop: 10, marginLeft: 10, fontWeight: "400" },
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
