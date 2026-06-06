export const REDACTION_CAP_BYTES = 16384;

export type RedactionPattern = {
  name: string;
  pattern: RegExp;
  replacement: string | ((...args: string[]) => string);
};

const REDACTION_PATTERNS: RedactionPattern[] = [
  {
    name: 'private-key-block',
    // Match from BEGIN to END (when present) or to end-of-string — handles truncated keys at 16 KB cap
    pattern: /-----BEGIN[\s\S]*?PRIVATE KEY-----[\s\S]*?(?:-----END[^-]*PRIVATE KEY-----|$)/g,
    replacement: '«redacted»',
  },
  {
    name: 'authorization-header',
    pattern: /(authorization\s*:\s*).+/gi,
    replacement: '$1«redacted»',
  },
  {
    name: 'bearer-token',
    pattern: /Bearer\s+[A-Za-z0-9\-_.~+/]+=*/gi,
    replacement: 'Bearer «redacted»',
  },
  {
    name: 'jwt',
    // JSON Web Token: header.payload.signature; header/payload begin with the
    // base64url of `{"` = `eyJ`. Distinctive shape, ~zero false positives.
    // (Pattern borrowed from gitleaks/trufflehog rulesets.)
    pattern: /\beyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g,
    replacement: '«redacted»',
  },
  {
    name: 'db-connection-string',
    pattern: /(postgres(?:ql)?|mysql|mongodb|redis):\/\/[^@\s]+@[^\s]*/gi,
    replacement: '$1://«redacted»',
  },
  {
    name: 'aws-access-key',
    pattern: /AKIA[A-Z0-9]{16}/g,
    replacement: '«redacted»',
  },
  {
    name: 'azure-sas-fragment',
    pattern: /sig=[A-Za-z0-9%+/=]{20,}/g,
    replacement: 'sig=«redacted»',
  },
  {
    name: 'password-field',
    pattern: /(passw(?:or)?d\s*[=:]\s*)\S+/gi,
    replacement: '$1«redacted»',
  },
  {
    name: 'token-field',
    pattern: /(token\s*[=:]\s*)\S+/gi,
    replacement: '$1«redacted»',
  },
  {
    name: 'secret-field',
    pattern: /(secret\s*[=:]\s*)\S+/gi,
    replacement: '$1«redacted»',
  },
  {
    name: 'api-key-field',
    pattern: /(api[_-]?key\s*[=:]\s*)\S+/gi,
    replacement: '$1«redacted»',
  },
  // JSON-encoded variants: "key":"value" or "key": "value"
  {
    name: 'json-token-field',
    // Any JSON key containing a secret-indicator word (token, secret, password,
    // key, credential, auth) — catches compound names like phoenix_token, ssh_key.
    pattern: /("[A-Za-z0-9_-]*(?:token|secret|passwd|password|api[_-]?key|key|authorization|auth|credential)[A-Za-z0-9_-]*"\s*:\s*)"[^"]*"/gi,
    replacement: '$1"«redacted»"',
  },
  {
    name: 'env-secret-var',
    // Matches env var names (upper or lower case) containing secret-indicator words.
    // Negative lookahead prevents double-redacting already-redacted values.
    pattern: /\b([A-Za-z_]*(?:SECRET|TOKEN|KEY|PASS|PASSWORD|CREDENTIAL|secret|token|key|pass|password|credential)[A-Za-z_0-9]*\s*=\s*)(?!«redacted»)\S+/g,
    replacement: '$1«redacted»',
  },
  {
    name: 'secret-header',
    // Custom HTTP headers carrying tokens/keys/secrets (e.g. X-Phoenix-Token: abc123)
    pattern: /([Xx]-[A-Za-z0-9-]*(?:token|key|secret|auth)[A-Za-z0-9-]*\s*:\s*)\S+/gi,
    replacement: '$1«redacted»',
  },
];

export function redactSecrets(text: string): string {
  const capped = text.length > REDACTION_CAP_BYTES ? text.slice(0, REDACTION_CAP_BYTES) : text;
  return REDACTION_PATTERNS.reduce((s, { pattern, replacement }) => {
    // Reset lastIndex for stateful global regexes when used with replace
    pattern.lastIndex = 0;
    return s.replace(pattern, replacement as string);
  }, capped);
}
