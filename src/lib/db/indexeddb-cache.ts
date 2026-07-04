export interface StorageStatus {
  availableBytes: number;
  isSufficient: boolean;
  isCached: boolean;
}

/**
 * Checks if the browser has enough free storage to download and cache the model.
 */
export async function verifyLocalStorageQuota(): Promise<StorageStatus> {
  if (typeof window === "undefined" || !navigator.storage || !navigator.storage.estimate) {
    return { availableBytes: 0, isSufficient: true, isCached: false };
  }

  try {
    const estimation = await navigator.storage.estimate();
    const quota = estimation.quota || 0;
    const usage = estimation.usage || 0;
    const availableBytes = quota - usage;

    // Minimum safety margin of 2.5 GB required for storing and compiling the model shards
    const minRequiredBytes = 2.5 * 1024 * 1024 * 1024;
    
    // Check if the model database exists in the Cache API storage space
    const cacheNames = await window.caches.keys();
    const isCached = cacheNames.some((name) => name.includes("mlc-chat"));

    return {
      availableBytes,
      isSufficient: availableBytes >= minRequiredBytes,
      isCached,
    };
  } catch (error) {
    console.error("Failed to estimate browser storage metrics:", error);
    return { availableBytes: 0, isSufficient: false, isCached: false };
  }
}

/**
 * Clears cached WebLLM structures from the Cache API to free up storage space.
 */
export async function clearWebLlmCache(): Promise<boolean> {
  if (typeof window === "undefined") return false;

  try {
    const cacheNames = await window.caches.keys();
    const targets = cacheNames.filter((name) => name.includes("mlc-chat"));
    
    await Promise.all(targets.map((name) => window.caches.delete(name)));
    return targets.length > 0;
  } catch (error) {
    console.error("Cache purge failed:", error);
    return false;
  }
}
