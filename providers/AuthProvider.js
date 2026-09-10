// AuthProvider.js
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Create the React Query client with optimized configuration
//
// Exported so axiosInstance.js (outside the React tree) can reset the
// `["auth"]` query directly when a token refresh fails — that's what
// actually drives `isAuthenticated` in Main.jsx, so updating it here is
// enough to bounce the user back to the login screen.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

// AuthProvider just wraps the app with QueryClientProvider
export const AuthProvider = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

// No need for AuthContext anymore since we're using custom hooks directly
