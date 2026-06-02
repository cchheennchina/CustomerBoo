import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "butler_token";
const API_URL_KEY = "butler_api_url";
const DEFAULT_API_URL = "http://127.0.0.1:3000";

export async function getToken() {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function setToken(token: string) {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearToken() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export async function getApiBaseUrl() {
  return (await SecureStore.getItemAsync(API_URL_KEY)) || DEFAULT_API_URL;
}

export async function setApiBaseUrl(url: string) {
  await SecureStore.setItemAsync(API_URL_KEY, url.replace(/\/$/, ""));
}

export async function isLoggedIn() {
  return Boolean(await getToken());
}
