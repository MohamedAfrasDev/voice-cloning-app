"use client";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import React from "react";

const HealthCheck = () => {
  const trpc = useTRPC();
  // const { data } = useSuspenseQuery(trpc.voices.queryOptions());
  return <div>aa</div>;
};

export default HealthCheck;
