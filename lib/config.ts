import Constants from "expo-constants";

/**
 * Base URL for the Gasóleo API (no trailing slash).
 * Set `expo.extra.apiUrl` in app.json or `EXPO_PUBLIC_API_URL` in `.env`.
 */
export function getApiBaseUrl(): string {
  const fromEnv =
    typeof process.env.EXPO_PUBLIC_API_URL === "string"
      ? process.env.EXPO_PUBLIC_API_URL
      : undefined;
  const fromExtra = Constants.expoConfig?.extra?.apiUrl as string | undefined;
  return (fromEnv || fromExtra || "http://localhost:3001").replace(/\/$/, "");
}
