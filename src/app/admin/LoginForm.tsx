"use client";

import { useActionState } from "react";
import { adminLogin } from "./actions";

export function AdminLoginForm() {
  const [error, action, pending] = useActionState(adminLogin, null);
  return (
    <main className="flex min-h-dvh items-center justify-center bg-neutral-100 p-4">
      <form action={action} className="w-full max-w-xs space-y-3 rounded-2xl bg-white p-6 shadow">
        <h1 className="font-heading text-lg font-bold">Admin</h1>
        <input name="password" type="password" required placeholder="Password" className="w-full rounded-lg border px-3 py-2" />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button disabled={pending} className="w-full rounded-lg bg-ink py-2 font-semibold text-white">
          Sign in
        </button>
      </form>
    </main>
  );
}
