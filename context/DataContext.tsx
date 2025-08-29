import React, { createContext, useState, useContext } from "react";

type DataType = {
  lastFuel: {
    date: string;
    liters: string;
    km: string;
  } | null;
  lastOil: {
    date: string;
    km: string;
  } | null;
  setLastFuel: (data: { date: string; liters: string; km: string }) => void;
  setLastOil: (data: { date: string; km: string }) => void;
};

const DataContext = createContext<DataType | undefined>(undefined);

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const [lastFuel, setLastFuelData] = useState<DataType["lastFuel"]>(null);
  const [lastOil, setLastOilData] = useState<DataType["lastOil"]>(null);

  const setLastFuel = (data: { date: string; liters: string; km: string }) => {
    setLastFuelData(data);
  };

  const setLastOil = (data: { date: string; km: string }) => {
    setLastOilData(data);
  };

  return (
    <DataContext.Provider value={{ lastFuel, lastOil, setLastFuel, setLastOil }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error("useData must be used inside DataProvider");
  return context;
};
