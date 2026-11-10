import { config } from "dotenv";
import { defineConfig } from "prisma/config";

config({ path: ".env.local" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx scripts/seed-system-voices.ts",
  },
  datasource: {
    // Migrations need a direct (non-pooled) connection.
    url: process.env["DATABASE_URL_UNPOOLED"],
  },
});
