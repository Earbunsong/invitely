"use client";

import { useActionState } from "react";
import { deleteTemplate } from "./actions";

export function DeleteTemplateButton({ id }: { id: string }) {
  const [error, action, pending] = useActionState(deleteTemplate, null);
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(`Delete template "${id}"? This cannot be undone.`)) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button disabled={pending} className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700">
        Delete
      </button>
      {error && <p className="mt-1 text-[11px] text-red-700">{error}</p>}
    </form>
  );
}
