const DB_NAME = "pos-offline";
const DB_VERSION = 2;

function openOfflineDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = request.result;
      const oldVersion = event.oldVersion;

      if (oldVersion < 1) {
        db.createObjectStore("pendingSales", { keyPath: "id" });
        db.createObjectStore("cachedProducts", { keyPath: "key" });
        db.createObjectStore("cachedCategories", { keyPath: "key" });
      }

      if (oldVersion < 2 && !db.objectStoreNames.contains("cachedShifts")) {
        db.createObjectStore("cachedShifts", { keyPath: "employeeId" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function runTransaction<T>(
  storeName: string,
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  return openOfflineDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(storeName, mode);
        const store = tx.objectStore(storeName);
        const request = operation(store);

        request.onsuccess = () => resolve(request.result as T);
        request.onerror = () => reject(request.error);
      })
  );
}

export async function idbPut<T>(storeName: string, value: T) {
  return runTransaction(storeName, "readwrite", (store) => store.put(value));
}

export async function idbGet<T>(storeName: string, key: IDBValidKey) {
  return runTransaction<T | undefined>(storeName, "readonly", (store) => store.get(key));
}

export async function idbGetAll<T>(storeName: string) {
  return runTransaction<T[]>(storeName, "readonly", (store) => store.getAll());
}

export async function idbDelete(storeName: string, key: IDBValidKey) {
  return runTransaction(storeName, "readwrite", (store) => store.delete(key));
}

export async function idbCount(storeName: string) {
  return runTransaction<number>(storeName, "readonly", (store) => store.count());
}
