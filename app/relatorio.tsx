import React, { useEffect, useState } from "react";
import { View, Text, FlatList } from "react-native";
import { useData } from "@/context/DataContext";

function parseBRDate(d: string) {
  // Tenta ISO primeiro
  const iso = new Date(d);
  if (!isNaN(iso.getTime())) return iso;

  // Tenta DD/MM/AAAA
  const m = /^(\d{2})[\/\-](\d{2})[\/\-](\d{4})$/.exec(String(d));
  if (m) {
    const [_, dd, mm, yyyy] = m;
    return new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  }

  // Fallback: inválida
  return new Date(NaN);
}

function toNum(v: any) {
  if (typeof v === "number") return v;
  if (v == null) return 0;
  // trata vírgula como decimal
  const n = parseFloat(String(v).replace(",", "."));
  return isFinite(n) ? n : 0;
}

export default function Reports() {
  const { fuelHistory, lastOil } = useData();
  const [gastoMes, setGastoMes] = useState(0);
  const [consumoMedio, setConsumoMedio] = useState(0);
  const [abastecimentosMes, setAbastecimentosMes] = useState<any[]>([]);

  useEffect(() => {
    const agora = new Date();
    const mesAtual = agora.getMonth();
    const anoAtual = agora.getFullYear();

    // 1) Filtra abastecimentos do mês atual, parseando a data com segurança
    const doMes = fuelHistory
      .map((it) => ({ ...it, _date: parseBRDate(it.date) }))
      .filter((it) => !isNaN(it._date.getTime()))
      .filter(
        (it) =>
          it._date.getMonth() === mesAtual && it._date.getFullYear() === anoAtual
      );

    // Ordena por km (ou por data, se preferir) para consistência do cálculo
    doMes.sort((a, b) => toNum(a.km) - toNum(b.km));

    setAbastecimentosMes(doMes);

    // 2) Gasto no mês (soma de price)
    const somaValor = doMes.reduce((acc, it) => acc + toNum(it.price), 0);
    setGastoMes(somaValor);

    // 3) Consumo médio (km/L):
    //    (kmFinal - kmInicial) / totalLitros (no mês)
    const totalLitros = doMes.reduce((acc, it) => acc + toNum(it.liters), 0);

    let kmRodados = 0;
    const kms = doMes.map((it) => toNum(it.km)).filter((n) => isFinite(n));

    if (kms.length >= 2) {
      // mais de um abastecimento no mês → usa min/max do próprio mês
      const kmMin = Math.min(...kms);
      const kmMax = Math.max(...kms);
      kmRodados = kmMax - kmMin;
    } else if (kms.length === 1) {
      // apenas um abastecimento no mês → tenta achar o último abastecimento anterior
      const unicoKm = kms[0];
      const anteriores = fuelHistory
        .map((it) => ({ ...it, _date: parseBRDate(it.date) }))
        .filter((it) => !isNaN(it._date.getTime()))
        .filter(
          (it) =>
            it._date.getFullYear() < anoAtual ||
            (it._date.getFullYear() === anoAtual &&
              it._date.getMonth() < mesAtual)
        )
        .sort((a, b) => toNum(b.km) - toNum(a.km)); // pega o maior km antes do mês

      if (anteriores.length > 0) {
        const kmAnterior = toNum(anteriores[0].km);
        if (isFinite(kmAnterior)) kmRodados = unicoKm - kmAnterior;
      } else {
        kmRodados = 0;
      }
    } else {
      kmRodados = 0;
    }

    const consumo = totalLitros > 0 ? kmRodados / totalLitros : 0;
    setConsumoMedio(consumo);
  }, [fuelHistory]);

  const proximaTroca = lastOil
    ? `${toNum(lastOil.km) + 1000} km`
    : "Sem dados registrados";

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10 }}>
        Relatórios
      </Text>

      <Text style={{ fontSize: 16, marginBottom: 5 }}>
         Gastos no mês: R$ {gastoMes.toFixed(2)}
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
      <FlatList
        data={abastecimentosMes}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <View
            style={{ padding: 10, borderBottomWidth: 1, borderColor: "#ccc" }}
          >
            <Text>Data: {item.date}</Text>
            <Text>Litros: {item.liters}</Text>
            <Text>Valor: R$ {item.price}</Text>
            <Text>Km: {item.km}</Text>
          </View>
        )}
      />
    </View>
  );
}
