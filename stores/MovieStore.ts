import { types, flow } from "mobx-state-tree"

const MovieModel = types.model("Movie", {
  id: types.identifier,
  title: types.string,
  yearReleased: types.number,
  rating: types.string,
  createdBy: types.string,
  createdAt: types.string,
  updatedAt: types.string,
  user: types.maybeNull(
    types.model("MovieUser", {
      email: types.string,
    })
  ),
})

export const MovieStore = types
  .model("MovieStore", {
    movies: types.array(MovieModel),
    isLoading: types.optional(types.boolean, true),
    error: types.maybeNull(types.string),
  })
  .actions((self) => ({
    fetchMovies: flow(function* () {
      self.isLoading = true
      self.error = null
      try {
        const res: Response = yield fetch("/api/movies")
        if (!res.ok) {
          const data: Record<string, unknown> = yield res.json()
          self.error = (data.error as string) ?? "Failed to fetch movies"
          return
        }
        const data: Array<Record<string, unknown>> = yield res.json()
        self.movies.replace(data as never)
      } catch {
        self.error = "Network error"
      } finally {
        self.isLoading = false
      }
    }),

    addMovie: flow(function* (input: { title: string; yearReleased: number; rating: string }) {
      self.error = null
      try {
        const res: Response = yield fetch("/api/movies", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        })
        const data: Record<string, unknown> = yield res.json()

        if (!res.ok) {
          self.error = (data.error as string) ?? "Failed to create movie"
          return false
        }

        self.movies.unshift(data as never)
        return true
      } catch {
        self.error = "Network error"
        return false
      }
    }),

    updateMovie: flow(function* (
      id: string,
      input: { title: string; yearReleased: number; rating: string }
    ) {
      self.error = null
      try {
        const res: Response = yield fetch(`/api/movies/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        })
        const data: Record<string, unknown> = yield res.json()

        if (!res.ok) {
          self.error = (data.error as string) ?? "Failed to update movie"
          return false
        }

        const index = self.movies.findIndex((m) => m.id === id)
        if (index !== -1) {
          self.movies[index] = data as never
        }
        return true
      } catch {
        self.error = "Network error"
        return false
      }
    }),

    deleteMovie: flow(function* (id: string) {
      self.error = null
      try {
        const res: Response = yield fetch(`/api/movies/${id}`, {
          method: "DELETE",
        })

        if (!res.ok) {
          const data: Record<string, unknown> = yield res.json()
          self.error = (data.error as string) ?? "Failed to delete movie"
          return false
        }

        const index = self.movies.findIndex((m) => m.id === id)
        if (index !== -1) {
          self.movies.splice(index, 1)
        }
        return true
      } catch {
        self.error = "Network error"
        return false
      }
    }),

    clearError() {
      self.error = null
    },
  }))
