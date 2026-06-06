export const REDACTION_CAP_BYTES = 16384;

export type RedactionPattern = {
  name: string;
  pattern: RegExp;
  replacement: string | ((...args: string[]) => string);
};

const REDACTION_PATTERNS: RedactionPattern[] = [
  {
    name: 'private-key-block',
    pattern: /-----BEGIN[\s\S]*?PRIVATE KEY-----[\s\S]*?-----END[^-]*PRIVATE KEY-----/g,
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
    pattern: /(passw(?:or)?d\s*=\s*)\S+/gi,
    replacement: '$1«redacted»',
  },
  {
    name: 'token-field',
    pattern: /(token\s*=\s*)\S+/gi,
    replacement: '$1«redacted»',
  },
  {
    name: 'secret-field',
    pattern: /(secret\s*=\s*)\S+/gi,
    replacement: '$1«redacted»',
  },
  {
    name: 'api-key-field',
    pattern: /(api[_-]?key\s*=\s*)\S+/gi,
    replacement: '$1«redacted»',
  },
  {
    name: 'env-secret-var',
    // Matches ENV_VAR_NAMES that contain secret-indicator words, not already handled above.
    // Negative lookahead prevents matching «redacted» values from prior passes.
    pattern: /\b([A-Z_]*(?:SECRET|TOKEN|KEY|PASS|PASSWORD|CREDENTIAL)[A-Z_0-9]*\s*=\s*)(?!«redacted»)\S+/g,
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
