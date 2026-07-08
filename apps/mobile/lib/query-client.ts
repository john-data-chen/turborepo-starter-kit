import { focusManager, QueryClient } from "@tanstack/react-query";
import { AppState } from "react-native";

focusManager.setEventListener((handleFocus) => {
  const subscription = AppState.addEventListener("change", (state) => {
    if (state === "active") {
      handleFocus();
    }
  });
  return () =>{  subscription.remove(); };
});

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 2,
      refetchOnWindowFocus: true
    }
  }
});
