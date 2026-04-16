#!/usr/bin/env node
/**
 * SchoolSafe BD — GitHub Auto-sync
 *
 * Uses the Replit GitHub connector to verify authentication and resolve
 * the target repository, then pushes to the 'origin' remote via the
 * SSH deploy key (connector OAuth tokens cannot be extracted for raw
 * git-over-HTTPS; the deploy key is the approved auth method for pushes).
 *
 * Called by .git/hooks/post-commit after every commit.
 * Also safe to run manually: node scripts/github-sync.mjs
 */

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { ReplitConnectors } from "@replit/connectors-sdk";

const execAsync = promisify(execFile);

const LOG_PREFIX = `[github-sync ${new Date().toISOString()}]`;

function log(msg) {
  process.stdout.write(`${LOG_PREFIX} ${msg}\n`);
}

function logError(msg) {
  process.stderr.write(`${LOG_PREFIX} ERROR: ${msg}\n`);
}

async function getGitHubUser(connectors) {
  try {
    const res = await connectors.proxy("github", "/user", { method: "GET" });
    if (res.ok) {
      const data = await res.json();
      return data.login ?? null;
    }
    logError(`GitHub connector /user returned ${res.status}`);
    return null;
  } catch (err) {
    logError(`GitHub connector request failed: ${err.message}`);
    return null;
  }
}

async function getOriginUrl() {
  try {
    const { stdout } = await execAsync("git", ["remote", "get-url", "origin"]);
    return stdout.trim();
  } catch {
    return null;
  }
}

async function gitPushOrigin() {
  return new Promise((resolve) => {
    const child = execFile(
      "git",
      ["push", "origin", "main"],
      {
        env: {
          ...process.env,
          HOME: "/home/runner",
          GIT_SSH_COMMAND:
            "ssh -i /home/runner/.ssh/id_ed25519 -o BatchMode=yes",
        },
        cwd: "/home/runner/workspace",
      },
      (error, stdout, stderr) => {
        resolve({ error, stdout: stdout.trim(), stderr: stderr.trim() });
      }
    );
    child.stdout?.pipe(process.stdout);
    child.stderr?.pipe(process.stderr);
  });
}

async function main() {
  log("Starting sync…");

  const connectors = new ReplitConnectors();

  const ghUser = await getGitHubUser(connectors);
  if (ghUser) {
    log(`GitHub connector healthy — authenticated as: ${ghUser}`);
  } else {
    log("GitHub connector check skipped (may be offline) — proceeding with push");
  }

  const originUrl = await getOriginUrl();
  if (originUrl) {
    log(`Pushing to origin: ${originUrl}`);
  } else {
    logError("No 'origin' remote configured. Run scripts/github-sync-setup.sh first.");
    process.exit(1);
  }

  const { error, stderr } = await gitPushOrigin();

  if (error) {
    logError(`Push failed (exit ${error.code}): ${stderr}`);
    process.exit(error.code ?? 1);
  }

  const detail = stderr || "already up-to-date";
  log(`Push succeeded: ${detail}`);
}

main().catch((err) => {
  process.stderr.write(`${LOG_PREFIX} FATAL: ${err.message}\n`);
  process.exit(1);
});
