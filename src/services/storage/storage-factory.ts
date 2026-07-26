import { IStorageProvider } from "./storage-provider.interface";
import { R2StorageProvider } from "./providers/r2-storage-provider";
import { LocalStorageProvider } from "./providers/local-storage-provider";

let instance: IStorageProvider | null = null;

export function getStorageProvider(): IStorageProvider {
  if (!instance) {
    const providerType = process.env.STORAGE_PROVIDER || "r2";
    if (providerType === "local") {
      instance = new LocalStorageProvider();
    } else {
      instance = new R2StorageProvider();
    }
  }
  return instance;
}
