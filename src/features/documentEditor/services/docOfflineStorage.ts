import { dbPromise } from "../../../lib/indexed-doc-db";

export async function saveDocument(
  documentId: string,
  update: Uint8Array
) {
  const db = await dbPromise;

  await db.put("documents", update, documentId);
}

export async function getDocument(documentId: string) {
  const db = await dbPromise;

  return db.get("documents", documentId) as Promise<Uint8Array | undefined>;
}

/**
 * Marks the document as needing a backend sync.
 * Stores only the latest write (full Yjs state) — overwritten on each offline edit.
 */
export async function queuePendingUpdate(
  documentId: string,
  update: Uint8Array
) {
  const db = await dbPromise;

  await db.put("pending-updates", [update], documentId);
}

export async function getPendingUpdates(documentId: string) {
  const db = await dbPromise;

  return (
    ((await db.get(
      "pending-updates",
      documentId
    )) as Uint8Array[]) ?? []
  );
}

export async function hasPendingUpdates(documentId: string) {
  const updates = await getPendingUpdates(documentId);
  return updates.length > 0;
}

export async function clearPendingUpdates(documentId: string) {
  const db = await dbPromise;

  await db.delete("pending-updates", documentId);
}
