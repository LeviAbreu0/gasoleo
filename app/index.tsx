import { StyleSheet, Text, View, Image, TouchableOpacity, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useData } from "@/context/DataContext";

const { width } = Dimensions.get("window"); // largura da tela

export default function Index() {
  const router = useRouter();
  const { lastFuel, lastOil } = useData();

  return (
    <SafeAreaView style={styles.safe}>
      <View>
        <Text style={styles.container}>Hoje</Text>
        <Text style={styles.date}>27/08/2025</Text>
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
          <Text>
            {lastOil
              ? `${lastOil.date} • ${lastOil.km} km`
              : "-"}
          </Text>
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

        <TouchableOpacity style={styles.iconContainer}>
          <Image
            source={require("@/assets/images/relatory-icon.png")}
            style={styles.icon}
            resizeMode="contain"
          />
          <Text style={styles.iconText}>Manutenção</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconContainer}>
          <Image
            source={require("@/assets/images/gas-icon.png")}
            style={styles.icon}
            resizeMode="contain"
          />
          <Text style={styles.iconText}>Relatório</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.adContainer}>
        <Image
          source={require('@/assets/images/anuncio.avif')}
          style={styles.ad}
          resizeMode="contain"
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
    width: width / 4 - 10, // cada ícone ocupa 1/4 da tela menos uma margem
  },
  icon: { width: "100%", height: undefined, aspectRatio: 1 },
  iconText: { fontSize: 14, color: "#000", textAlign: "center" },
  adContainer: { alignItems: "center", marginTop: 30 },
  ad: { width: width * 0.7, height: width * 0.7 }, // anúncio proporcional à tela
});
