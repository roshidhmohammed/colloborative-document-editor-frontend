import { DocumentList, DocumentsHeader } from "@/features/documents";

export default function DocumentsPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.15),transparent_32%),linear-gradient(135deg,#020617_0%,#0f172a_55%,#111827_100%)] px-4 py-8 text-slate-100 sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto max-w-7xl">
        <DocumentsHeader />
        <DocumentList />
      </div>
    </main>
  );
}
