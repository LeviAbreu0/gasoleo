// DataContext.tsx
import React, { createContext, useState, useContext } from "react";

export type FuelData = { date: string; liters: string; km: string; price: string };
// kmTroca aceitando number ou string para evitar erros de tipagem dependendo do componente
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

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const [fuelHistory, setFuelHistory] = useState<FuelData[]>([]);
  const [oilHistory, setOilHistory] = useState<OilData[]>([]);
  const [lastFuel, setLastFuel] = useState<FuelData | null>(null);
  const [lastOil, setLastOil] = useState<OilData | null>(null);

  const addFuel = (data: FuelData) => {
    setFuelHistory(prev => [data, ...prev]);
    setLastFuel(data);
  };

  const addOil = (data: OilData) => {
    setOilHistory(prev => [data, ...prev]);
    setLastOil(data);
  };

  return (
    <DataContext.Provider value={{ fuelHistory, oilHistory, lastFuel, lastOil, addFuel, addOil }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error("useData must be used inside DataProvider");
  return context;
};
