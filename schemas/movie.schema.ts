import { z } from "zod"
import { Rating } from "@/app/generated/prisma"

const ratingValues = Object.values(Rating) as [Rating, ...Rating[]]

export const movieSchema = z.object({
  title: z.string().min(1, "Title is required"),
  yearReleased: z
    .number({ error: "Year Released must be a number" })
    .int({ error: "Year Released must be an integer" })
    .min(1888, { error: "Year Released must be 1888 or later" })
    .max(new Date().getFullYear() + 5, { error: "Year Released is too far in the future" }),
  rating: z.enum(ratingValues, {
    error: "rating must be one of: G, PG, M, MA, R",
  }),
})

export type MovieInput = z.infer<typeof movieSchema>
