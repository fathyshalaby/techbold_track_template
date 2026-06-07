# Phase 4 Verification

## Environment Readiness Probe

Command:

```bash
node - <<'JS'
const fs = require('fs');
const envText = fs.readFileSync('.env', 'utf8');
const env = Object.fromEntries(envText.split(/\r?\n/).filter((line) => line && !line.trim().startsWith('#')).map((line) => {
  const index = line.indexOf('=');
  return index === -1 ? [line.trim(), ''] : [line.slice(0, index).trim(), line.slice(index + 1).trim()];
}));
const placeholder = (value, markers) => !value || markers.some((marker) => value.includes(marker));
console.log(JSON.stringify({
  phoenixBaseUrl: env.PHOENIX_API_BASE_URL || null,
  phoenixTokenReady: !placeholder(env.PHOENIX_API_TOKEN, ['your-phoenix-token-here']),
  sshPrivateKeyPath: env.SSH_PRIVATE_KEY_PATH || null,
  sshKeyExists: env.SSH_PRIVATE_KEY_PATH ? fs.existsSync(env.SSH_PRIVATE_KEY_PATH) : false,
  sshUsername: env.SSH_USERNAME || null,
  llmProvider: env.LLM_PROVIDER || null,
  openAiKeyReady: !placeholder(env.OPENAI_API_KEY, ['your-openai-key-here']),
  mockMode: env.MOCK_MODE || null
}, null, 2));
JS
```

Result:

```json
{
  "phoenixBaseUrl": "http://68.210.101.85:8000",
  "phoenixTokenReady": false,
  "sshPrivateKeyPath": "/keys/your-key.pem",
  "sshKeyExists": false,
  "sshUsername": "azureuser",
  "llmProvider": "openai",
  "openAiKeyReady": false,
  "mockMode": "true"
}
```

## Phoenix Probe

Command:

```bash
curl -sS -o /tmp/techbold_phase4_phoenix_me.json \
  -w 'http_code=%{http_code} time_total=%{time_total}\n' \
  -H 'Authorization: Bearer your-phoenix-token-here' \
  http://68.210.101.85:8000/api/v1/me
```

Result:

```text
http_code=401 time_total=0.088428
{"detail":"Invalid team token"}
```

Conclusion:

- Phoenix endpoint is reachable.
- REAL-01 is blocked by missing real `PHOENIX_API_TOKEN`.

## SSH Key Probe

Command:

```bash
if [ -f /keys/your-key.pem ]; then
  echo 'ssh_key_exists=true'
else
  echo 'ssh_key_exists=false path=/keys/your-key.pem'
fi
find . -maxdepth 4 \( -name '*.pem' -o -name 'id_rsa' -o -name 'id_ed25519' \) -type f -print
```

Result:

```text
ssh_key_exists=false path=/keys/your-key.pem
```

The repository search returned no local private key candidates.

Conclusion:

- SSH cannot be attempted safely because the configured key is missing.
- A real VM host/port is also unavailable because Phoenix real access is blocked.

## Sudo Probe

Not executed.

Blocked command:

```bash
ssh -i /keys/your-key.pem -o BatchMode=yes -o StrictHostKeyChecking=accept-new -p <port> azureuser@<host> 'sudo -n true'
```

Blocker:

- Missing key at `/keys/your-key.pem`.
- Missing real `<host>` and `<port>` from Phoenix customer-system data.

## LLM Probe

Command:

```bash
node - <<'JS'
const fs = require('fs');
const envText = fs.readFileSync('.env', 'utf8');
const openAi = /^OPENAI_API_KEY=(.*)$/m.exec(envText)?.[1]?.trim() || '';
const provider = /^LLM_PROVIDER=(.*)$/m.exec(envText)?.[1]?.trim() || '';
if (!openAi || openAi === 'your-openai-key-here') {
  console.log(`llm_probe=blocked provider=${provider || 'unset'} reason=OPENAI_API_KEY placeholder_or_missing`);
} else {
  console.log(`llm_probe=ready provider=${provider}`);
}
JS
```

Result:

```text
llm_probe=blocked provider=openai reason=OPENAI_API_KEY placeholder_or_missing
```

Conclusion:

- REAL-03 is blocked by missing real `OPENAI_API_KEY`.

## Compose Environment Check

Command:

```bash
docker compose config --format json
```

Sanitized result:

```json
{
  "mockMode": "true",
  "phoenixBaseUrl": "http://68.210.101.85:8000",
  "phoenixTokenSet": true,
  "sshPrivateKeyPath": "/keys/your-key.pem",
  "sshUsername": "azureuser",
  "llmProvider": "openai",
  "openAiKeySet": true
}
```

Note:

- Compose sees the placeholder values from `.env`.
- The readiness probes above distinguish placeholder values from real credentials.

## Requirement Status

- REAL-01: complete as blocked by exact credential failure.
- REAL-02: complete as blocked by exact key and host prerequisites.
- REAL-03: complete as blocked by exact credential failure.
