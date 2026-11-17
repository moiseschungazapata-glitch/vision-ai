import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const npmCli = process.env.npm_execpath;
const npmCommand = npmCli ? process.execPath : (process.platform === "win32" ? "npm.cmd" : "npm");
const npmArgs = (args) => npmCli ? [npmCli, ...args] : args;

const commands = [
  [process.execPath, [resolve(root, "scripts/check-structure.mjs")], "estructura"],
  [process.execPath, [resolve(root, "scripts/check-contracts.mjs")], "contratos y modelos"],
  [process.execPath, [resolve(root, "scripts/check-backend.mjs")], "backend REST y WebSocket"],
  [npmCommand, npmArgs(["--prefix", "apps/web", "run", "typecheck"]), "tipos del frontend"],
  [npmCommand, npmArgs(["--prefix", "apps/web", "run", "build"]), "compilación del frontend"],
];

for (const [command, args, label] of commands) {
  console.log(`\nComprobando ${label}...`);
  const result = spawnSync(command, args, { cwd: root, stdio: "inherit", shell: false });
  if (result.error) console.error(result.error.message);
  if (result.status !== 0) process.exit(result.status ?? 1);
}

console.log("\nTodas las comprobaciones finalizaron correctamente.");
