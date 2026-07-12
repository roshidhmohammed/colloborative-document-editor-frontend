"use client";

import { useMemo, useState } from "react";
import { Copy } from "lucide-react";
import Modal from "@/components/ui/Modals/Modal";

import {
  selectDocumentShareLinks,
  useFetchDocumentDetails,
} from "@/features/documents";
import { ShareableRole, ShareModalProps } from "../types/share";

const ShareModal = ({
  documentToken,
  documentId,
  setShareOpen,
}: ShareModalProps) => {
  const [copied, setCopied] = useState(false);
  const [role, setRole] = useState<ShareableRole>("VIEWER");

  const {
    data: documentShareLinks = [],
    isLoading,
    isError,
  } = useFetchDocumentDetails(documentToken, {
    select: selectDocumentShareLinks,
  });

  const shareLink = useMemo(() => {
    const selectedLink = documentShareLinks.find(
      (link) => link.role === role && link.isActive
    );

    if (!selectedLink) {
      return "";
    }

    const origin = typeof window === "undefined" ? "" : window.location.origin;
    return `${origin}/documents/${selectedLink.documentId}/${selectedLink.token}`;
  }, [documentId, documentShareLinks, role]);

  const handleCopy = async () => {
    if (!shareLink) {
      return;
    }

    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Modal title="Share document" description="Choose access for the shared link." onClose={() => setShareOpen(false)}>
      <div className="mt-5 space-y-4">
        <label className="block text-sm font-medium text-slate-200">
          Access level
          <select
            value={role}
            onChange={(event) =>
              setRole(event.target.value as ShareableRole)
            }
            className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-cyan-400"
          >
            <option value="VIEWER">Viewer</option>
            <option value="EDITOR">Editor</option>
          </select>
        </label>

        {isError && (
          <p role="alert" className="text-sm text-rose-300">
            We couldn&apos;t load the sharing links.
          </p>
        )}

        <button
          type="button"
          onClick={handleCopy}
          disabled={isLoading || !shareLink}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Copy className="h-4 w-4" />
          {isLoading ? "Loading link..." : copied ? "Copied!" : "Copy link"}
        </button>
      </div>
    </Modal>
  );
};

export default ShareModal;