import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as api from "@/lib/api";
import { ApiError } from "@/lib/api";
import { brDateToIso, compareNewestFirst } from "@/lib/date";
import type { FuelData, OilData } from "@/types/entries";

export type { FuelData, OilData };

type DataType = {
  fuelHistory: FuelData[];
  oilHistory: OilData[];
  lastFuel: FuelData | null;
  lastOil: OilData | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  clearError: () => void;
  refresh: () => Promise<void>;
  addFuel: (data: Omit<FuelData, "id">) => Promise<void>;
  addOil: (data: Omit<OilData, "id">) => Promise<void>;
  updateFuel: (id: string, data: Omit<FuelData, "id">) => Promise<void>;
  updateOil: (id: string, data: Omit<OilData, "id">) => Promise<void>;
  deleteFuel: (id: string) => Promise<void>;
  deleteOil: (id: string) => Promise<void>;
};

const DataContext = createContext<DataType | undefined>(undefined);

const MIGRATION_KEY = "@gasoleo_api_migration_v1";
const LEGACY_KEYS = { FUEL: "@fuelHistory", OIL: "@oilHistory" };

function pickLatest<T extends { date: string; id?: string }>(list: T[]): T | null {
  if (!list.length) return null;
  return [...list].sort(compareNewestFirst)[0] ?? null;
}

/** One-time upload of legacy AsyncStorage rows to the API, then clears legacy keys. */
async function migrateLegacyStorageIfNeeded(): Promise<void> {
  const done = await AsyncStorage.getItem(MIGRATION_KEY);
  if (done === "1") return;

  const rawFuel = await AsyncStorage.getItem(LEGACY_KEYS.FUEL);
  const rawOil = await AsyncStorage.getItem(LEGACY_KEYS.OIL);
  if (!rawFuel && !rawOil) {
    await AsyncStorage.setItem(MIGRATION_KEY, "1");
    return;
  }

  if (rawFuel) {
    const arr = JSON.parse(rawFuel) as Omit<FuelData, "id">[];
    for (const row of arr) {
      await api.createFuel({
        dateIso: brDateToIso(row.date),
        liters: row.liters,
        km: row.km,
        price: row.price,
      });
    }
  }
  if (rawOil) {
    const arr = JSON.parse(rawOil) as Omit<OilData, "id">[];
    for (const row of arr) {
      if (!row.type) continue;
      await api.createOil({
        dateIso: brDateToIso(row.date),
        km: row.km,
        type: row.type,
        price: row.price,
        kmTroca: row.kmTroca,
      });
    }
  }

  await AsyncStorage.removeItem(LEGACY_KEYS.FUEL);
  await AsyncStorage.removeItem(LEGACY_KEYS.OIL);
  await AsyncStorage.setItem(MIGRATION_KEY, "1");
}

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const [fuelHistory, setFuelHistory] = useState<FuelData[]>([]);
  const [oilHistory, setOilHistory] = useState<OilData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (isRefresh: boolean) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      const [fuel, oil] = await Promise.all([api.fetchFuelList(), api.fetchOilList()]);
      setFuelHistory(fuel);
      setOilHistory(oil);
    } catch (e) {
      const msg =
        e instanceof ApiError
          ? e.message
          : e instanceof Error
            ? e.message
            : String(e);
      setError(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await migrateLegacyStorageIfNeeded();
      } catch (e) {
        console.warn("Gasóleo: migração do armazenamento local falhou:", e);
      }
      if (!cancelled) await load(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [load]);

  const refresh = useCallback(() => load(true), [load]);

  const clearError = useCallback(() => setError(null), []);

  const lastFuel = useMemo(() => pickLatest(fuelHistory), [fuelHistory]);
  const lastOil = useMemo(() => pickLatest(oilHistory), [oilHistory]);

  const addFuel = useCallback(
    async (data: Omit<FuelData, "id">) => {
      await api.createFuel({
        dateIso: brDateToIso(data.date),
        liters: data.liters,
        km: data.km,
        price: data.price,
      });
      await refresh();
    },
    [refresh]
  );

  const addOil = useCallback(
    async (data: Omit<OilData, "id">) => {
      if (!data.type) throw new Error("Tipo de óleo é obrigatório");
      await api.createOil({
        dateIso: brDateToIso(data.date),
        km: data.km,
        type: data.type,
        price: data.price,
        kmTroca: data.kmTroca,
      });
      await refresh();
    },
    [refresh]
  );

  const updateFuel = useCallback(
    async (id: string, data: Omit<FuelData, "id">) => {
      await api.updateFuel(id, {
        dateIso: brDateToIso(data.date),
        liters: data.liters,
        km: data.km,
        price: data.price,
      });
      await refresh();
    },
    [refresh]
  );

  const updateOil = useCallback(
    async (id: string, data: Omit<OilData, "id">) => {
      if (!data.type) throw new Error("Tipo de óleo é obrigatório");
      await api.updateOil(id, {
        dateIso: brDateToIso(data.date),
        km: data.km,
        type: data.type,
        price: data.price,
        kmTroca: data.kmTroca,
      });
      await refresh();
    },
    [refresh]
  );

  const deleteFuel = useCallback(
    async (id: string) => {
      await api.deleteFuel(id);
      await refresh();
    },
    [refresh]
  );

  const deleteOil = useCallback(
    async (id: string) => {
      await api.deleteOil(id);
      await refresh();
    },
    [refresh]
  );

  return (
    <DataContext.Provider
      value={{
        fuelHistory,
        oilHistory,
        lastFuel,
        lastOil,
        loading,
        refreshing,
        error,
        clearError,
        refresh,
        addFuel,
        addOil,
        updateFuel,
        updateOil,
        deleteFuel,
        deleteOil,
      }}
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
