import { getApiTargetLogValue } from "@/lib/api-target";

export function register() {
  console.info("MELSSY frontend startup", { apiTarget: getApiTargetLogValue() });
}
