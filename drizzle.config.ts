import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./database/platform-migrations",
  // Authentication is managed by the existing hand-reviewed migration 002.
  // New product-domain migrations are generated from the normalized platform schema.
  schema: "./db/learning-schema.ts",
  dialect: "mysql",
  dbCredentials: {
    host: process.env.DB_HOST ?? "localhost",
    port: Number(process.env.DB_PORT ?? "3306"),
    user: process.env.DB_USER ?? "",
    password: process.env.DB_PASSWORD ?? "",
    database: process.env.DB_NAME ?? "",
  },
});
