import React, {
  useMemo,
  useCallback,
  useState,
  useEffect,
} from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Dimensions,
  Modal,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Picker } from "@react-native-picker/picker";
import { useFocusEffect } from "@react-navigation/native";
import { useData } from "@/context/DataContext";
import { HistoryRow } from "@/components/HistoryRow";
import DataInput from "@/components/DataInput";
import NumberInput from "@/components/NumberInput";
import { parseEntryDateToLocalDate, compareNewestFirst } from "@/lib/date";
import { toNumber } from "@/lib/numbers";
import { TIPOS_OLEO_KM } from "@/constants/oilTypes";

const { width } = Dimensions.get("window");

type Combined = {
  key: string;
  kind: "fuel" | "oil";
  id: string;
  type: string;
  typeLabel: string;
  date: string;
  liters?: string;
  km?: string;
  price?: string;
  oilType?: string;
};

type EditFuel = {
  kind: "fuel";
  id: string;
  date: string;
  liters: string;
  km: string;
  price: string;
};

type EditOil = {
  kind: "oil";
  id: string;
  date: string;
  km: string;
  type: string;
  price: string;
  kmTroca: string;
};

export default function Historico() {
  const {
    fuelHistory,
    oilHistory,
    refresh,
    refreshing,
    loading,
    error,
    clearError,
    updateFuel,
    updateOil,
    deleteFuel,
    deleteOil,
  } = useData();

  const [modalOpen, setModalOpen] = useState(false);
  const [edit, setEdit] = useState<EditFuel | EditOil | null>(null);
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh])
  );

  const allEntries = useMemo(() => {
    const fuelRows: Combined[] = (fuelHistory || []).map((e) => ({
      key: `fuel-${e.id}`,
      kind: "fuel",
      id: e.id,
      type: "Gasolina",
      typeLabel: "Gasolina",
      date: e.date,
      liters: e.liters,
      km: e.km,
      price: e.price,
    }));

    const oilRows: Combined[] = (oilHistory || []).map((e) => ({
      key: `oil-${e.id}`,
      kind: "oil",
      id: e.id,
      type: "Óleo",
      typeLabel: e.type ? `Óleo (${e.type})` : "Óleo",
      date: e.date,
      km: e.km,
      price: e.price,
      oilType: e.type,
    }));

    const combined = [...fuelRows, ...oilRows];
    combined.sort((a, b) => {
      const da = parseEntryDateToLocalDate(a.date);
      const db = parseEntryDateToLocalDate(b.date);
      const t = db.getTime() - da.getTime();
      if (t !== 0) return t;
      return compareNewestFirst(
        { date: a.date, id: a.id },
        { date: b.date, id: b.id }
      );
    });

    return combined;
  }, [fuelHistory, oilHistory]);

  useEffect(() => {
    if (!edit) return;
    const still = allEntries.find((e) => e.id === edit.id && e.kind === edit.kind);
    if (!still) {
      setModalOpen(false);
      setEdit(null);
    }
  }, [allEntries, edit]);

  const openEdit = (item: Combined) => {
    if (item.kind === "fuel") {
      setEdit({
        kind: "fuel",
        id: item.id,
        date: item.date,
        liters: item.liters ?? "",
        km: item.km ?? "",
        price: item.price ?? "",
      });
    } else {
      const oil = oilHistory.find((o) => o.id === item.id);
      setEdit({
        kind: "oil",
        id: item.id,
        date: item.date,
        km: item.km ?? "",
        type: oil?.type ?? "",
        price: oil?.price ?? "",
        kmTroca: oil?.kmTroca != null ? String(oil.kmTroca) : "",
      });
    }
    setModalOpen(true);
  };

  const confirmDelete = (item: Combined) => {
    Alert.alert(
      "Excluir registro",
      "Tem certeza? Esta ação não pode ser desfeita.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: () => {
            void (async () => {
              try {
                if (item.kind === "fuel") await deleteFuel(item.id);
                else await deleteOil(item.id);
              } catch (e) {
                Alert.alert(
                  "Erro",
                  e instanceof Error ? e.message : "Falha ao excluir."
                );
              }
            })();
          },
        },
      ]
    );
  };

  const saveEdit = async () => {
    if (!edit) return;
    try {
      setSaving(true);
      if (edit.kind === "fuel") {
        await updateFuel(edit.id, {
          date: edit.date,
          liters: edit.liters,
          km: edit.km,
          price: edit.price,
        });
      } else {
        await updateOil(edit.id, {
          date: edit.date,
          km: edit.km,
          type: edit.type,
          price: edit.price,
          kmTroca: edit.kmTroca || undefined,
        });
      }
      setModalOpen(false);
      setEdit(null);
    } catch (e) {
      Alert.alert(
        "Erro",
        e instanceof Error ? e.message : "Não foi possível salvar."
      );
    } finally {
      setSaving(false);
    }
  };

  const renderItem = ({ item }: { item: Combined }) => {
    const priceNum = toNumber(item.price);
    const detail = item.liters
      ? `${item.liters} L • ${item.km} km${item.price ? ` • R$ ${priceNum.toFixed(2)}` : ""}`
      : `${item.km} km${item.price ? ` • R$ ${priceNum.toFixed(2)}` : ""}`;

    return (
      <HistoryRow
        typeLabel={item.typeLabel}
        date={item.date}
        detail={detail}
        onEdit={() => openEdit(item)}
        onDelete={() => confirmDelete(item)}
      />
    );
  };

  const keyExtractor = (item: Combined) => item.key;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Histórico de Gastos Óleo e Gasolina</Text>
      </View>

      {error ? (
        <TouchableOpacity style={styles.errBar} onPress={clearError}>
          <Text style={styles.errText}>{error} (toque para fechar)</Text>
        </TouchableOpacity>
      ) : null}

      {loading && allEntries.length === 0 ? (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#6A00FF" />
        </View>
      ) : allEntries.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Nenhum registro encontrado.</Text>
        </View>
      ) : (
        <FlatList
          data={allEntries}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={refresh} />
          }
          initialNumToRender={14}
          windowSize={7}
          removeClippedSubviews
        />
      )}

      <Modal visible={modalOpen} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {edit?.kind === "fuel" ? "Editar abastecimento" : "Editar óleo"}
            </Text>
            <ScrollView keyboardShouldPersistTaps="handled">
              {edit?.kind === "fuel" ? (
                <>
                  <Text style={styles.fieldLabel}>Data</Text>
                  <DataInput
                    value={edit.date}
                    onChange={(v) => setEdit({ ...edit, date: v })}
                  />
                  <Text style={styles.fieldLabel}>Litros</Text>
                  <NumberInput
                    value={edit.liters}
                    onChange={(v) => setEdit({ ...edit, liters: v })}
                  />
                  <Text style={styles.fieldLabel}>Preço</Text>
                  <NumberInput
                    value={edit.price}
                    onChange={(v) => setEdit({ ...edit, price: v })}
                  />
                  <Text style={styles.fieldLabel}>Km</Text>
                  <NumberInput
                    value={edit.km}
                    onChange={(v) => setEdit({ ...edit, km: v })}
                  />
                </>
              ) : null}

              {edit?.kind === "oil" ? (
                <>
                  <Text style={styles.fieldLabel}>Data</Text>
                  <DataInput
                    value={edit.date}
                    onChange={(v) => setEdit({ ...edit, date: v })}
                  />
                  <Text style={styles.fieldLabel}>Tipo</Text>
                  <View style={styles.selectBox}>
                    <Picker
                      selectedValue={edit.type}
                      onValueChange={(v) =>
                        setEdit({
                          ...edit,
                          type: v,
                          kmTroca:
                            v && TIPOS_OLEO_KM[v] != null
                              ? String(TIPOS_OLEO_KM[v])
                              : edit.kmTroca,
                        })
                      }
                    >
                      <Picker.Item label="Selecione..." value="" />
                      {Object.keys(TIPOS_OLEO_KM).map((t) => (
                        <Picker.Item key={t} label={t} value={t} />
                      ))}
                    </Picker>
                  </View>
                  <Text style={styles.fieldLabel}>Preço</Text>
                  <NumberInput
                    value={edit.price}
                    onChange={(v) => setEdit({ ...edit, price: v })}
                  />
                  <Text style={styles.fieldLabel}>Km</Text>
                  <NumberInput
                    value={edit.km}
                    onChange={(v) => setEdit({ ...edit, km: v })}
                  />
                </>
              ) : null}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalCancel]}
                onPress={() => {
                  setModalOpen(false);
                  setEdit(null);
                }}
              >
                <Text style={styles.modalBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalSave, saving && { opacity: 0.7 }]}
                disabled={saving}
                onPress={() => void saveEdit()}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.modalBtnText}>Salvar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  header: { padding: 20, borderBottomWidth: 1, borderBottomColor: "#ccc" },
  title: { fontSize: 20, fontWeight: "600" },
  list: { paddingHorizontal: 20, paddingVertical: 10, paddingBottom: 40 },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: { fontSize: 16, color: "#888" },
  errBar: {
    backgroundColor: "#ffebee",
    padding: 10,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
  },
  errText: { color: "#b71c1c", fontSize: 13 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: width * 0.05,
  },
  modalCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    maxHeight: "90%",
  },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  fieldLabel: { marginTop: 8, fontWeight: "600", fontSize: 14 },
  selectBox: {
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 6,
    marginTop: 4,
    marginBottom: 8,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 16,
  },
  modalBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    minWidth: 100,
    alignItems: "center",
  },
  modalCancel: { backgroundColor: "#9e9e9e" },
  modalSave: { backgroundColor: "#6A00FF" },
  modalBtnText: { color: "#fff", fontWeight: "600" },
});
