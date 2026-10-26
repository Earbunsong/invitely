"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/site/Logo";

export function LoginForm() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone, code }) });
    const j = await res.json();
    setBusy(false);
    if (!res.ok) return setError(j.error);
    router.push(`/edit/${j.invitationId}`);
  };

  return (
    <main className="flex min-h-dvh items-center justify-center bg-blush p-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-lg">
        <Link href="/" className="flex justify-center">
          <Logo />
        </Link>
        <h1 className="mt-6 text-center font-heading text-xl font-bold">Sign in to keep editing</h1>
        <p className="mt-1 text-center text-sm text-muted">Use the phone number from checkout and your access code.</p>
        <label className="mt-6 block text-sm font-medium">Phone number</label>
        <input required inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="012 345 678" className="mt-1 w-full rounded-xl border px-3 py-2.5 outline-none focus:ring-2 focus:ring-sage/40" />
        <label className="mt-4 block text-sm font-medium">Access code</label>
        <input
          required
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="ABCD2345"
          className="mt-1 w-full rounded-xl border px-3 py-2.5 font-mono tracking-widest outline-none focus:ring-2 focus:ring-sage/40"
        />
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        <button disabled={busy} className="btn-sage mt-6 w-full rounded-full py-3 font-heading font-semibold text-white disabled:opacity-60">
          {busy ? "Signing in…" : "Sign in"}
        </button>
        <p className="mt-4 text-center text-xs text-muted">
          Don&apos;t have an invitation yet?{" "}
          <Link href="/#pricing" className="font-semibold text-coral">
            Create one
          </Link>
        </p>
      </form>
    </main>
  );
}
