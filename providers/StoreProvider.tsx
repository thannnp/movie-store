"use client"

import { createContext, useContext, useState, ReactNode } from "react"
import { RootStoreInstance, initializeStore } from "@/stores/RootStore"

const StoreContext = createContext<RootStoreInstance | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [store] = useState(() => initializeStore())

  return (
    <StoreContext value={store}>
      {children}
    </StoreContext>
  )
}

export function useStore() {
  const store = useContext(StoreContext)
  if (!store) {
    throw new Error("useStore must be used within a StoreProvider")
  }
  return store
}

export function useAuthStore() {
  return useStore().auth
}

export function useMovieStore() {
  return useStore().movies
}
