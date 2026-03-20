export async function register() {
  // Node.js 25+ exposes localStorage as a global but it doesn't work properly
  // in server context. This causes issues with libraries like nuqs that check
  // for localStorage availability. We delete it so those checks fall back gracefully.
  if (typeof window === "undefined" && typeof localStorage !== "undefined") {
    // @ts-expect-error - intentionally removing broken global
    delete globalThis.localStorage;
  }
}
