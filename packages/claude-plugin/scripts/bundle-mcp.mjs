import { rmSync, mkdirSync, cpSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const here = dirname(fileURLToPath(import.meta.url));
const pluginRoot = resolve(here, "..");
const repoRoot = resolve(pluginRoot, "..", "..");
const mcpRoot = resolve(pluginRoot, "..", "mcp");
const outDir = resolve(pluginRoot, "mcp");

const run = (cmd, args, cwd) =>
  execFileSync(cmd, args, { stdio: "inherit", cwd, shell: process.platform === "win32" });

run("pnpm", ["--filter", "@acm/mcp", "build"], repoRoot);

const dist = resolve(mcpRoot, "dist");
if (!existsSync(dist)) throw new Error("@acm/mcp dist not found; build failed");

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
cpSync(dist, outDir, { recursive: true });

const srcPkg = JSON.parse(readFileSync(resolve(mcpRoot, "package.json"), "utf8"));
const standalone = {
  name: "acm-tracker-mcp-bundled",
  version: srcPkg.version,
  private: true,
  type: "module",
  dependencies: srcPkg.dependencies,
};
writeFileSync(resolve(outDir, "package.json"), JSON.stringify(standalone, null, 2));

run("npm", ["install", "--omit=dev", "--no-audit", "--no-fund"], outDir);
console.log("Bundled MCP into", outDir);
