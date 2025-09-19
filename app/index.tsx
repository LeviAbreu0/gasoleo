// Index.tsx
import React, { useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useData } from "@/context/DataContext";
import { BarChart } from "react-native-chart-kit";

const { width } = Dimensions.get("window");

function parseBRDate(d: string) {
  const iso = new Date(d);
  if (!isNaN(iso.getTime())) return iso;
  const m = /^(\d{2})[\/\-](\d{2})[\/\-](\d{4})$/.exec(String(d));
  if (m) {
    const [, , mm, yyyy] = m;
    return new Date(Number(yyyy), Number(mm) - 1, 1);
  }
  return new Date(NaN);
}

function toNumber(v: any) {
  if (typeof v === "number") return v;
  if (v == null || v === "") return 0;
  const n = parseFloat(String(v).replace(",", "."));
  return isFinite(n) ? n : 0;
}

const MONTH_NAMES_PT = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

export default function Index() {
  const router = useRouter();
  const { lastFuel, lastOil, fuelHistory, oilHistory } = useData();

  // calcula totals por mês (últimos 6 meses incluindo o atual)
  const monthsToShow = 6;
  const { labels, totals } = useMemo(() => {
    const now = new Date();
    const months: { year: number; month: number }[] = [];
    for (let i = monthsToShow - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ year: d.getFullYear(), month: d.getMonth() });
    }

    // inicializa soma
    const totalsArr = months.map(() => 0);

    const allEntries = [
      ...(Array.isArray(fuelHistory) ? fuelHistory : []),
      ...(Array.isArray(oilHistory) ? oilHistory : []),
    ];

    allEntries.forEach((entry: any) => {
      const date = parseBRDate(entry.date ?? entry.data ?? "");
      if (isNaN(date.getTime())) return;
      const y = date.getFullYear();
      const m = date.getMonth();
      const idx = months.findIndex((mm) => mm.year === y && mm.month === m);
      if (idx === -1) return;
      const price = toNumber(entry.price ?? entry.valor ?? 0);
      totalsArr[idx] += price;
    });

    const labels = months.map((mm) => MONTH_NAMES_PT[mm.month]);
    return { labels, totals: totalsArr };
  }, [fuelHistory, oilHistory]);

  const chartData = {
    labels,
    datasets: [{ data: totals }],
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View>
        <Text style={styles.container}>Hoje</Text>
        <Text style={styles.date}>{lastFuel?.date || lastOil?.date || ""}</Text>
      </View>

      <View style={styles.infotable}>
        <View style={styles.infoBox}>
          <Text>Último abastecimento</Text>
          <Text>
            {lastFuel
              ? `${lastFuel.date} • ${lastFuel.liters} L • ${lastFuel.km} km`
              : "-"}
          </Text>
        </View>

        <View style={styles.infoBox}>
          <Text>Última troca de óleo</Text>
          <Text>{lastOil ? `${lastOil.date} • ${lastOil.km} km` : "-"}</Text>
        </View>
      </View>

      <View style={styles.iconRow}>
        <TouchableOpacity
          style={styles.iconContainer}
          onPress={() => router.push("/gas")}
        >
          <Image
            source={require("@/assets/images/gas-icon.png")}
            style={styles.icon}
            resizeMode="contain"
          />
          <Text style={styles.iconText}>Gasolina</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconContainer}
          onPress={() => router.push("/oil")}
        >
          <Image
            source={require("@/assets/images/oil-icon.png")}
            style={styles.icon}
            resizeMode="contain"
          />
          <Text style={styles.iconText}>Óleo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconContainer}
          onPress={() => router.push("/relatorio")}
        >
          <Image
            source={require("@/assets/images/relatory-icon.png")}
            style={styles.icon}
            resizeMode="contain"
          />
          <Text style={styles.iconText}>Manutenção</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconContainer}
        onPress={() => router.push("/history")}>
          <Image
            source={require("@/assets/images/gas-icon.png")}
            style={styles.icon}
            resizeMode="contain"
          />
          <Text style={styles.iconText}>Relatório</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.adContainer}>
        {/* Gráfico de barras no lugar da imagem */}
        <BarChart
          data={chartData}
          width={width * 0.78}
          height={width * 0.6}
          yAxisLabel="R$ "
          yAxisSuffix=""
          chartConfig={{
            backgroundColor: "#fff",
            backgroundGradientFrom: "#f6f6f6",
            backgroundGradientTo: "#f6f6f6",
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(106, 0, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0,0,0, ${opacity})`,
            style: {
              borderRadius: 12,
            },
            propsForDots: { r: "6" },
          }}
          style={{ borderRadius: 12 }}
          fromZero
          showBarTops
          withInnerLines={false}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  container: { marginTop: 10, marginLeft: 10, fontWeight: "400", fontSize: 18 },
  date: { color: "#8E8E8E", fontWeight: "400", marginLeft: 10, fontSize: 14 },
  infotable: {
    backgroundColor: "#e5e5e5",
    marginHorizontal: 20,
    marginVertical: 15,
    padding: 20,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  infoBox: {
    width: "48%",
    marginVertical: 5,
  },
  iconRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    flexWrap: "wrap",
    marginHorizontal: 10,
    marginTop: 10,
  },
  iconContainer: {
    alignItems: "center",
    marginVertical: 10,
    width: width / 4 - 10,
  },
  icon: { width: "100%", height: undefined, aspectRatio: 1 },
  iconText: { fontSize: 14, color: "#000", textAlign: "center" },
  adContainer: { alignItems: "center", marginTop: 30 },
  ad: { width: width * 0.7, height: width * 0.7 },
});
