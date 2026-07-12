"use client";

import { Share2 } from "lucide-react";

import {
  selectCurrentDocumentShareLink,
  selectDocumentName,
  useFetchDocumentDetails,
} from "@/features/documents";

type DocumentsEditorHeaderProps = {
  documentId: string;
  documentToken: string;
  onShareClick: () => void;
};

const DocumentsEditorHeader = ({
  documentId,
  documentToken,
  onShareClick,
}: DocumentsEditorHeaderProps) => {
  const { data: documentNameFromApi, isLoading, isError } =
    useFetchDocumentDetails(documentToken, { select: selectDocumentName });

  const { data: currentUserDocDetailsFromApi } =
    useFetchDocumentDetails(documentToken, { select: selectCurrentDocumentShareLink });

  const documentName = isLoading
    ? "Loading document..."
    : documentNameFromApi ?? `Document #${documentId}`;

  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-slate-950/70 p-5 shadow-[0_18px_50px_rgba(2,6,23,0.28)] backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
          Document workspace
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          {documentName}
        </h1>
        {isError && (
          <p role="alert" className="mt-2 text-sm text-rose-300">
            We couldn&apos;t load the latest document details.
          </p>
        )}
      </div>
      {(currentUserDocDetailsFromApi?.role === "OWNER" || currentUserDocDetailsFromApi === undefined) && (
        <button
          type="button"
          onClick={onShareClick}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-2.5 text-sm font-medium text-cyan-200 transition hover:bg-cyan-500/20"
        >
          <Share2 className="h-4 w-4" />
          Share link
        </button>
      )}
    </div>
  );
};

export default DocumentsEditorHeader;
