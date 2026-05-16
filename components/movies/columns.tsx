"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export type Movie = {
  id: string
  title: string
  yearReleased: number
  rating: string
  createdBy: string
  createdAt: string
  updatedAt: string
  user: { email: string } | null
}

interface ColumnOptions {
  canEdit: boolean
  canDelete: boolean
  onEdit: (movie: Movie) => void
  onDelete: (movie: Movie) => void
}

export function getColumns({ canEdit, canDelete, onEdit, onDelete }: ColumnOptions): ColumnDef<Movie>[] {
  return [
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue("title")}</span>
      ),
    },
    {
      accessorKey: "yearReleased",
      header: "Year",
      cell: ({ row }) => (
        <span className="tabular-nums">{row.getValue("yearReleased")}</span>
      ),
    },
    {
      accessorKey: "rating",
      header: "Rating",
      cell: ({ row }) => (
        <span className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs font-medium">
          {row.getValue("rating")}
        </span>
      ),
    },
    {
      accessorKey: "user",
      header: "Created By",
      cell: ({ row }) => {
        const user = row.getValue("user") as { email: string } | null
        return (
          <span className="text-muted-foreground">{user?.email ?? "-"}</span>
        )
      },
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => {
        const movie = row.original
        return (
          <div className="flex items-center justify-end gap-1">
            {canEdit && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onEdit(movie)}
              >
                <Pencil className="size-4" />
                <span className="sr-only">Edit</span>
              </Button>
            )}
            {canDelete && (
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-destructive hover:text-destructive"
                onClick={() => onDelete(movie)}
              >
                <Trash2 className="size-4" />
                <span className="sr-only">Delete</span>
              </Button>
            )}
          </div>
        )
      },
    },
  ]
}
