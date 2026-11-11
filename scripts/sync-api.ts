import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";

config({ path: ".env.local" });
import openapiTS, { astToString } from "openapi-typescript";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const OUTPUT_PATH = path.resolve(__dirname, "../types/chatterbox-api.d.ts");

async function main() {
  const apiUrl = process.env.CHATTERBOX_API_URL;

  if (!apiUrl) {
    console.log("ERROR: Chatterbox API URL environment required");
    process.exit(1);
  }

  const openApiURL = `${apiUrl}/openapi.json`;
  console.log(`Fetching OpenAPI spec from ${openApiURL}`);

  const ast = await openapiTS(new URL(openApiURL));

  const contents = astToString(ast);

  const outputDir = path.dirname(OUTPUT_PATH);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const header = `/**
  * This is an auto-generated file by /scripts/sync-api.ts
  * Do not edit manually. Run "npm run sync-api" to regenerate.
  * 
  * Generated from: ${openApiURL}
  * Generated at: ${new Date().toISOString()}
 */

`;

  fs.writeFileSync(OUTPUT_PATH, header + contents);
  console.log(`Types written to: ${OUTPUT_PATH}`);
}
main().catch((err) => {
  console.error("Failed to sync API types:", err);
  process.exit(1);
});
