"use client";

import Link from "next/link";
import { useFetchDocuments } from "../hooks/useFetchDocuments";
import CreateDocumentCard from "./CreateDocumentCard";
import DocumentCard from "./DocumentCard";

const DocumentList = () => {
  const { data: documents = [], isLoading, isError } = useFetchDocuments();

  if (isLoading) {
    return (
      <p className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 text-sm text-slate-300">
        Loading documents...
      </p>
    );
  }

  if (isError) {
    return (
      <p
        role="alert"
        className="rounded-3xl border border-rose-400/20 bg-rose-500/10 p-6 text-sm text-rose-200"
      >
        We could not load your documents. Please try again.
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <CreateDocumentCard data-testid="create-document-card" />
      {documents.length === 0 && (
        <p className="flex min-h-57.5 items-center justify-center rounded-3xl border border-dashed border-white/15 bg-slate-950/40 p-6 text-center text-sm text-slate-400">
          No documents yet. Create your first one to get started.
        </p>
      )}
      {documents?.map((document, index) => (
        <Link
          href={`/documents/${document?.id}/${document.associatedRoleToken}`}
          key={document.id ?? document.id ?? `${document.name}-${index}`}
        >
          <DocumentCard data-testid="document-card" document={document} />
        </Link>
      ))}
    </div>
  );
};

export default DocumentList;
