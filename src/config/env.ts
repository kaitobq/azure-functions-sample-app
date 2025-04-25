import { z } from "zod"

const envSchema = z.object({
  APP_ENV: z
    .enum(["development", "staging", "production", "test"])
    .default("development"),
})

export const config = envSchema.parse({
  APP_ENV: process.env.APP_ENV,
})
