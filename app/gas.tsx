import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DataInput from "@/components/DataInput";
import NumberInput from "@/components/NumberInput";
import { useData } from "@/context/DataContext";
import { useRouter } from "expo-router";

type GasItem = { id: string; titulo: string; type: "date" | "number" };

export default function Gas() {
  const { addFuel } = useData();
  const router = useRouter();

  const [date, setDate] = useState("");
  const [litros, setLitros] = useState("");
  const [preco, setPreco] = useState("");
  const [km, setKm] = useState("");
  const [saving, setSaving] = useState(false);

  const gasData: GasItem[] = [
    { id: "1", titulo: "Data do Abastecimento", type: "date" },
    { id: "2", titulo: "Litros abastecidos", type: "number" },
    { id: "3", titulo: "Preço pago", type: "number" },
    { id: "4", titulo: "Quilometragem atual", type: "number" },
  ];

  const renderizarItem = ({ item }: { item: GasItem }) => {
    let inputField;
    if (item.type === "date") {
      inputField = <DataInput value={date} onChange={setDate} />;
    } else if (item.type === "number") {
      const valMap: Record<
        string,
        [string, React.Dispatch<React.SetStateAction<string>>]
      > = {
        "Litros abastecidos": [litros, setLitros],
        "Preço pago": [preco, setPreco],
        "Quilometragem atual": [km, setKm],
      };
      const [val, setVal] = valMap[item.titulo];
      inputField = (
        <NumberInput
          value={val}
          onChange={setVal}
          placeholder={`Digite ${item.titulo.toLowerCase()}`}
        />
      );
    }

    return (
      <View style={styles.infotable}>
        <Text style={styles.title}>{item.titulo}</Text>
        {inputField}
      </View>
    );
  };

  const handleAdd = async () => {
    if (!date || !litros || !preco || !km) {
      Alert.alert("Atenção", "Preencha todos os campos!");
      return;
    }
    try {
      setSaving(true);
      await addFuel({ date, liters: litros, km, price: preco });
      setDate("");
      setLitros("");
      setPreco("");
      setKm("");
      router.push("/");
    } catch (e) {
      Alert.alert(
        "Erro",
        e instanceof Error ? e.message : "Não foi possível salvar."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <FlatList
          data={gasData}
          renderItem={renderizarItem}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <>
              <Text style={styles.container}>Adicionar Gasolina</Text>
            </>
          }
          ListFooterComponent={
            <TouchableOpacity
              style={[styles.buttonWrap, saving && styles.buttonDisabled]}
              onPress={() => void handleAdd()}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.textButton}>Adicionar</Text>
              )}
            </TouchableOpacity>
          }
          contentContainerStyle={{ paddingBottom: 50 }}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { marginTop: 10, marginLeft: 10, fontWeight: "500" },
  infotable: {
    backgroundColor: "#e5e5e5",
    margin: 20,
    padding: 15,
    borderRadius: 8,
  },
  title: { fontSize: 16, fontWeight: "500" },
  buttonWrap: {
    alignSelf: "center",
    marginTop: 20,
    backgroundColor: "#6A00FF",
    borderRadius: 25,
    width: 300,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.7 },
  textButton: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
