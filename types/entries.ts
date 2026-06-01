export type FuelData = {
  id: string;
  date: string;
  liters: string;
  km: string;
  price: string;
};

export type OilData = {
  id: string;
  date: string;
  km: string;
  type?: string;
  price?: string;
  kmTroca?: number | string;
};
