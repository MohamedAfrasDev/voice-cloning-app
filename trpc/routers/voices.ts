import { prisma } from "@/lib/db/prisma";
import { createTRPCRouter, orgProcedure } from "../init";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { deleteAudio } from "@/lib/r2";
export const voiceRouter = createTRPCRouter({
  getAll: orgProcedure
    .input(z.object({ query: z.string().trim().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const searchFilter = input?.query
        ? {
            OR: [
              {
                name: { contains: input.query, mode: "insensitive" as const },
              },
              {
                description: {
                  contains: input.query,
                  mode: "insensitive" as const,
                },
              },
            ],
          }
        : {};

      const voiceSelect = {
        id: true,
        name: true,
        description: true,
        category: true,
        language: true,
        variant: true,
      } as const;

      const [custom, system] = await Promise.all([
        prisma.voice.findMany({
          where: {
            variant: "CUSTOM",
            orgId: ctx.orgId,
            ...searchFilter,
          },
          orderBy: { createdAt: "desc" },
          select: voiceSelect,
        }),
        prisma.voice.findMany({
          where: {
            variant: "SYSTEM",
            ...searchFilter,
          },
          orderBy: { name: "asc" },
          select: voiceSelect,
        }),
      ]);

      return { custom, system };
    }),

  delete: orgProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const voice = await prisma.voice.findFirst({
        where: { id: input.id, variant: "CUSTOM", orgId: ctx.orgId },
        select: { id: true, r2ObjectKey: true },
      });

      if (!voice) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Voice not found" });
      }

      await prisma.voice.delete({ where: { id: voice.id } });

      if (voice.r2ObjectKey) {
        // Best-effort cleanup: the DB row is already gone.
        await deleteAudio(voice.r2ObjectKey).catch((err) =>
          console.error("Failed to delete voice audio from R2:", err),
        );
      }

      return { success: true };
    }),
});
