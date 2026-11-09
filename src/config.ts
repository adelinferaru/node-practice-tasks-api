import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["production", "development", "test"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
});

export const config = envSchema.parse(process.env);
