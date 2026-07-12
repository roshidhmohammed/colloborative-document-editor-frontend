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
  saveDocument,
} from "../services/docOfflineStorage";
import { useOfflineSync } from "../hooks/useDocOfflineSync";
import useEditorConfig from "../hooks/useEditorConfig";


const Editor = ({ documentId, documentToken }: EditorProps) => {
  const socket = getSocket();
  useOfflineSync(socket, documentId);

  const ydocRef = useRef<Y.Doc | null>(null);
  const isApplyingRemoteUpdate = useRef(false);
  const hasLoadedDocument = useRef(false);

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

      if (local) {
        applyDocumentUpdate(local);
        hasLoadedDocument.current = true;
      }
    }

    loadDocumentFromIndexedDB();

    documentSocketService
      .joinDocument(socket, documentId)
      .then(async (update) => {
        if (!active) return;

        applyDocumentUpdate(update);
        await saveDocument(documentId, toUint8Array(update));

        hasLoadedDocument.current = true;
      })
      .catch((error) => {
        if (active) console.error(error);
      });
    const onRemoteUpdate = async (update: DocumentUpdate) => {
      applyDocumentUpdate(update);

      await saveDocument(documentId, toUint8Array(update));
    };

    socket.on("document:update", onRemoteUpdate);

    return () => {
      active = false;
      hasLoadedDocument.current = false;
      socket.off("document:update", onRemoteUpdate);
      // socket.emit("disconnect");
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
