import { z } from "zod"

const envSchema = z.object({
  appEnv: z
    .enum(["development", "staging", "production", "test"])
    .default("development"),
})

export const config = envSchema.parse({
  appEnv: process.env.APP_ENV,
})
