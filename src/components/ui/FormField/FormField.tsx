"use client";

import { ReactNode } from "react";

interface Props {
  label: string;
  required?: boolean;
  children: ReactNode;
  htmlFor?: string;
}

export default function FormField({
  label,
  htmlFor,
  required = false,
  children,
}: Props) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium">
        {label}

        {required && (
          <span className="ml-1 text-red-500">*</span>
        )}
      </label>

      {children}
    </div>
  );
}