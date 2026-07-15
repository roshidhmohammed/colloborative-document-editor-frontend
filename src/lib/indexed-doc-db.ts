"use client";

import { openDB } from "idb";

export const dbPromise = openDB("document-editor-db", 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains("documents")) {
      db.createObjectStore("documents");
    }

    if (!db.objectStoreNames.contains("pending-updates")) {
      db.createObjectStore("pending-updates");
    }
  },
});
