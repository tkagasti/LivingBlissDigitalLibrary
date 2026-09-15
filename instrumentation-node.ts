import { execFile } from "node:child_process";
import path from "node:path";

export function runCommentaryImport() {
  return new Promise<void>((resolve, reject) => {
    execFile(
      process.execPath,
      [path.join(process.cwd(), "scripts/import-gita-classical-commentaries.mjs")],
      { cwd: process.cwd(), timeout: 180_000 },
      (error, stdout, stderr) => {
        if (stdout.trim()) process.stdout.write(`[gita-commentaries] ${stdout.trim()}\n`);
        if (stderr.trim()) process.stderr.write(`[gita-commentaries] ${stderr.trim()}\n`);
        if (error) reject(error);
        else resolve();
      },
    );
  });
}
