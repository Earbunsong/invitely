"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { site } from "@/config/site";
import { Card, CheckoutShell } from "./Stepper";

type Status = { status: "PENDING" | "PAID" | "FAILED" | "EXPIRED"; accessCode?: string; invitationId?: string; slug?: string; phone?: string };

export function OrderStatus({ orderId, cancelled }: { orderId: string; cancelled: boolean }) {
  const [s, setS] = useState<Status | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!orderId) return setError("Missing order.");
    let stop = false;
    let tries = 0;
    const tick = async () => {
      tries++;
      const res = await fetch(`/api/orders/${orderId}/status`, { cache: "no-store" });
      if (!res.ok) {
        setError("We couldn't find this order in this browser. If you paid, contact us on Telegram with your phone number.");
        return;
      }
      const j: Status = await res.json();
      if (stop) return;
      setS(j);
      // Poll every 3s for up to 10 minutes while the payment is pending.
      if (j.status === "PENDING" && tries < 200) setTimeout(tick, 3000);
    };
    tick();
    return () => {
      stop = true;
    };
  }, [orderId]);

  if (error) {
    return (
      <CheckoutShell step={2}>
        <Card>
          <p className="text-sm text-red-600">{error}</p>
          <a href={site.telegram} className="btn-sage mt-4 block rounded-full py-3 text-center font-semibold text-white">
            Contact support
          </a>
        </Card>
      </CheckoutShell>
    );
  }

  if (!s || s.status === "PENDING") {
    return (
      <CheckoutShell step={2}>
        <Card>
          <div className="py-8 text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-sage/20 border-t-sage" />
            <p className="mt-5 font-heading font-semibold">{cancelled ? "Payment was cancelled" : "Waiting for payment confirmation…"}</p>
            <p className="mt-2 text-sm text-muted">
              {cancelled ? "You can go back and try again." : "Keep this page open. It updates automatically as soon as ABA PayWay confirms your payment."}
            </p>
            {cancelled && (
              <Link href="/#pricing" className="btn-coral mt-5 inline-block rounded-full px-6 py-3 font-semibold text-white">
                Start again
              </Link>
            )}
          </div>
        </Card>
      </CheckoutShell>
    );
  }

  if (s.status !== "PAID") {
    return (
      <CheckoutShell step={2}>
        <Card>
          <p className="font-semibold">This order has {s.status === "EXPIRED" ? "expired" : "failed"}.</p>
          <p className="mt-1 text-sm text-muted">No money was taken for an expired order. If you were charged, contact us with your phone number.</p>
          <Link href="/#pricing" className="btn-coral mt-4 block rounded-full py-3 text-center font-semibold text-white">
            Start again
          </Link>
        </Card>
      </CheckoutShell>
    );
  }

  const copy = async () => {
    await navigator.clipboard.writeText(s.accessCode ?? "");
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <CheckoutShell step={3}>
      <Card>
        <div className="text-center">
          <p className="text-5xl">🎉</p>
          <h1 className="mt-3 font-heading text-2xl font-bold">Payment successful!</h1>
          <p className="mt-1 text-sm text-muted">Save your access code — you need it with your phone number to sign in again.</p>
          <div className="mt-5 rounded-2xl border-2 border-dashed border-sage bg-sage-soft p-4">
            <p className="text-xs uppercase tracking-wider text-sage">Your access code</p>
            <p className="mt-1 font-mono text-3xl font-bold tracking-[0.3em] text-sage-dark">{s.accessCode}</p>
            <p className="mt-1 text-xs text-muted">Phone: {s.phone}</p>
          </div>
          <button onClick={copy} className="mt-3 text-sm font-semibold text-sage underline">
            {copied ? "Copied ✓" : "Copy code"}
          </button>
          <Link href={`/edit/${s.invitationId}`} className="btn-coral mt-5 block rounded-full py-3.5 font-heading font-bold text-white">
            Start designing my invitation →
          </Link>
        </div>
      </Card>
    </CheckoutShell>
  );
}
