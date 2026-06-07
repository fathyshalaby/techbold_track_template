function formatError(err: unknown): string {
  if (err instanceof Error) {
    return err.stack ?? err.message;
  }
  return String(err);
}

export function shouldRegisterProcessGuards(): boolean {
  if (process.env.VITEST) return false;
  if (process.env.NODE_ENV === "test") return false;
  return true;
}

export function registerProcessGuards(): void {
  if (!shouldRegisterProcessGuards()) return;

  process.on("unhandledRejection", (reason) => {
    console.error("[fatal-async] unhandled promise rejection:", formatError(reason));
  });

  process.on("uncaughtException", (err) => {
    console.error("[fatal-sync] uncaught exception:", formatError(err));
    process.exit(1);
  });
}
