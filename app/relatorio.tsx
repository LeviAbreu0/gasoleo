import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { useData } from "@/context/DataContext";
import { parseEntryDateToLocalDate } from "@/lib/date";
import { toNumber } from "@/lib/numbers";

export default function Reports() {
  const { fuelHistory, oilHistory, lastOil, refresh, refreshing, loading } =
    useData();
  const [gastoCombustivel, setGastoCombustivel] = useState(0);
  const [gastoOleo, setGastoOleo] = useState(0);
  const [consumoMedio, setConsumoMedio] = useState(0);
  const [historicoMes, setHistoricoMes] = useState<
    { type: string; date: string; liters?: string; km?: string; price?: string }[]
  >([]);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh])
  );

  useEffect(() => {
    const agora = new Date();
    const mesAtual = agora.getMonth();
    const anoAtual = agora.getFullYear();

    const combustivelMes = (fuelHistory || [])
      .map((it) => ({
        ...it,
        _date: parseEntryDateToLocalDate(it.date),
        type: "Gasolina" as const,
      }))
      .filter((it) => !isNaN(it._date.getTime()))
      .filter(
        (it) =>
          it._date.getMonth() === mesAtual && it._date.getFullYear() === anoAtual
      );

    const oleoMes = (oilHistory || [])
      .map((it) => ({
        ...it,
        _date: parseEntryDateToLocalDate(it.date),
        type: "Óleo" as const,
      }))
      .filter((it) => !isNaN(it._date.getTime()))
      .filter(
        (it) =>
          it._date.getMonth() === mesAtual && it._date.getFullYear() === anoAtual
      );

    const gastoComb = combustivelMes.reduce(
      (acc, it) => acc + toNumber(it.price),
      0
    );
    const gastoO = oleoMes.reduce((acc, it) => acc + toNumber(it.price), 0);

    setGastoCombustivel(gastoComb);
    setGastoOleo(gastoO);

    const combinado = [...combustivelMes, ...oleoMes].sort(
      (a, b) => b._date.getTime() - a._date.getTime()
    );
    setHistoricoMes(
      combinado.map((row) => {
        const base = {
          type: row.type,
          date: row.date,
          km: row.km,
          price: row.price,
        };
        return row.type === "Gasolina"
          ? { ...base, liters: row.liters }
          : base;
      })
    );

    // km/L no mês ≈ Δkm / Σ litros (litros do mês). Δkm = max(km)−min(km) no mês
    // com ≥2 abastecimentos; com 1, Δkm = km atual − hodômetro do último abastecimento anterior ao mês.
    const sortedFuel = [...combustivelMes].sort(
      (a, b) => a._date.getTime() - b._date.getTime()
    );
    const totalLitros = sortedFuel.reduce(
      (acc, it) => acc + toNumber(it.liters),
      0
    );

    let kmRodados = 0;
    if (sortedFuel.length >= 2) {
      const kms = sortedFuel.map((it) => toNumber(it.km));
      kmRodados = Math.max(...kms) - Math.min(...kms);
    } else if (sortedFuel.length === 1) {
      const unicoKm = toNumber(sortedFuel[0].km);
      const anteriores = (fuelHistory || [])
        .map((it) => ({ ...it, _date: parseEntryDateToLocalDate(it.date) }))
        .filter((it) => !isNaN(it._date.getTime()))
        .filter(
          (it) =>
            it._date.getFullYear() < anoAtual ||
            (it._date.getFullYear() === anoAtual &&
              it._date.getMonth() < mesAtual)
        )
        .sort((a, b) => toNumber(b.km) - toNumber(a.km));

      if (anteriores.length > 0) {
        const kmAnterior = toNumber(anteriores[0].km);
        if (isFinite(kmAnterior)) kmRodados = Math.max(0, unicoKm - kmAnterior);
      }
    }

    const cm =
      totalLitros > 0 && kmRodados > 0 ? kmRodados / totalLitros : 0;
    setConsumoMedio(Number.isFinite(cm) ? cm : 0);
  }, [fuelHistory, oilHistory]);

  const intervaloTroca = toNumber(lastOil?.kmTroca);
  const proximaTroca = lastOil
    ? `${toNumber(lastOil.km) + (intervaloTroca > 0 ? intervaloTroca : 1000)} km`
    : "Sem dados registrados";

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.inner}>
        <Text style={styles.heading}>Relatório do Mês</Text>

        {loading && !fuelHistory?.length && !oilHistory?.length ? (
          <ActivityIndicator style={styles.loader} color="#6A00FF" />
        ) : null}

        <Text style={styles.line}>
          Gasto com combustível: R$ {gastoCombustivel.toFixed(2)}
        </Text>
        <Text style={styles.line}>
          Gasto com óleo: R$ {gastoOleo.toFixed(2)}
        </Text>
        <Text style={styles.totalLine}>
          Total no mês: R$ {(gastoCombustivel + gastoOleo).toFixed(2)}
        </Text>

        <Text style={styles.line}>
          Consumo médio: {consumoMedio.toFixed(2)} km/L
        </Text>
        <Text style={styles.line}>Próxima troca de óleo: {proximaTroca}</Text>

        <Text style={styles.subheading}>Histórico do mês</Text>

        {historicoMes.length === 0 ? (
          <Text style={styles.muted}>Nenhum registro encontrado neste mês.</Text>
        ) : (
          <FlatList
            data={historicoMes}
            keyExtractor={(item, index) => `${item.type}-${item.date}-${index}`}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={refresh} />
            }
            renderItem={({ item }) => (
              <View style={styles.row}>
                <Text style={styles.rowTitle}>Tipo: {item.type}</Text>
                <Text>Data: {item.date}</Text>
                {item.liters ? <Text>Litros: {item.liters}</Text> : null}
                {item.km ? <Text>Km: {item.km}</Text> : null}
                {item.price ? (
                  <Text>Valor: R$ {toNumber(item.price).toFixed(2)}</Text>
                ) : null}
              </View>
            )}
            initialNumToRender={12}
            windowSize={5}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  inner: { flex: 1, padding: 20 },
  heading: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  subheading: { fontSize: 18, fontWeight: "bold", marginTop: 12, marginBottom: 10 },
  line: { fontSize: 16, marginBottom: 5 },
  totalLine: { fontSize: 16, marginBottom: 5, fontWeight: "600" },
  muted: { fontSize: 15, color: "#666" },
  row: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#ccc",
  },
  rowTitle: { fontWeight: "600", marginBottom: 4 },
  loader: { marginVertical: 8 },
});
