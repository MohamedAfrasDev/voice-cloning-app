import React, { Suspense } from "react";
import HealthCheck from "./health-check";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";
const TestPage = () => {
  return (
    <HydrateClient>
      <div className="flex flex-col items-center justify-center gap-4">
        <Suspense fallback={<h3>Loading</h3>}>
          <HealthCheck />
        </Suspense>
      </div>
    </HydrateClient>
  );
};

export default TestPage;
