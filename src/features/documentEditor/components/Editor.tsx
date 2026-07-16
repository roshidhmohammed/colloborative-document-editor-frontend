"use client";

import { useEffect, useRef } from "react";
import { EditorContent } from "@tiptap/react";

import * as Y from "yjs";
import {
  yDocToProsemirrorJSON,
} from "y-prosemirror";

import {
  selectCanEditDocument,
  useFetchDocumentDetails,
} from "@/features/documents";

import Menubar from "./Menubar";
import { getSocket } from "@/lib/socket";
import { toUint8Array } from "../api/documentSocket.api";
import { documentSocketService } from "../services/documentSocket";
import type { DocumentUpdate, EditorProps } from "../types/documentEditor";
import {
  getDocument,
  hasPendingUpdates,
  saveDocument,
} from "../services/docOfflineStorage";
import {
  flushPendingDocumentUpdates,
  useOfflineSync,
} from "../hooks/useDocOfflineSync";
import useEditorConfig from "../hooks/useEditorConfig";


const Editor = ({ documentId, documentToken }: EditorProps) => {
  const socket = getSocket();

  const ydocRef = useRef<Y.Doc | null>(null);
  const isApplyingRemoteUpdate = useRef(false);
  const hasLoadedDocument = useRef(false);
  const joinFromServerRef = useRef<(() => Promise<void>) | null>(null);

  useOfflineSync(socket, documentId, async () => {
    await joinFromServerRef.current?.();
  });

  const { data: canEdit = false } = useFetchDocumentDetails(documentToken, {
    select: selectCanEditDocument,
  });

  const { editor } = useEditorConfig(
    canEdit,
    documentId,
    socket,
    isApplyingRemoteUpdate,
    hasLoadedDocument,
    ydocRef,
  );

  useEffect(() => {
    editor?.setEditable(canEdit);
  }, [editor, canEdit]);

  useEffect(() => {
    if (!editor) return;

    let active = true;
    const ydoc = new Y.Doc();

    ydocRef.current = ydoc;

    const persistFullState = async () => {
      if (!active) return;
      await saveDocument(documentId, Y.encodeStateAsUpdate(ydoc));
    };

    const applyDocumentUpdate = (
      update: DocumentUpdate | ArrayBuffer | number[],
    ) => {
      if (!active) return;

      Y.applyUpdate(ydoc, toUint8Array(update));

      const content = yDocToProsemirrorJSON(ydoc);

      isApplyingRemoteUpdate.current = true;

      try {
        editor.commands.setContent(content, {
          emitUpdate: false,
        });
      } finally {
        isApplyingRemoteUpdate.current = false;
      }
    };

    async function loadDocumentFromIndexedDB() {
      const local = await getDocument(documentId);

      if (!active || !local) return;

      applyDocumentUpdate(local);
      hasLoadedDocument.current = true;
    }

    /**
     * Fetch latest from server, merge into the local Y.Doc, persist to IndexedDB,
     * and show in the editor.
     */
    async function joinFromServer() {
      const update = await documentSocketService.joinDocument(socket, documentId);

      if (!active) return;

      applyDocumentUpdate(update);
      await persistFullState();
      hasLoadedDocument.current = true;
    }

    joinFromServerRef.current = joinFromServer;

    async function init() {
      // Keep any unsynced local writes in the Y.Doc before talking to the server
      // so a CRDT merge does not drop offline edits.
      const local = await getDocument(documentId);
      if (!active) return;

      if (local) {
        applyDocumentUpdate(local);
      }

      try {
        // Push unsynced IndexedDB writes to the backend first (if any).
        if (await hasPendingUpdates(documentId)) {
          await flushPendingDocumentUpdates(socket, documentId);
          if (!active) return;
        }

        // Fetch latest from server → IndexedDB → editor.
        await joinFromServer();
      } catch {
        // Offline / join failed: show IndexedDB content if we have it.
        if (!active) return;

        if (local) {
          hasLoadedDocument.current = true;
        } else {
          await loadDocumentFromIndexedDB();
        }
      }
    }

    void init();

    const onRemoteUpdate = async (update: DocumentUpdate) => {
      applyDocumentUpdate(update);
      await persistFullState();
    };

    socket.on("document:update", onRemoteUpdate);

    return () => {
      active = false;
      hasLoadedDocument.current = false;
      joinFromServerRef.current = null;
      socket.off("document:update", onRemoteUpdate);
      ydoc.destroy();
      if (ydocRef.current === ydoc) {
        ydocRef.current = null;
      }
    };
  }, [editor, socket, documentId]);

  if (!editor) return null;

  return (
    <div className="tiptap">
      {canEdit && <Menubar editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  );
};

export default Editor;
