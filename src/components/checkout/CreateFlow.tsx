"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { EVENT_LABELS, type EventType, type Plan } from "@/lib/plans";
import { Card, CheckoutShell } from "./Stepper";

const COUNTRY_CODES = ["+855", "+1", "+44", "+33", "+61", "+65", "+66", "+84", "+82", "+81", "+86", "+60"];

type PaymentOption = "abapay_khqr" | "abapay_khqr_deeplink" | "cards";
const PAYMENT_OPTIONS: { id: PaymentOption; title: string; text: string; icon: string }[] = [
  { id: "abapay_khqr", title: "ABA KHQR", text: "Scan with ABA Mobile or any KHQR banking app", icon: "🔳" },
  { id: "abapay_khqr_deeplink", title: "ABA Mobile", text: "Open ABA Mobile on this phone to pay", icon: "📱" },
  { id: "cards", title: "Credit / Debit Card", text: "Visa, Mastercard, UnionPay, JCB", icon: "💳" },
];

export function CreateFlow({ plan, minDate, paymentsMode }: { plan: Plan; minDate: string; paymentsMode: "live" | "mock" | "off" }) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [eventType, setEventType] = useState<EventType>(plan.eventTypes[0]);
  const [countryCode, setCountryCode] = useState("+855");
  const [phone, setPhone] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [agree, setAgree] = useState(false);
  const [promoOpen, setPromoOpen] = useState(false);
  const [promo, setPromo] = useState("");
  const [price, setPrice] = useState({ amount: plan.price, discount: 0, promoCode: undefined as string | undefined });
  const [promoMsg, setPromoMsg] = useState("");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [payment, setPayment] = useState<PaymentOption>("abapay_khqr");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const applyPromo = async () => {
    setPromoMsg("");
    const res = await fetch(`/api/orders?plan=${plan.id}&promo=${encodeURIComponent(promo)}`);
    const j = await res.json();
    if (j.promoError) return setPromoMsg(j.promoError);
    setPrice({ amount: j.amount, discount: j.discount, promoCode: j.promoCode });
    setPromoMsg(`Promo applied: -$${j.discount.toFixed(2)}`);
  };

  const submitInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: plan.id, eventType, countryCode, phone: phone.replace(/\D/g, ""), eventDate, promoCode: price.promoCode, agree }),
    });
    const j = await res.json();
    setBusy(false);
    if (!res.ok) return setError(j.error ?? "Something went wrong");
    setOrderId(j.orderId);
    setStep(2);
    window.scrollTo({ top: 0 });
  };

  const pay = async () => {
    if (!orderId) return;
    setError("");
    setBusy(true);
    const res = await fetch("/api/payway/purchase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, paymentOption: payment }),
    });
    const j = await res.json();
    if (!res.ok) {
      setBusy(false);
      return setError(j.error ?? "Could not start payment");
    }
    if (j.alreadyPaid) return router.push(`/create/status?order=${orderId}`);
    if (j.mock) {
      await fetch("/api/payway/mock", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId }) });
      return router.push(`/create/status?order=${orderId}`);
    }
    // Real PayWay: POST the signed fields to the hosted checkout page.
    const form = document.createElement("form");
    form.method = "POST";
    form.action = j.action;
    for (const [k, v] of Object.entries(j.fields as Record<string, string>)) {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = k;
      input.value = v;
      form.appendChild(input);
    }
    document.body.appendChild(form);
    form.submit();
  };

  const summary = (
    <Card title="Order summary">
      <div className="flex items-center justify-between">
        <p className="font-heading font-semibold">
          {plan.emoji} {plan.name}
        </p>
        <p className="font-heading text-2xl font-extrabold text-sage">${price.amount.toFixed(2)}</p>
      </div>
      {price.discount > 0 && <p className="text-right text-xs text-coral">You save ${price.discount.toFixed(2)}</p>}
      {step === 1 && (
        <>
          <p className="mt-4 text-xs font-bold uppercase tracking-wider text-sage">Features included</p>
          <ul className="mt-2 grid grid-cols-2 gap-2 text-xs">
            {plan.highlights.slice(0, 8).map((h) => (
              <li key={h.text} className="flex gap-1.5">
                <span>{h.icon}</span>
                <span>{h.text}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 border-t pt-3">
            {promoOpen ? (
              <div className="flex gap-2">
                <input value={promo} onChange={(e) => setPromo(e.target.value.toUpperCase())} placeholder="PROMO CODE" className="flex-1 rounded-xl border px-3 py-2 text-sm uppercase" />
                <button type="button" onClick={applyPromo} className="rounded-xl bg-sage px-4 text-sm font-semibold text-white">
                  Apply
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => setPromoOpen(true)} className="text-sm font-medium text-sage underline">
                🏷️ Have a promo code?
              </button>
            )}
            {promoMsg && <p className="mt-2 text-xs text-muted">{promoMsg}</p>}
          </div>
        </>
      )}
    </Card>
  );

  if (step === 2) {
    return (
      <CheckoutShell step={2}>
        {summary}
        <Card title="Choose how to pay">
          <div className="space-y-2">
            {PAYMENT_OPTIONS.map((o) => (
              <label key={o.id} className={`flex cursor-pointer items-center gap-3 rounded-2xl border-2 p-3 transition ${payment === o.id ? "border-sage bg-sage-soft" : "border-black/10"}`}>
                <input type="radio" name="payment" className="sr-only" checked={payment === o.id} onChange={() => setPayment(o.id)} />
                <span className="text-2xl">{o.icon}</span>
                <span>
                  <span className="block font-semibold">{o.title}</span>
                  <span className="block text-xs text-muted">{o.text}</span>
                </span>
              </label>
            ))}
          </div>
          {paymentsMode === "mock" && (
            <p className="mt-3 rounded-xl bg-amber-50 p-3 text-xs text-amber-800">
              Development mode: ABA PayWay keys are not set, so this simulates a successful payment. Add PAYWAY_MERCHANT_ID and PAYWAY_API_KEY to use the real sandbox.
            </p>
          )}
          {paymentsMode === "off" && <p className="mt-3 rounded-xl bg-red-50 p-3 text-xs text-red-700">Online payment is not available yet. Please contact us on Telegram.</p>}
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          <button onClick={pay} disabled={busy || paymentsMode === "off"} className="btn-coral mt-4 w-full rounded-full py-3.5 font-heading font-bold text-white disabled:opacity-60">
            {busy ? "Opening payment…" : `Pay $${price.amount.toFixed(2)} with ABA PayWay`}
          </button>
          <p className="mt-3 text-center text-xs text-muted">🔒 Payments are processed securely by ABA Bank PayWay.</p>
        </Card>
      </CheckoutShell>
    );
  }

  return (
    <CheckoutShell step={1}>
      {summary}
      <form onSubmit={submitInfo}>
        <Card title="Your information">
          <p className="mb-2 text-sm font-medium">What are you celebrating?</p>
          <div className="grid grid-cols-2 gap-2">
            {plan.eventTypes.map((et) => (
              <button
                type="button"
                key={et}
                onClick={() => setEventType(et)}
                className={`rounded-2xl border-2 px-3 py-3 text-sm font-semibold ${eventType === et ? "border-sage bg-sage-soft text-sage-dark" : "border-black/10"}`}
              >
                {EVENT_LABELS[et].emoji} {EVENT_LABELS[et].en}
              </button>
            ))}
          </div>

          <label className="mt-5 block text-sm font-medium" htmlFor="phone">
            Phone number <span className="text-coral">*</span>
          </label>
          <div className="mt-1 flex overflow-hidden rounded-xl border focus-within:ring-2 focus-within:ring-sage/40">
            <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)} className="bg-sage-soft px-2 text-sm font-semibold text-sage-dark outline-none" aria-label="Country code">
              {COUNTRY_CODES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <input id="phone" required inputMode="numeric" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. 012345678" className="flex-1 px-3 py-2.5 outline-none" />
          </div>
          <p className="mt-1 text-xs text-muted">Use a number with Telegram so we can send you updates. You&apos;ll sign in with it later.</p>

          <label className="mt-5 block text-sm font-medium" htmlFor="date">
            Event date <span className="text-coral">*</span>
          </label>
          <input id="date" type="date" required min={minDate} value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2.5 outline-none focus:ring-2 focus:ring-sage/40" />
          <p className="mt-1 text-xs text-muted">The event date must be at least 5 days from today.</p>

          <label className="mt-5 flex items-start gap-3 text-xs text-muted">
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[#6b8f71]" required />
            <span>
              I have read and agree to the{" "}
              <a href="/terms" target="_blank" className="text-sage underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="/privacy" target="_blank" className="text-sage underline">
                Privacy Policy
              </a>
              . I understand all sales are final.
            </span>
          </label>

          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
          <button disabled={busy} className="btn-coral mt-5 w-full rounded-full py-3.5 font-heading font-bold text-white disabled:opacity-60">
            {busy ? "Please wait…" : "Continue to Payment →"}
          </button>
        </Card>
      </form>
    </CheckoutShell>
  );
}
