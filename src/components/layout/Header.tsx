"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { UserCircle2 } from "lucide-react";
import ProfileModal from "@/features/user/components/ProfileModal";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="border-b z-[99999] border-slate-800/80 bg-slate-950/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <Link
          href="/documents"
          className="text-xl font-semibold tracking-tight text-white"
        >
          Collab Doc Creator
        </Link>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-slate-100 transition hover:border-cyan-400/50 hover:bg-slate-800"
            aria-label="Open profile menu"
          >
            <UserCircle2 className="h-6 w-6" />
          </button>

          {isMenuOpen && <ProfileModal data-testid="profile-modal" />}
        </div>
      </div>
    </header>
  );
}
