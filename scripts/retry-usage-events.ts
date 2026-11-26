import { config } from "dotenv";

config({ path: ".env.local" });

async function main() {
  // Imported after the env file is loaded, because these modules read it.
  const { retryPendingUsageEvents } = await import("@/lib/usage-events");
  const { prisma } = await import("@/lib/db/prisma");

  try {
    const { sent, failed, lastError } = await retryPendingUsageEvents();
    console.log(`Usage events sent: ${sent}, still pending: ${failed}`);

    if (failed > 0) {
      console.error("Last error:", lastError);
      process.exitCode = 1;
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
