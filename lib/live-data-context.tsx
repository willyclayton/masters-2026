"use client";

import { createContext, useContext } from "react";
import type { LiveData } from "./types";
import { useLiveData } from "./use-live-data";

type LiveDataContextValue = LiveData & { forceRefresh: () => void };

const LiveDataContext = createContext<LiveDataContextValue | null>(null);

export function LiveDataProvider({ children }: { children: React.ReactNode }) {
  const liveData = useLiveData();
  return (
    <LiveDataContext.Provider value={liveData}>
      {children}
    </LiveDataContext.Provider>
  );
}

export function useLiveDataContext(): LiveDataContextValue {
  const ctx = useContext(LiveDataContext);
  if (!ctx) {
    // Fallback for components rendered outside the provider
    return {
      leaderboard: null,
      odds: null,
      isLive: false,
      lastFetch: null,
      error: null,
      forceRefresh: () => {},
    };
  }
  return ctx;
}
