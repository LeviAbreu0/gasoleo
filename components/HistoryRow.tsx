import React, { memo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export type HistoryRowProps = {
  typeLabel: string;
  date: string;
  detail: string;
  onEdit: () => void;
  onDelete: () => void;
};

function HistoryRowBase({
  typeLabel,
  date,
  detail,
  onEdit,
  onDelete,
}: HistoryRowProps) {
  return (
    <View style={styles.itemContainer}>
      <Text style={styles.type}>{typeLabel}</Text>
      <Text style={styles.date}>{date}</Text>
      <Text style={styles.value}>{detail}</Text>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.btn} onPress={onEdit}>
          <Text style={styles.btnText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, styles.danger, styles.btnSecond]}
          onPress={onDelete}
        >
          <Text style={styles.btnText}>Excluir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export const HistoryRow = memo(HistoryRowBase);

const styles = StyleSheet.create({
  itemContainer: {
    padding: 15,
    marginBottom: 10,
    backgroundColor: "#f6f6f6",
    borderRadius: 10,
  },
  type: { fontWeight: "700", fontSize: 16, marginBottom: 5 },
  date: { color: "#666", marginBottom: 5 },
  value: { fontSize: 14, marginBottom: 8 },
  actions: { flexDirection: "row" },
  btnSecond: { marginLeft: 10 },
  btn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: "#6A00FF",
    borderRadius: 8,
  },
  danger: { backgroundColor: "#c62828" },
  btnText: { color: "#fff", fontWeight: "600", fontSize: 14 },
});
