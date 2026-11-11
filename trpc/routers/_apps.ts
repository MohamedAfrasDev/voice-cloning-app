import { z } from "zod";
import { baseProcedure, createTRPCRouter } from "../init";
import { voiceRouter } from "./voices";
import { generationsRouter } from "./generations";

export const appRouter = createTRPCRouter({
  voices: voiceRouter,
  generations: generationsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
