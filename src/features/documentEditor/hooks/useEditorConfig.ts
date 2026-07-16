import {
  queuePendingUpdate,
  saveDocument,
} from "../services/docOfflineStorage";

// yjs -document converter
import * as Y from "yjs";
import {
  prosemirrorToYXmlFragment,
} from "y-prosemirror";

import { documentSocketService } from "../services/documentSocket";

// tiptap-editor
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import Typography from "@tiptap/extension-typography";
import { useEditor } from "@tiptap/react";
import { Socket } from "node_modules/socket.io-client/build/esm/socket";

const useEditorConfig = (
  canEdit: boolean,
  documentId: string,
  socket: Socket,
  isApplyingRemoteUpdate: React.RefObject<boolean>,
  hasLoadedDocument: React.RefObject<boolean>,
  ydocRef: React.RefObject<Y.Doc | null>,
) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Highlight,
      Typography,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],

    content: "",
    immediatelyRender: false,
    editable: canEdit,

    onUpdate: ({ editor }) => {
      if (isApplyingRemoteUpdate.current || !hasLoadedDocument.current) {
        return;
      }

      const ydoc = ydocRef.current;

      if (!ydoc) return;

      const stateVector = Y.encodeStateVector(ydoc);
      const fragment = ydoc.getXmlFragment("prosemirror");

      prosemirrorToYXmlFragment(editor.state.doc, fragment);

      const update = Y.encodeStateAsUpdate(ydoc, stateVector);

      if (update.byteLength === 0) return;

      // Full document state — source of truth in IndexedDB for reload / reconnect.
      const fullState = Y.encodeStateAsUpdate(ydoc);

      async function sendUpdate() {
        // 1) Always persist to IndexedDB first.
        await saveDocument(documentId, fullState);

        const canReachServer = navigator.onLine && socket.connected;

        if (!canReachServer) {
          // Mark latest IndexedDB write for backend sync when connectivity returns.
          await queuePendingUpdate(documentId, fullState);
          return;
        }

        // 2) Then push to the backend.
        try {
          await documentSocketService.updateDocument(socket, documentId, update);
        } catch {
          await queuePendingUpdate(documentId, fullState);
        }
      }

      return sendUpdate();
    },
  });
  return { editor };
};

export default useEditorConfig;
