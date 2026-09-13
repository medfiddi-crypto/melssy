export type CommerceEventName = "ViewContent" | "AddToCart" | "InitiateCheckout" | "Purchase";

const fallbackUUID = () => {
  const timestamp = Date.now().toString(16).padStart(12, "0").slice(-12);
  const randomHex = (length: number) =>
    Array.from({ length }, () => Math.floor(Math.random() * 16).toString(16)).join("");
  const variant = (8 + Math.floor(Math.random() * 4)).toString(16);

  return `${timestamp.slice(0, 8)}-${timestamp.slice(8)}-4${randomHex(3)}-${variant}${randomHex(3)}-${randomHex(12)}`;
};

export function safeUUID(): string {
  try {
    if (typeof globalThis.crypto?.randomUUID === "function") {
      return globalThis.crypto.randomUUID();
    }
    if (typeof globalThis.crypto?.getRandomValues === "function") {
      const bytes = globalThis.crypto.getRandomValues(new Uint8Array(16));
      bytes[6] = (bytes[6] & 0x0f) | 0x40;
      bytes[8] = (bytes[8] & 0x3f) | 0x80;
      const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0"));
      return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex.slice(6, 8).join("")}-${hex.slice(8, 10).join("")}-${hex.slice(10).join("")}`;
    }
  } catch (error) {
    console.warn("Unable to use browser cryptography for an identifier.", error);
  }

  return fallbackUUID();
}

export function emitCommerceEvent(name: CommerceEventName, productIds: string[], value: number): string | null {
  try {
    const eventId = safeUUID();
    const payload = {
      content_type: "product",
      content_ids: productIds,
      value,
      currency: "MAD",
    };
    window.setTimeout(() => {
      try {
        const meta = window as Window & { fbq?: (...args: unknown[]) => void };
        meta.fbq?.("track", name, payload, { eventID: eventId });
      } catch (error) {
        console.warn("Unable to send commerce analytics.", error);
      }
    }, 0);
    return eventId;
  } catch (error) {
    console.warn("Unable to queue commerce analytics.", error);
    return null;
  }
}