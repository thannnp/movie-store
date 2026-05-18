"use client"

import { useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { observer } from "mobx-react-lite"
import { Rating } from "@/app/generated/prisma/enums"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { movieSchema, type MovieInput } from "@/schemas/movie.schema"
import { useMovieStore } from "@/providers/StoreProvider"

type Movie = {
  id: string
  title: string
  yearReleased: number
  rating: string
}

interface MovieDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  movie: Movie | null
}

export const MovieDialog = observer(function MovieDialog({
  open,
  onOpenChange,
  movie,
}: MovieDialogProps) {
  const movieStore = useMovieStore()
  const isEdit = !!movie

  const form = useForm<MovieInput>({
    resolver: zodResolver(movieSchema),
    defaultValues: { title: "", yearReleased: new Date().getFullYear(), rating: "G" as Rating },
  })

  useEffect(() => {
    if (movie) {
      form.reset({
        title: movie.title,
        yearReleased: movie.yearReleased,
        rating: movie.rating as Rating,
      })
    } else {
      form.reset({ title: "", yearReleased: new Date().getFullYear(), rating: "G" as Rating })
    }
  }, [movie, form])

  const onSubmit = async (data: MovieInput) => {
    let success: boolean | undefined
    if (isEdit) {
      success = await movieStore.updateMovie(movie.id, data)
    } else {
      success = await movieStore.addMovie(data)
    }
    if (success) {
      form.reset()
      onOpenChange(false)
      movieStore.fetchMovies()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Movie" : "Add Movie"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="title"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Title</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    placeholder="Movie title"
                    autoComplete="off"
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="yearReleased"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Year Released</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="number"
                    aria-invalid={fieldState.invalid}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="rating"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Rating</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
                      <SelectValue placeholder="Select rating" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(Rating).map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {isEdit ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
})
