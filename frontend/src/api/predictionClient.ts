import type { HouseFeatures, PredictionResponse } from "../types/prediction";

const BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

export async function getLocations(): Promise<string[]> {
  const res = await fetch(`${BASE_URL}/locations`);
  if (!res.ok) {
    throw new Error("فشل تحميل قائمة المواقع، تأكد إن السيرفر شغال على 8000");
  }
  const data = await res.json();
  return data.locations;
}

export async function predictPrice(
  features: HouseFeatures
): Promise<PredictionResponse> {
  const res = await fetch(`${BASE_URL}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(features),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`فشل حساب السعر: ${errorBody}`);
  }

  return res.json();
}
