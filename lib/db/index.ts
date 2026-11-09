import { neon } from "@neondatabase/serverless";

// Pooled connection over HTTP: suited to serverless/edge request handlers.
export const sql = neon(process.env.DATABASE_URL!);
