export function getApiTarget(): string {
  const configuredTarget = process.env.API_PROXY_TARGET;
  if (process.env.NODE_ENV === "production" && !configuredTarget) {
    throw new Error("Missing required environment variable: API_PROXY_TARGET");
  }
  return configuredTarget ?? process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";
}

export function getApiTargetLogValue(): string {
  const target = new URL(getApiTarget());
  return `${target.protocol}//${target.host}`;
}
