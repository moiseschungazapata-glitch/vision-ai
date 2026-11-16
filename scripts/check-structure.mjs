import { existsSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");

const requiredDirectories = [
  "apps/web",
  "apps/api/app",
  "apps/api/tests",
  "services/edge-agent/agent",
  "services/edge-agent/use_cases",
  "services/edge-agent/tests",
  "packages/contracts",
  "packages/contracts/schemas",
  "packages/contracts/openapi",
  "packages/contracts/asyncapi",
  "packages/contracts/typescript",
  "packages/contracts/python/vision_contracts",
  "packages/contracts/examples",
  "packages/contracts/docs",
  "infrastructure/supabase/migrations",
  "infrastructure/supabase/policies",
  "infrastructure/supabase/seed",
  "infrastructure/vercel",
  "infrastructure/docker",
  "tests/integration",
  "tests/end_to_end",
  "tests/performance",
  "documentation/architecture",
  "documentation/api",
  "documentation/operations",
  "documentation/acceptance",
];

const requiredFiles = [
  ".editorconfig",
  ".env.example",
  ".gitattributes",
  ".gitignore",
  ".nvmrc",
  ".python-version",
  "CONTRIBUTING.md",
  "README.md",
  "package.json",
  "package-lock.json",
  "pyproject.toml",
  "requirements-dev.txt",
  "apps/web/package.json",
  "apps/web/app/page.tsx",
  "apps/web/app/layout.tsx",
  "apps/api/app/main.py",
  "apps/api/Dockerfile",
  "services/edge-agent/Dockerfile",
  "packages/contracts/VERSION",
  "packages/contracts/schemas/vision-ai.schema.json",
  "packages/contracts/openapi/vision-ai.openapi.yaml",
  "packages/contracts/asyncapi/vision-ai.asyncapi.yaml",
  "packages/contracts/typescript/index.ts",
  "packages/contracts/python/vision_contracts/models.py",
  "scripts/check-contracts.mjs",
  ".github/workflows/ci.yml",
];

const failures = [];

for (const directory of requiredDirectories) {
  const target = resolve(root, directory);
  if (!existsSync(target) || !statSync(target).isDirectory()) {
    failures.push(`Falta el directorio: ${directory}`);
  }
}

for (const file of requiredFiles) {
  const target = resolve(root, file);
  if (!existsSync(target) || !statSync(target).isFile()) {
    failures.push(`Falta el archivo: ${file}`);
  }
}

const envExample = readFileSync(resolve(root, ".env.example"), "utf8");
const requiredEnvironmentKeys = [
  "NEXT_PUBLIC_API_URL",
  "NEXT_PUBLIC_WS_URL",
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "RESEND_API_KEY",
  "EDGE_DEVICE_ID",
  "CAMERA_SOURCE",
];

for (const key of requiredEnvironmentKeys) {
  if (!envExample.includes(`${key}=`)) failures.push(`Falta la variable de ejemplo: ${key}`);
}

if (failures.length > 0) {
  console.error("La estructura inicial no es válida:\n");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Estructura válida: ${requiredDirectories.length} directorios y ${requiredFiles.length} archivos requeridos.`);
