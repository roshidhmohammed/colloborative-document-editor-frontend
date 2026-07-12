import { Users } from "lucide-react";
import { useFetchCollaborators } from "../hooks/useFetchCollaborators";
import { Collaborator } from "../types/collaborator";


const CollaboratorList = ({ documentId }: { documentId: string }) => {
  const {
    data: collaborators = [],
    isLoading,
    isError,
  } = useFetchCollaborators(documentId);

  return (
    <aside className="rounded-3xl border border-white/10 bg-slate-950/70 p-4 shadow-[0_18px_50px_rgba(2,6,23,0.28)] backdrop-blur-xl sm:p-6">
      <div className="flex items-center gap-2">
        <Users className="h-5 w-5 text-cyan-300" />
        <h2 className="text-lg font-semibold text-white">Collaborators</h2>
      </div>

      <div className="mt-4 space-y-3">
        {isLoading && (
          <p className="text-sm text-slate-400">Loading collaborators...</p>
        )}

        {isError && (
          <p role="alert" className="text-sm text-rose-300">
            We couldn&apos;t load the collaborators.
          </p>
        )}

        {!isLoading && !isError && collaborators.length === 0 && (
          <p className="text-sm text-slate-400">No collaborators yet.</p>
        )}

        {collaborators.map((person:Collaborator) => {
          const displayName = person?.user?.fullName ? person.user.fullName :  "Not found the name";
          return (
            <div
              key={person.id ?? person.user?.id ?? person.id}
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/70 px-3 py-3"
            >
              <div className="flex items-center gap-3 pl-2">
                <div className="flex h-10 w-10 items-center justify-center text-sm font-semibold text-cyan-200">
                  {displayName}
                </div>
              </div>
              <span
                className={`h-3 w-3 rounded-full ${
                  person.status === "online" ? "bg-emerald-400" : "bg-slate-500"
                }`}
              />
            </div>
          );
        })}
      </div>
    </aside>
  );
};

export default CollaboratorList;