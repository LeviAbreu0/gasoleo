import { getApiBaseUrl } from "@/lib/config";
import { isoDateToBr } from "@/lib/date";
import type { FuelData, OilData } from "@/types/entries";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function parseJsonSafe(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

async function request<T>(
  path: string,
  init?: RequestInit & { parse?: "json" | "none" }
): Promise<T> {
  const url = `${getApiBaseUrl()}${path}`;
  const parseMode = init?.parse ?? "json";
  const { parse: _omit, ...rest } = init ?? {};
  const res = await fetch(url, {
    ...rest,
    headers: {
      Accept: "application/json",
      ...(rest.body != null ? { "Content-Type": "application/json" } : {}),
      ...(rest.headers as Record<string, string>),
    },
  });
  if (res.status === 204) return undefined as T;
  const data = await parseJsonSafe(res);
  if (!res.ok) {
    const msg =
      typeof data === "object" && data !== null && "error" in data
        ? String((data as { error: string }).error)
        : `HTTP ${res.status}`;
    throw new ApiError(msg, res.status, data);
  }
  if (parseMode === "none") return undefined as T;
  return data as T;
}

function mapFuelFromApi(row: {
  id: string;
  date: string;
  liters: string;
  km: string;
  price: string;
}): FuelData {
  return {
    id: String(row.id),
    date: isoDateToBr(row.date),
    liters: String(row.liters),
    km: String(row.km),
    price: String(row.price),
  };
}

function mapOilFromApi(row: {
  id: string;
  date: string;
  km: string;
  type?: string;
  price?: string;
  kmTroca?: string;
}): OilData {
  return {
    id: String(row.id),
    date: isoDateToBr(row.date),
    km: String(row.km),
    type: row.type,
    price: row.price != null && row.price !== "" ? String(row.price) : "",
    kmTroca: row.kmTroca,
  };
}

export async function fetchFuelList(): Promise<FuelData[]> {
  const rows = await request<
    { id: string; date: string; liters: string; km: string; price: string }[]
  >("/api/fuel");
  return rows.map(mapFuelFromApi);
}

export async function fetchOilList(): Promise<OilData[]> {
  const rows = await request<
    {
      id: string;
      date: string;
      km: string;
      type?: string;
      price?: string;
      kmTroca?: string;
    }[]
  >("/api/oil");
  return rows.map(mapOilFromApi);
}

export async function createFuel(payload: {
  dateIso: string;
  liters: string;
  km: string;
  price: string;
}): Promise<FuelData> {
  const row = await request<{
    id: string;
    date: string;
    liters: string;
    km: string;
    price: string;
  }>("/api/fuel", {
    method: "POST",
    body: JSON.stringify({
      date: payload.dateIso,
      liters: payload.liters,
      km: payload.km,
      price: payload.price,
    }),
  });
  return mapFuelFromApi(row);
}

export async function updateFuel(
  id: string,
  payload: {
    dateIso: string;
    liters: string;
    km: string;
    price: string;
  }
): Promise<FuelData> {
  const row = await request<{
    id: string;
    date: string;
    liters: string;
    km: string;
    price: string;
  }>(`/api/fuel/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify({
      date: payload.dateIso,
      liters: payload.liters,
      km: payload.km,
      price: payload.price,
    }),
  });
  return mapFuelFromApi(row);
}

export async function deleteFuel(id: string): Promise<void> {
  await request(`/api/fuel/${encodeURIComponent(id)}`, {
    method: "DELETE",
    parse: "none",
  });
}

export async function createOil(payload: {
  dateIso: string;
  km: string;
  type: string;
  price?: string;
  kmTroca?: string | number;
}): Promise<OilData> {
  const row = await request<{
    id: string;
    date: string;
    km: string;
    type?: string;
    price?: string;
    kmTroca?: string;
  }>("/api/oil", {
    method: "POST",
    body: JSON.stringify({
      date: payload.dateIso,
      km: payload.km,
      type: payload.type,
      price: payload.price || "",
      kmTroca: payload.kmTroca,
    }),
  });
  return mapOilFromApi(row);
}

export async function updateOil(
  id: string,
  payload: {
    dateIso: string;
    km: string;
    type: string;
    price?: string;
    kmTroca?: string | number;
  }
): Promise<OilData> {
  const row = await request<{
    id: string;
    date: string;
    km: string;
    type?: string;
    price?: string;
    kmTroca?: string;
  }>(`/api/oil/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify({
      date: payload.dateIso,
      km: payload.km,
      type: payload.type,
      price: payload.price || "",
      kmTroca: payload.kmTroca,
    }),
  });
  return mapOilFromApi(row);
}

export async function deleteOil(id: string): Promise<void> {
  await request(`/api/oil/${encodeURIComponent(id)}`, {
    method: "DELETE",
    parse: "none",
  });
}
