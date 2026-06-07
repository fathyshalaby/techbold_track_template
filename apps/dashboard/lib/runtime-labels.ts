export function runtimeModeLabel(mode: string): string {
  const value = mode.trim().toLowerCase();
  if (value === "mock") return "Live";
  if (value === "real") return "Live";
  return mode;
}
