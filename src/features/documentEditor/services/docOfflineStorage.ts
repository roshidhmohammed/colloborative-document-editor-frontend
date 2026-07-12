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

  return db.get("documents", documentId);
}

export async function queuePendingUpdate(
  documentId: string,
  update: Uint8Array
) {
  const db = await dbPromise;

  const updates =
    ((await db.get("pending-updates", documentId)) as Uint8Array[]) ?? [];

  updates.push(update);

  await db.put("pending-updates", updates, documentId);
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

export async function clearPendingUpdates(documentId: string) {
  const db = await dbPromise;

  await db.delete("pending-updates", documentId);
}

