// DataContext.tsx
import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type FuelData = { date: string; liters: string; km: string; price: string };
export type OilData = {
  date: string;
  km: string;
  type?: string;
  price?: string;
  kmTroca?: number | string;
};

type DataType = {
  fuelHistory: FuelData[];
  oilHistory: OilData[];
  lastFuel: FuelData | null;
  lastOil: OilData | null;
  addFuel: (data: FuelData) => void;
  addOil: (data: OilData) => void;
};

const DataContext = createContext<DataType | undefined>(undefined);

const STORAGE_KEYS = {
  FUEL: "@fuelHistory",
  OIL: "@oilHistory",
};

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const [fuelHistory, setFuelHistory] = useState<FuelData[]>([]);
  const [oilHistory, setOilHistory] = useState<OilData[]>([]);
  const [lastFuel, setLastFuel] = useState<FuelData | null>(null);
  const [lastOil, setLastOil] = useState<OilData | null>(null);

  // carregar dados do AsyncStorage ao iniciar
  useEffect(() => {
    const loadData = async () => {
      try {
        const storedFuel = await AsyncStorage.getItem(STORAGE_KEYS.FUEL);
        const storedOil = await AsyncStorage.getItem(STORAGE_KEYS.OIL);

        if (storedFuel) {
          const parsedFuel: FuelData[] = JSON.parse(storedFuel);
          setFuelHistory(parsedFuel);
          if (parsedFuel.length > 0) setLastFuel(parsedFuel[0]);
        }

        if (storedOil) {
          const parsedOil: OilData[] = JSON.parse(storedOil);
          setOilHistory(parsedOil);
          if (parsedOil.length > 0) setLastOil(parsedOil[0]);
        }
      } catch (err) {
        console.error("Erro ao carregar dados do AsyncStorage:", err);
      }
    };
    loadData();
  }, []);

  const saveFuel = async (data: FuelData[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.FUEL, JSON.stringify(data));
    } catch (err) {
      console.error("Erro ao salvar combustível:", err);
    }
  };

  const saveOil = async (data: OilData[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.OIL, JSON.stringify(data));
    } catch (err) {
      console.error("Erro ao salvar óleo:", err);
    }
  };

  const addFuel = (data: FuelData) => {
    setFuelHistory((prev) => {
      const updated = [data, ...prev];
      saveFuel(updated);
      return updated;
    });
    setLastFuel(data);
  };

  const addOil = (data: OilData) => {
    setOilHistory((prev) => {
      const updated = [data, ...prev];
      saveOil(updated);
      return updated;
    });
    setLastOil(data);
  };

  return (
    <DataContext.Provider
      value={{ fuelHistory, oilHistory, lastFuel, lastOil, addFuel, addOil }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error("useData must be used inside DataProvider");
  return context;
};
