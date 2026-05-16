"use client"

import { observer } from "mobx-react-lite"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { useMovieStore } from "@/providers/StoreProvider"

type Movie = {
  id: string
  title: string
}

interface DeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  movie: Movie | null
}

export const DeleteDialog = observer(function DeleteDialog({
  open,
  onOpenChange,
  movie,
}: DeleteDialogProps) {
  const movieStore = useMovieStore()

  const handleDelete = async () => {
    if (!movie) return
    const success = await movieStore.deleteMovie(movie.id)
    if (success) {
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Movie</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &quot;{movie?.title}&quot;? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
})
