"use client";

import { useEffect, useState, useMemo } from "react";
import { getSnapshot } from "mobx-state-tree";
import { observer } from "mobx-react-lite";
import { Plus } from "lucide-react";
import { useMovieStore, useAuthStore } from "@/providers/StoreProvider";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { getColumns, type Movie } from "@/components/movies/columns";
import { MovieDialog } from "@/components/movies/movie-dialog";
import { DeleteDialog } from "@/components/movies/delete-dialog";

function MoviesPage() {
  const movieStore = useMovieStore();
  const authStore = useAuthStore();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [deletingMovie, setDeletingMovie] = useState<Movie | null>(null);

  useEffect(() => {
    movieStore.fetchMovies();
  }, [movieStore]);

  const handleAdd = () => {
    setEditingMovie(null);
    setDialogOpen(true);
  };

  const handleEdit = (movie: Movie) => {
    // Store plain object to avoid MST dead node error
    setEditingMovie({ ...movie } as Movie);
    setDialogOpen(true);
  };

  const handleDelete = (movie: Movie) => {
    // Store plain object to avoid MST dead node error after splice
    setDeletingMovie({ id: movie.id, title: movie.title } as Movie);
    setDeleteOpen(true);
  };

  const canCreate = authStore.can("create");
  const canEdit = authStore.can("update");
  const canDelete = authStore.can("delete");

  const columns = useMemo(
    () => getColumns({ canEdit, canDelete, onEdit: handleEdit, onDelete: handleDelete }),
    [canEdit, canDelete],
  );

  // MST nodes must be converted to plain JS objects to prevent dead node errors after splice/replace
  const movies = getSnapshot(movieStore.movies) as unknown as Movie[];

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Movies</h1>
          <p className="text-sm text-muted-foreground">
            {movies.length} total movies
          </p>
        </div>
        {canCreate && (
          <Button onClick={handleAdd} className="w-full sm:w-auto">
            <Plus className="size-4 mr-2" />
            Add Movie
          </Button>
        )}
      </div>

      {movieStore.error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {movieStore.error}
        </div>
      )}

      <DataTable columns={columns} data={movies} pageSize={10} isLoading={movieStore.isLoading} />

      <MovieDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        movie={editingMovie}
      />

      <DeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        movie={deletingMovie}
      />
    </div>
  );
}

export default observer(MoviesPage);
