// histórico.tsx
import React, { useMemo } from "react";
import { StyleSheet, Text, View, FlatList, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useData } from "@/context/DataContext";

const { width } = Dimensions.get("window");

function parseBRDate(d: string) {
  const iso = new Date(d);
  if (!isNaN(iso.getTime())) return iso;
  const m = /^(\d{2})[\/\-](\d{2})[\/\-](\d{4})$/.exec(String(d));
  if (m) {
    const [, dd, mm, yyyy] = m;
    return new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  }
  return new Date(NaN);
}

function toNumber(v: any) {
  if (typeof v === "number") return v;
  if (v == null || v === "") return 0;
  const n = parseFloat(String(v).replace(",", "."));
  return isFinite(n) ? n : 0;
}

export default function Historico() {
  const { fuelHistory, oilHistory } = useData();

  // Junta os registros e ordena por data decrescente
  const allEntries = useMemo(() => {
    const combined = [
      ...(Array.isArray(fuelHistory) ? fuelHistory.map(e => ({...e, type: "Gasolina"})) : []),
      ...(Array.isArray(oilHistory) ? oilHistory.map(e => ({...e, type: "Óleo"})) : []),
    ];

    combined.sort((a, b) => {
      const dateA = parseBRDate(a.date ?? a.date ?? "");
      const dateB = parseBRDate(b.date ?? b.date ?? "");
      return dateB.getTime() - dateA.getTime();
    });

    return combined;
  }, [fuelHistory, oilHistory]);

  const renderItem = ({ item }: any) => (
    <View style={styles.itemContainer}>
      <Text style={styles.type}>{item.type}</Text>
      <Text style={styles.date}>{item.date ?? item.data}</Text>
      <Text style={styles.value}>
        {item.liters ? `${item.liters} L • ${item.km} km` : `${item.km} km`}
        {item.price || item.valor ? ` • R$ ${toNumber(item.price ?? item.valor).toFixed(2)}` : ""}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Histórico de Gastos Óleo e Gasolina</Text>
      </View>

      {allEntries.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Nenhum registro encontrado.</Text>
        </View>
      ) : (
        <FlatList
          data={allEntries}
          keyExtractor={(item, index) => `${item.type}-${item.date ?? index}`}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  header: { padding: 20, borderBottomWidth: 1, borderBottomColor: "#ccc" },
  title: { fontSize: 20, fontWeight: "600" },
  list: { paddingHorizontal: 20, paddingVertical: 10 },
  itemContainer: {
    padding: 15,
    marginBottom: 10,
    backgroundColor: "#f6f6f6",
    borderRadius: 10,
  },
  type: { fontWeight: "700", fontSize: 16, marginBottom: 5 },
  date: { color: "#666", marginBottom: 5 },
  value: { fontSize: 14 },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { fontSize: 16, color: "#888" },
});
