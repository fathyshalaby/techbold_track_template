// Deterministic backstop: a systemd "unit not found" probe disproves hypotheses
// that name that unit, regardless of LLM confidence.

const UNIT_NOT_FOUND_SIGNAL =
  /not[- ]found|does not exist|could not be found|Failed to (?:get|enable) unit|Unit .* not loaded|No such file or directory/i;

export function latestObservationDisprovesUnitHypothesis(latestObservation: string): boolean {
  if (!/exit_code:\s*4\b/.test(latestObservation)) return false;
  if (!UNIT_NOT_FOUND_SIGNAL.test(latestObservation)) return false;
  const commandLine = latestObservation.match(/^\$ (.+)$/m)?.[1] ?? "";
  return /\bsystemctl\b/.test(commandLine);
}
