import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const commands = [
  ["ruff", ["check", "apps/api", "packages/contracts/python"], "estilo Python"],
  ["mypy", ["apps/api/app", "packages/contracts/python/vision_contracts"], "tipos Python"],
  ["pytest", ["apps/api/tests", "-q"], "pruebas de la API"],
];

for (const [tool, args, label] of commands) {
  console.log(`\nComprobando ${label}...`);
  const result = spawnSync(
    "uv",
    ["run", "--project", "apps/api", "--extra", "dev", "--python", "3.12", tool, ...args],
    { cwd: root, stdio: "inherit", shell: false },
  );
  if (result.error) console.error(result.error.message);
  if (result.status !== 0) process.exit(result.status ?? 1);
}

console.log("\nBackend válido: estilo, tipos y pruebas completados.");
