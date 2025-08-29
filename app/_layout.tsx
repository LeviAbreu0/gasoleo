import { Stack } from "expo-router";
import { DataProvider } from "@/context/DataContext";

export default function Rootlayout() {
  return (
    <DataProvider>
      <Stack
        screenOptions={{
          headerTitle: "Gasóleo",
          headerStyle: { backgroundColor: "#F2FF00" },
          headerTintColor: "#000",
          headerTitleStyle: { fontWeight: "400", fontSize: 20 },
        }}
      />
    </DataProvider>
  );
}
