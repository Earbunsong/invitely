"use client";

import { useEffect, useState } from "react";
import { inputCls } from "./fields";

type Guest = { id: string; name: string; token: string; openedAt: string | null };
type Wish = { id: string; name: string; message: string; attending: boolean | null; partySize: number | null; guestToken: string | null };

export function GuestsPanel({ invitationId, publicUrl, limit }: { invitationId: string; publicUrl: string; limit: number }) {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [names, setNames] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const load = async () => {
    const res = await fetch(`/api/invitations/${invitationId}/guests`);
    if (!res.ok) return;
    const j = await res.json();
    setGuests(j.guests);
    setWishes(j.wishes);
  };
  useEffect(() => {
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const add = async () => {
    setError("");
    const list = names.split("\n").map((n) => n.trim()).filter(Boolean);
    if (!list.length) return;
    const res = await fetch(`/api/invitations/${invitationId}/guests`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ names: list }) });
    const j = await res.json();
    if (!res.ok) return setError(j.error);
    setGuests(j.guests);
    setNames("");
  };

  const remove = async (id: string) => {
    await fetch(`/api/invitations/${invitationId}/guests?guestId=${id}`, { method: "DELETE" });
    setGuests((g) => g.filter((x) => x.id !== id));
  };

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 1200);
  };

  const exportCsv = () => {
    const rows = [["Name", "Link", "Opened", "Attending", "Party size", "Message"]];
    for (const g of guests) {
      const w = wishes.find((x) => x.guestToken === g.token);
      rows.push([g.name, `${publicUrl}?g=${g.token}`, g.openedAt ? "yes" : "no", w?.attending == null ? "" : w.attending ? "yes" : "no", String(w?.partySize ?? ""), w?.message ?? ""]);
    }
    for (const w of wishes.filter((x) => !x.guestToken)) rows.push([w.name, "", "", w.attending == null ? "" : w.attending ? "yes" : "no", String(w.partySize ?? ""), w.message]);
    const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv" }));
    a.download = "guests.csv";
    a.click();
  };

  const attending = wishes.filter((w) => w.attending).reduce((n, w) => n + (w.partySize ?? 1), 0);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white p-4">
        <p className="text-sm font-semibold">Personal links ({guests.length}/{limit})</p>
        <p className="text-xs text-muted">Each guest gets a link that greets them by name. Paste one name per line.</p>
        <textarea aria-label="Guest names, one per line" rows={4} className={`${inputCls} mt-2`} value={names} onChange={(e) => setNames(e.target.value)} placeholder={"Mr. Sok Dara\nMs. Chan Sreymom"} />
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        <button onClick={add} className="btn-sage mt-2 rounded-full px-4 py-2 text-sm font-semibold text-white">
          Add guests
        </button>
      </div>

      {guests.length > 0 && (
        <ul className="divide-y rounded-2xl bg-white">
          {guests.map((g) => {
            const link = `${publicUrl}?g=${g.token}`;
            const w = wishes.find((x) => x.guestToken === g.token);
            return (
              <li key={g.id} className="flex items-center gap-2 p-3 text-sm">
                <span className="flex-1">
                  <span className="font-medium">{g.name}</span>
                  <span className="block text-[11px] text-muted">
                    {g.openedAt ? "👀 Opened" : "Not opened yet"}
                    {w?.attending != null && (w.attending ? ` · ✅ Coming (${w.partySize ?? 1})` : " · ❌ Not coming")}
                  </span>
                </span>
                <button onClick={() => copy(link, g.id)} className="rounded-lg bg-sage-soft px-2 py-1 text-xs font-semibold text-sage-dark">
                  {copied === g.id ? "Copied" : "Copy link"}
                </button>
                <a href={`https://t.me/share/url?url=${encodeURIComponent(link)}`} target="_blank" rel="noreferrer" className="rounded-lg bg-[#229ED9] px-2 py-1 text-xs font-semibold text-white">
                  Telegram
                </a>
                <button onClick={() => remove(g.id)} className="text-xs text-muted" aria-label={`Remove ${g.name}`}>
                  ✕
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <div className="rounded-2xl bg-white p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">RSVPs & wishes ({wishes.length})</p>
          <button onClick={exportCsv} className="text-xs font-semibold text-sage underline">
            Export CSV
          </button>
        </div>
        <p className="text-xs text-muted">Guests attending: {attending}</p>
        <ul className="mt-2 max-h-64 space-y-2 overflow-y-auto">
          {wishes.map((w) => (
            <li key={w.id} className="rounded-xl bg-blush p-2 text-sm">
              <span className="font-medium">{w.name}</span> {w.attending != null && (w.attending ? "✅" : "❌")}
              {w.message && <p className="text-xs text-muted">{w.message}</p>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
