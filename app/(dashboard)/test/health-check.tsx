"use client";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import React from "react";

const HealthCheck = () => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.health.queryOptions());
  return <div>{data.status}</div>;
};

export default HealthCheck;
