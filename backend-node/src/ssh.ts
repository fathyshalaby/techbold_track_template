// SSH runner (mirror of backend-py/app/ssh.py) — ssh2, multi-key auto-detect, timeouts.
// The private key never leaves the backend. Output is returned raw; redaction happens upstream.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import { Client, type ConnectConfig } from "ssh2";
import { selectedCaseSource } from "./caseSource";
import { config } from "./config";

const MAX_OUTPUT = 20000;

export interface SSHResult {
  exit_code: number;
  stdout: string;
  stderr: string;
  duration_ms: number;
  truncated: boolean;
}

function cap(s: string): [string, boolean] {
  if (s.length > MAX_OUTPUT) return [s.slice(0, MAX_OUTPUT) + "\n…[output truncated]", true];
  return [s, false];
}

function candidateKeys(primary: string): string[] {
  const out: string[] = [];
  const sandboxKey = join(config.sshKeyDir, "bench_incident_key");
  if (selectedCaseSource() === "sandbox_cases" && existsSync(sandboxKey)) out.push(sandboxKey);
  if (primary && !out.includes(primary)) out.push(primary);

  const looksLikePrivateKey = (name: string) => name.endsWith(".pem") || name.endsWith("_key") || name.startsWith("id_");
  const addCandidateKeys = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, entry.name);
      if (entry.isDirectory()) {
        addCandidateKeys(p);
      } else if (entry.isFile() && looksLikePrivateKey(entry.name) && !entry.name.endsWith(".pub") && !out.includes(p)) {
        out.push(p);
      }
    }
  };

  try {
    addCandidateKeys(config.sshKeyDir);
  } catch {
    /* dir may not exist locally */
  }
  return out.length ? out : [primary];
}

export class SSHRunner {
  private conn: Client | null = null;

  constructor(
    private host: string,
    private username: string = config.sshUsername,
    private port: number = 22,
    private keyPath: string = config.sshKeyPath,
    private connectTimeoutMs: number = config.sshConnectTimeout * 1000,
    private commandTimeoutMs: number = config.sshCommandTimeout * 1000,
  ) {}

  private connectWithKey(keyPath: string): Promise<Client> {
    return new Promise((resolve, reject) => {
      let key: Buffer;
      try {
        key = readFileSync(keyPath);
      } catch (e) {
        return reject(new Error(`cannot read key ${keyPath}: ${(e as Error).message}`));
      }
      const client = new Client();
      const onError = (err: Error) => {
        client.end();
        reject(err);
      };
      client.on("ready", () => {
        client.removeListener("error", onError);
        resolve(client);
      });
      client.on("error", onError);
      const opts: ConnectConfig = {
        host: this.host,
        port: this.port,
        username: this.username,
        privateKey: key,
        readyTimeout: this.connectTimeoutMs,
      };
      client.connect(opts);
    });
  }

  async connect(): Promise<void> {
    if (this.conn) return;
    const errors: string[] = [];
    for (const keyPath of candidateKeys(this.keyPath)) {
      try {
        this.conn = await this.connectWithKey(keyPath);
        this.keyPath = keyPath;
        return;
      } catch (e) {
        const err = e as Error & { level?: string };
        errors.push(`${basename(keyPath)}: ${err.message}`);
        // Only auth failures are worth retrying with another key; bail fast on network errors.
        if (err.level && err.level !== "client-authentication") {
          throw new Error(`SSH connect to ${this.host}:${this.port} failed: ${err.message}`);
        }
      }
    }
    throw new Error(`SSH auth to ${this.host}:${this.port} failed for all keys [${errors.join("; ") || "no keys"}]`);
  }

  async run(command: string, timeoutMs: number = this.commandTimeoutMs): Promise<SSHResult> {
    await this.connect();
    const conn = this.conn!;
    const start = Date.now();
    return new Promise<SSHResult>((resolve, reject) => {
      let out = "";
      let err = "";
      let done = false;
      const finish = (r: SSHResult) => {
        if (done) return;
        done = true;
        clearTimeout(timer);
        resolve(r);
      };
      const timer = setTimeout(() => {
        const [so] = cap(out);
        const [se] = cap(err);
        finish({ exit_code: 124, stdout: so, stderr: se + "\n[command timed out]", duration_ms: Date.now() - start, truncated: true });
      }, timeoutMs);

      conn.exec(command, (e, stream) => {
        if (e) {
          clearTimeout(timer);
          return reject(e);
        }
        stream
          .on("close", (code: number | null) => {
            const [so, t1] = cap(out);
            const [se, t2] = cap(err);
            finish({ exit_code: code ?? 0, stdout: so, stderr: se, duration_ms: Date.now() - start, truncated: t1 || t2 });
          })
          .on("data", (d: Buffer) => {
            out += d.toString();
          });
        stream.stderr.on("data", (d: Buffer) => {
          err += d.toString();
        });
      });
    });
  }

  close(): void {
    if (this.conn) {
      try {
        this.conn.end();
      } catch {
        /* ignore */
      }
      this.conn = null;
    }
  }
}
