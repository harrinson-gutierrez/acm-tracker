import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const requireFrom = createRequire(import.meta.url);
const desktopRoot = join(here, "..");
const repoRoot = join(desktopRoot, "..", "..");
const apiRoot = join(repoRoot, "apps", "api");
const webDist = join(repoRoot, "apps", "web", "dist");

const payload = join(desktopRoot, "src-tauri", "payload");
const payloadApi = join(payload, "api");
const payloadWeb = join(payload, "web-dist");
const payloadSidecar = join(payload, "sidecar");

function assertBuilt(path, hint) {
  if (!existsSync(path)) {
    throw new Error(`Missing ${path}. Run: ${hint}`);
  }
}

assertBuilt(join(apiRoot, "dist", "src", "main.js"), "pnpm --filter @acm/api build");
assertBuilt(webDist, "pnpm --filter @acm/web build");
assertBuilt(join(apiRoot, "prisma", "sqlite", ".generated", "index.js"), "pnpm --filter @acm/api prisma:generate:sqlite");

rmSync(payload, { recursive: true, force: true });
mkdirSync(payloadApi, { recursive: true });
mkdirSync(payloadSidecar, { recursive: true });

const isWin = process.platform === "win32";
const quoted = isWin ? `"${payloadApi}"` : payloadApi;
execFileSync("pnpm", ["--filter", "@acm/api", "deploy", quoted], {
  cwd: repoRoot,
  stdio: "inherit",
  shell: isWin,
});

regeneratePrismaClientsInPayload();

cpSync(webDist, payloadWeb, { recursive: true });
cpSync(join(desktopRoot, "sidecar"), payloadSidecar, { recursive: true });

console.log(`Payload assembled at ${payload}`);

function regeneratePrismaClientsInPayload() {
  const prismaBin = requireFrom.resolve("prisma/package.json", { paths: [payloadApi] });
  const prismaCli = join(dirname(prismaBin), JSON.parse(readFileSync(prismaBin, "utf8")).bin.prisma);
  for (const schema of ["prisma/schema.prisma", "prisma/sqlite/schema.prisma"]) {
    execFileSync(process.execPath, [prismaCli, "generate", "--schema", schema], {
      cwd: payloadApi,
      stdio: "inherit",
      env: { ...process.env, PRISMA_HIDE_UPDATE_MESSAGE: "1" },
    });
  }
}
