// Neutralize generic runbook placeholders before they enter vector memory.
// Literal names like "myapp" were being recalled as if they were live targets.

const PLACEHOLDER_REPLACEMENTS: ReadonlyArray<[RegExp, string]> = [
  [/\bmyapp\.service\b/gi, "<SERVICE>.service"],
  [/\bmyapp\b/gi, "<SERVICE>"],
  [/\bappuser\b/gi, "<SERVICE_USER>"],
  [/\/etc\/myapp\b/g, "/etc/<SERVICE>"],
  [/\bUNIT\b/g, "<UNIT>"],
  [/<svc>/gi, "<SERVICE>"],
  [/<unit>/gi, "<UNIT>"],
  [/<port>/gi, "<PORT>"],
  [/<path>/gi, "<PATH>"],
  [/<tool>/gi, "<TOOL>"],
  [/<cert>/gi, "<CERT>"],
  [/<NAME>/g, "<NAME>"],
  [/<HOST>/g, "<HOST>"],
  [/<proxy>/gi, "<PROXY>"],
  [/<timer>/gi, "<TIMER>"],
  [/<pattern>/gi, "<PATTERN>"],
  [/<specific log file>/gi, "<LOG_FILE>"],
  [/<log file>/gi, "<LOG_FILE>"],
  [/<gateway>/gi, "<GATEWAY>"],
  [/<PID>/g, "<PID>"],
  [/<ver>/g, "<VER>"],
  [/<grp>/g, "<GROUP>"],
];

export function sanitizeRunbookPlaceholders(text: string): string {
  let result = text;
  for (const [pattern, replacement] of PLACEHOLDER_REPLACEMENTS) {
    result = result.replace(pattern, replacement);
  }
  return result;
}
