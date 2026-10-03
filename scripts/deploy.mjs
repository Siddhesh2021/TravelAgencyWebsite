/**
 * One-command deploy to the VPS.
 *
 *   npm run build && node scripts/deploy.mjs
 *
 * Builds the SPA, uploads dist/ plus the nginx vhost, swaps the web root, and
 * reloads nginx — testing the config first so a bad vhost can never take the
 * other sites on the box down with it.
 *
 * The remote is a static host: nginx serves the built bundle directly and no
 * Node process sits in the request path, so there is nothing to restart or
 * pm2-reload here.
 *
 * Configuration (all optional, defaults match the live setup):
 *   DEPLOY_HOST      default sagarkapasi.com
 *   DEPLOY_PORT      default 2203
 *   DEPLOY_USER      default siddhesh
 *   DEPLOY_KEY       path to the ssh private key. Required when the key is not
 *                    one of ssh's default identities, because the script always
 *                    passes IdentitiesOnly=yes.
 *   DEPLOY_HOSTNAME  default swatithetravelqueen.codemaxdev.com
 *   DEPLOY_WEBROOT   default /var/www/swatithetravelqueen
 *   DEPLOY_SUDO_PASS sudo password; read from the env so it stays out of shell
 *                    history. Prompted for if unset.
 *
 * Needs key-based ssh (no password prompt from ssh itself) and `tar`.
 */
import { execFileSync as run } from "node:child_process";
import { mkdtempSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { createInterface } from "node:readline";

const HOST = process.env.DEPLOY_HOST ?? "sagarkapasi.com";
const PORT = process.env.DEPLOY_PORT ?? "2203";
const USER = process.env.DEPLOY_USER ?? "siddhesh";
const KEY = process.env.DEPLOY_KEY;
const HOSTNAME = process.env.DEPLOY_HOSTNAME ?? "swatithetravelqueen.codemaxdev.com";
const WEBROOT = process.env.DEPLOY_WEBROOT ?? "/var/www/swatithetravelqueen";
const SITE = `sites-available/${HOSTNAME}`;

const root = resolve(import.meta.dirname, "..");
const vhostSrc = join(root, "scripts", "swatithetravelqueen.nginx.conf");

function sh(cmd, args, opts = {}) {
  process.stdout.write(`\n$ ${cmd} ${args.join(" ")}\n`);
  return run(cmd, args, { encoding: "utf8", stdio: ["pipe", "pipe", "inherit"], ...opts });
}

const identity = KEY ? ["-i", KEY] : [];

function sshArgs(remote) {
  return [...identity, "-o", "BatchMode=yes", "-o", "IdentitiesOnly=yes", "-p", PORT, `${USER}@${HOST}`, remote];
}

async function ask(question) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await new Promise((resolve_) => rl.question(question, resolve_));
  rl.close();
  return answer.trim();
}

const tmp = mkdtempSync(join(tmpdir(), "swati-deploy-"));
const distTar = join(tmp, "dist.tar.gz");

try {
  // Fail fast and loudly if key auth is not set up yet.
  sh("ssh", sshArgs("echo AUTH_OK"));

  console.log("\n==> building");
  sh("node", [join(root, "node_modules", "vite", "bin", "vite.js"), "build"], { cwd: root });

  if (!existsSync(join(root, "dist", "index.html"))) {
    throw new Error("dist/index.html missing after build — aborting before touching the server.");
  }

  console.log("\n==> packing dist");
  sh("tar", ["-czf", distTar, "-C", join(root, "dist"), "."]);

  console.log("\n==> uploading");
  const uploads = [distTar];
  if (existsSync(vhostSrc)) uploads.push(vhostSrc);
  sh("scp", [
    ...identity,
    "-o", "BatchMode=yes", "-o", "IdentitiesOnly=yes",
    "-P", PORT, ...uploads, `${USER}@${HOST}:/tmp/`,
  ]);

  const password = process.env.DEPLOY_SUDO_PASS ?? (await ask("sudo password for " + USER + "@" + HOST + ": "));

  // One sudo invocation for the whole swap: sudo -S reads the password from
  // stdin, so it never reaches the remote process list or a remote file.
  const remoteScript = `
set -euo pipefail
WEBROOT="${WEBROOT}"
STAGE="$(dirname "$WEBROOT")/.$(basename "$WEBROOT").new"

rm -rf "$STAGE"; mkdir -p "$STAGE"
tar -xzf /tmp/dist.tar.gz -C "$STAGE"

rm -rf "\${WEBROOT}.old"
[ -d "$WEBROOT" ] && mv "$WEBROOT" "\${WEBROOT}.old"
mv "$STAGE" "$WEBROOT"
chown -R root:root "$WEBROOT"
find "$WEBROOT" -type d -exec chmod 755 {} +
find "$WEBROOT" -type f -exec chmod 644 {} +

if [ -f /tmp/swatithetravelqueen.nginx.conf ]; then
  cp /tmp/swatithetravelqueen.nginx.conf "/etc/nginx/${SITE}"
  ln -sfn "/etc/nginx/${SITE}" "/etc/nginx/sites-enabled/${HOSTNAME}"
fi

if ! nginx -t; then
  echo "nginx -t FAILED: vhost installed but nginx NOT reloaded" >&2
  exit 1
fi
systemctl reload nginx
sleep 1
systemctl is-active nginx

echo "--- serving check ---"
curl -sS -o /dev/null -w "  / -> %{http_code}\\n" -H "Host: ${HOSTNAME}" http://127.0.0.1/
curl -sS -H "Host: ${HOSTNAME}" http://127.0.0.1/ | grep -oE "<title>[^<]*</title>" || true
curl -sS -o /dev/null -w "  /trips/kashmir -> %{http_code}\\n" -H "Host: ${HOSTNAME}" http://127.0.0.1/trips/kashmir
`;
  console.log("\n==> installing and reloading nginx");
  const res = sh("ssh", sshArgs("sudo -S -p '' bash -s"), { input: password + "\n" + remoteScript });
  process.stdout.write(res);

  console.log("\nDone. Note: nginx only serves the origin — the public hostname");
  console.log(`(${HOSTNAME}) needs a DNS record pointing at this server.`);
} catch (err) {
  console.error("\nDEPLOY FAILED:", err.message);
  process.exitCode = 1;
} finally {
  rmSync(tmp, { recursive: true, force: true });
}