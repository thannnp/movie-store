import { types, flow } from "mobx-state-tree"

export const AuthStore = types
  .model("AuthStore", {
    email: types.maybeNull(types.string),
    role: types.maybeNull(types.string),
    permissions: types.optional(types.array(types.string), []),
    isAuthenticated: types.optional(types.boolean, false),
    isLoading: types.optional(types.boolean, false),
    error: types.maybeNull(types.string),
  })
  .views((self) => ({
    can(action: string) {
      return self.permissions.includes(action)
    },
  }))
  .actions((self) => ({
    login: flow(function* (email: string, password: string) {
      self.isLoading = true
      self.error = null
      try {
        const res: Response = yield fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        })
        const data: Record<string, unknown> = yield res.json()

        if (!res.ok) {
          self.error = (data.error as string) ?? "Login failed"
          return false
        }

        const user = data.user as { email: string; role: string }
        const permissions = data.permissions as string[]
        self.email = user.email
        self.role = user.role
        self.permissions.replace(permissions)
        self.isAuthenticated = true
        return true
      } catch {
        self.error = "Network error"
        return false
      } finally {
        self.isLoading = false
      }
    }),

    logout: flow(function* () {
      try {
        yield fetch("/api/auth/logout", { method: "POST" })
      } catch {
        // ignore
      }
      self.email = null
      self.role = null
      self.permissions.clear()
      self.isAuthenticated = false
      self.error = null
    }),

    checkAuth: flow(function* () {
      try {
        const res: Response = yield fetch("/api/auth/me")
        if (!res.ok) {
          self.isAuthenticated = false
          return
        }
        const data: Record<string, unknown> = yield res.json()
        const user = data.user as { email: string; role: string }
        const permissions = data.permissions as string[]
        self.email = user.email
        self.role = user.role
        self.permissions.replace(permissions)
        self.isAuthenticated = true
      } catch {
        self.isAuthenticated = false
      }
    }),

    clearError() {
      self.error = null
    },
  }))
