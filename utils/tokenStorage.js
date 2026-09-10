import AsyncStorage from "@react-native-async-storage/async-storage";

// Single source of truth for storage keys — axiosInstance.js (outside React,
// for the refresh interceptor) and useAuth.js (inside React, for
// login/register/logout) both read/write through here so they can never
// drift out of sync with each other.
export const ACCESS_TOKEN_KEY = "userToken";
export const REFRESH_TOKEN_KEY = "refreshToken";
export const USER_INFO_KEY = "userInfo";

/**
 * The backend doesn't always return the access token as a plain string —
 * login/register wrap it as `{ token, type, expiresIn }`, while
 * `/auth/refresh` returns it as a plain string. This unwraps either shape.
 */
export const extractTokenString = (token) => {
  if (typeof token === "string") return token;

  if (token && typeof token === "object") {
    if (typeof token.token === "string") return token.token;
    if (typeof token.accessToken === "string") return token.accessToken;
    if (typeof token.value === "string") return token.value;
  }

  return null;
};

export const getAccessToken = () => AsyncStorage.getItem(ACCESS_TOKEN_KEY);

export const getRefreshToken = () => AsyncStorage.getItem(REFRESH_TOKEN_KEY);

export const getStoredUserInfo = async () => {
  const raw = await AsyncStorage.getItem(USER_INFO_KEY);
  return raw ? JSON.parse(raw) : null;
};

/**
 * Persists a session. `refreshToken` and `userInfo` are optional so this
 * can also be used for an access-token-only refresh (where we don't want
 * to touch the stored user info, and the backend may or may not rotate
 * the refresh token).
 */
export const setSession = async (accessToken, refreshToken, userInfo) => {
  const tokenString = extractTokenString(accessToken);
  if (!tokenString) {
    throw new Error("Invalid access token received from server");
  }

  const entries = [[ACCESS_TOKEN_KEY, tokenString]];
  if (refreshToken) entries.push([REFRESH_TOKEN_KEY, refreshToken]);
  if (userInfo !== undefined) {
    entries.push([USER_INFO_KEY, JSON.stringify(userInfo)]);
  }

  await AsyncStorage.multiSet(entries);
  return tokenString;
};

export const clearSession = async () => {
  await AsyncStorage.multiRemove([
    ACCESS_TOKEN_KEY,
    REFRESH_TOKEN_KEY,
    USER_INFO_KEY,
  ]);
};
