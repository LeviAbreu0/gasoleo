import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import { useData } from "@/context/DataContext";
import DataInput from "@/components/DataInput";
import NumberInput from "@/components/NumberInput";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TIPOS_OLEO_KM } from "@/constants/oilTypes";

type OilItem = { id: string; titulo: string; type: "date" | "number" | "string" };

export default function Oil() {
  const { addOil } = useData();
  const router = useRouter();

  const [date, setDate] = useState("");
  const [oleo, setOleo] = useState("");
  const [preco, setPreco] = useState("");
  const [km, setKm] = useState("");
  const [kmTroca, setKmTroca] = useState<number>(0);
  const [showAlert, setShowAlert] = useState(false);
  const [saving, setSaving] = useState(false);

  const oilData: OilItem[] = [
    { id: "1", titulo: "Data da troca", type: "date" },
    { id: "2", titulo: "Tipo de óleo usado", type: "string" },
    { id: "3", titulo: "Preço pago", type: "number" },
    { id: "4", titulo: "Quilometragem da troca", type: "number" },
  ];

  useEffect(() => {
    const checkAlert = async () => {
      const value = await AsyncStorage.getItem("showOilAlert");
      if (value !== "false") {
        setShowAlert(true);
      }
    };
    void checkAlert();
  }, []);

  useEffect(() => {
    if (showAlert) {
      const t = setTimeout(() => {
        Alert.alert(
          "Atenção sobre o óleo",
          "O óleo deve ser trocado na quilometragem indicada ou a cada 6 meses. Verifique sempre o nível e o tipo de óleo recomendado.",
          [
            { text: "OK", onPress: () => setShowAlert(false) },
            {
              text: "Não mostrar novamente",
              onPress: async () => {
                await AsyncStorage.setItem("showOilAlert", "false");
                setShowAlert(false);
              },
            },
          ]
        );
      }, 0);
      return () => clearTimeout(t);
    }
  }, [showAlert]);

  const renderizarItem = ({ item }: { item: OilItem }) => {
    let inputField: React.ReactNode = null;

    if (item.type === "date")
      inputField = <DataInput value={date} onChange={setDate} />;
    else if (item.type === "string")
      inputField = (
        <View style={styles.selectBox}>
          <Picker
            selectedValue={oleo}
            onValueChange={(v) => {
              setOleo(v);
              setKmTroca(TIPOS_OLEO_KM[v] || 0);
            }}
          >
            <Picker.Item label="Selecione o tipo de óleo..." value="" />
            {Object.keys(TIPOS_OLEO_KM).map((x) => (
              <Picker.Item
                key={x}
                label={`${x} (${TIPOS_OLEO_KM[x]} km)`}
                value={x}
              />
            ))}
          </Picker>
        </View>
      );
    else if (item.type === "number") {
      const valMap: Record<
        string,
        [string, React.Dispatch<React.SetStateAction<string>>]
      > = {
        "Preço pago": [preco, setPreco],
        "Quilometragem da troca": [km, setKm],
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

  const handleSave = async () => {
    if (!date || !km || !oleo) {
      Alert.alert("Erro", "Preencha data, quilometragem e tipo de óleo!");
      return;
    }
    try {
      setSaving(true);
      await addOil({ date, km, type: oleo, price: preco, kmTroca });
      setDate("");
      setKm("");
      setOleo("");
      setPreco("");
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
          data={oilData}
          renderItem={renderizarItem}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <Text style={styles.container}>Adicionar óleo</Text>
          }
          ListFooterComponent={
            <TouchableOpacity
              style={[styles.buttonWrap, saving && styles.buttonDisabled]}
              onPress={() => void handleSave()}
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
  container: { marginTop: 10, marginLeft: 10, fontWeight: "600" },
  infotable: {
    backgroundColor: "#e5e5e5",
    margin: 20,
    padding: 15,
    borderRadius: 8,
  },
  title: { fontSize: 16, fontWeight: "500" },
  selectBox: {
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 6,
    backgroundColor: "#fff",
    marginTop: 8,
    height: 40,
    justifyContent: "center",
  },
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
