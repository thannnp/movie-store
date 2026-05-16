import { types, Instance } from "mobx-state-tree"
import { AuthStore } from "./AuthStore"
import { MovieStore } from "./MovieStore"

export const RootStore = types.model("RootStore", {
  auth: types.optional(AuthStore, {}),
  movies: types.optional(MovieStore, {}),
})

export type RootStoreInstance = Instance<typeof RootStore>

let rootStore: RootStoreInstance | undefined

export function initializeStore(): RootStoreInstance {
  const _store = rootStore ?? RootStore.create()

  // For SSR, always create a new store
  if (typeof window === "undefined") return _store

  // Reuse store on client
  if (!rootStore) rootStore = _store

  return rootStore
}
