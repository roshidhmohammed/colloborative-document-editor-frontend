"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

import {
  CollaboratorList,
  DocumentsEditorHeader,
  Editor,
  useRegisterDocumentCollaborator,
} from "@/features/documentEditor";
import ShareModal from "@/features/documentEditor/components/ShareModal";

export default function DocumentPage() {
  const params = useParams<{ id: string; documentToken: string }>();
  const documentId = params?.id ?? "demo";
  const documentToken = params?.documentToken ?? "demo";
  const [shareOpen, setShareOpen] = useState(false);

  useRegisterDocumentCollaborator(documentId, documentToken);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_35%),linear-gradient(135deg,#020617_0%,#0f172a_55%,#111827_100%)] px-4 py-6 text-slate-100 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <DocumentsEditorHeader
          documentId={documentId}
          documentToken={documentToken}
          onShareClick={() => setShareOpen(true)}
        />

        <div className="grid gap-6 lg:grid-cols-[1.6fr_0.6fr]">
          <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-4 shadow-[0_18px_50px_rgba(2,6,23,0.28)] backdrop-blur-xl sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">Editor</h2>
                <p className="text-sm text-slate-400">
                  Collaborate and write in real time.
                </p>
              </div>
            </div>

            <div className="min-h-105 rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-slate-200 prose prose-invert max-w-none">
              <Editor documentId={documentId} documentToken={documentToken} />
            </div>
          </div>

          <CollaboratorList documentId={documentId} />
        </div>
      </div>

      {shareOpen && (
        <ShareModal
          documentToken={documentToken}
          documentId={documentId}
          setShareOpen={setShareOpen}
        />
      )}
    </main>
  );
}
