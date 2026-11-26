-- CreateTable
CREATE TABLE "PendingUsageEvent" (
    "generationId" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "characters" INTEGER NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PendingUsageEvent_pkey" PRIMARY KEY ("generationId")
);
