import { headers } from "next/headers";
import { auth } from "@/lib/auth/server";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const [row] = await prisma.$queryRaw<
    { now: Date; db: string }[]
  >`select now() as now, current_database() as db`;
  const users = await prisma.user.count();
  return Response.json({ ok: true, ...row, users });
}
