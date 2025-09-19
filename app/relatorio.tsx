import React, { useEffect, useState } from "react";
import { View, Text, FlatList } from "react-native";
import { useData, FuelData, OilData } from "@/context/DataContext";

function parseBRDate(d: string) {
  const iso = new Date(d);
  if (!isNaN(iso.getTime())) return iso;

  const m = /^(\d{2})[\/\-](\d{2})[\/\-](\d{4})$/.exec(String(d));
  if (m) {
    const [_, dd, mm, yyyy] = m;
    return new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  }
  return new Date(NaN);
}

function toNum(v: any) {
  if (typeof v === "number") return v;
  if (!v) return 0;
  const n = parseFloat(String(v).replace(",", "."));
  return isFinite(n) ? n : 0;
}

export default function Reports() {
  const { fuelHistory, oilHistory, lastOil } = useData();
  const [gastoCombustivel, setGastoCombustivel] = useState(0);
  const [gastoOleo, setGastoOleo] = useState(0);
  const [consumoMedio, setConsumoMedio] = useState(0);
  const [historicoMes, setHistoricoMes] = useState<any[]>([]);

  useEffect(() => {
    const agora = new Date();
    const mesAtual = agora.getMonth();
    const anoAtual = agora.getFullYear();

    // Combustível do mês
    const combustivelMes = (fuelHistory || [])
      .map((it) => ({ ...it, _date: parseBRDate(it.date), type: "Gasolina" }))
      .filter((it) => !isNaN(it._date.getTime()))
      .filter((it) => it._date.getMonth() === mesAtual && it._date.getFullYear() === anoAtual);

    // Óleo do mês
    const oleoMes = (oilHistory || [])
      .map((it) => ({ ...it, _date: parseBRDate(it.date), type: "Óleo" }))
      .filter((it) => !isNaN(it._date.getTime()))
      .filter((it) => it._date.getMonth() === mesAtual && it._date.getFullYear() === anoAtual);

    // Gasto total
    const gastoComb = combustivelMes.reduce((acc, it) => acc + toNum(it.price), 0);
    const gastoO = oleoMes.reduce((acc, it) => acc + toNum(it.price), 0);

    setGastoCombustivel(gastoComb);
    setGastoOleo(gastoO);

    // Histórico combinado do mês
    const combinado = [...combustivelMes, ...oleoMes].sort((a, b) => b._date.getTime() - a._date.getTime());
    setHistoricoMes(combinado);

    // Consumo médio km/L
    const totalLitros = combustivelMes.reduce((acc, it) => acc + toNum(it.liters), 0);
    const kms = combustivelMes.map((it) => toNum(it.km)).filter((n) => isFinite(n));
    let kmRodados = 0;

    if (kms.length >= 2) {
      kmRodados = Math.max(...kms) - Math.min(...kms);
    } else if (kms.length === 1) {
      const unicoKm = kms[0];
      const anteriores = (fuelHistory || [])
        .map((it) => ({ ...it, _date: parseBRDate(it.date) }))
        .filter((it) => !isNaN(it._date.getTime()))
        .filter(
          (it) =>
            it._date.getFullYear() < anoAtual ||
            (it._date.getFullYear() === anoAtual && it._date.getMonth() < mesAtual)
        )
        .sort((a, b) => toNum(b.km) - toNum(a.km));

      if (anteriores.length > 0) {
        const kmAnterior = toNum(anteriores[0].km);
        if (isFinite(kmAnterior)) kmRodados = unicoKm - kmAnterior;
      }
    }

    setConsumoMedio(totalLitros > 0 ? kmRodados / totalLitros : 0);
  }, [fuelHistory, oilHistory]);

  const proximaTroca = lastOil
    ? `${toNum(lastOil.km) + 1000} km`
    : "Sem dados registrados";

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10 }}>
        Relatório do Mês
      </Text>

      <Text style={{ fontSize: 16, marginBottom: 5 }}>
        Gasto com combustível: R$ {gastoCombustivel.toFixed(2)}
      </Text>
      <Text style={{ fontSize: 16, marginBottom: 5 }}>
        Gasto com óleo: R$ {gastoOleo.toFixed(2)}
      </Text>
      <Text style={{ fontSize: 16, marginBottom: 5, fontWeight: "600" }}>
        Total no mês: R$ {(gastoCombustivel + gastoOleo).toFixed(2)}
      </Text>

      <Text style={{ fontSize: 16, marginBottom: 5 }}>
        Consumo médio: {consumoMedio.toFixed(2)} km/L
      </Text>
      <Text style={{ fontSize: 16, marginBottom: 15 }}>
        Próxima troca de óleo: {proximaTroca}
      </Text>

      <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
        Histórico do mês
      </Text>

      {historicoMes.length === 0 ? (
        <Text>Nenhum registro encontrado neste mês.</Text>
      ) : (
        <FlatList
          data={historicoMes}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={{ padding: 10, borderBottomWidth: 1, borderColor: "#ccc" }}>
              <Text>Tipo: {item.type}</Text>
              <Text>Data: {item.date}</Text>
              {item.liters && <Text>Litros: {item.liters}</Text>}
              {item.km && <Text>Km: {item.km}</Text>}
              {item.price && <Text>Valor: R$ {toNum(item.price).toFixed(2)}</Text>}
            </View>
          )}
        />
      )}
    </View>
  );
}
