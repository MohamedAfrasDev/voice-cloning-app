import { sql } from "@/lib/db";

export async function GET() {
  const rows = await sql`select now() as now, current_database() as db`;
  return Response.json({ ok: true, ...rows[0] });
}
