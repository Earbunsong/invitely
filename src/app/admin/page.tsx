import { decryptCode, isAdmin } from "@/lib/auth";
import { getPlan } from "@/lib/plans";
import { isMockPayments, isPaywayConfigured } from "@/lib/payway";
import { prisma } from "@/lib/prisma";
import { adminLogout, confirmOrder, createPromo, togglePromo } from "./actions";
import { AdminLoginForm } from "./LoginForm";

export const metadata = { title: "Admin", robots: { index: false } };
export const dynamic = "force-dynamic";

const badge: Record<string, string> = {
  PAID: "bg-green-100 text-green-800",
  PENDING: "bg-amber-100 text-amber-800",
  EXPIRED: "bg-neutral-200 text-neutral-600",
  FAILED: "bg-red-100 text-red-700",
  PUBLISHED: "bg-green-100 text-green-800",
  DRAFT: "bg-amber-100 text-amber-800",
};

export default async function AdminPage() {
  if (!(await isAdmin())) return <AdminLoginForm />;

  const [orders, invitations, promos, revenue] = await Promise.all([
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 100, include: { invitation: { select: { slug: true } } } }),
    prisma.invitation.findMany({ orderBy: { createdAt: "desc" }, take: 100, include: { _count: { select: { guests: true, wishes: true } } } }),
    prisma.promoCode.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.order.aggregate({ where: { status: "PAID" }, _sum: { amount: true }, _count: true }),
  ]);

  return (
    <main className="mx-auto max-w-6xl space-y-8 p-6 text-sm">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Admin</h1>
        <form action={adminLogout}>
          <button className="text-muted underline">Sign out</button>
        </form>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Paid orders" value={String(revenue._count)} />
        <Stat label="Revenue" value={`$${Number(revenue._sum.amount ?? 0).toFixed(2)}`} />
        <Stat label="PayWay" value={isPaywayConfigured() ? "Configured" : isMockPayments() ? "Mock (dev)" : "Not configured"} />
      </div>

      <section>
        <h2 className="mb-2 font-heading text-lg font-semibold">Orders</h2>
        <div className="overflow-x-auto rounded-xl border bg-white">
          <table className="w-full text-left">
            <thead className="bg-neutral-50 text-xs uppercase text-muted">
              <tr>
                <th className="p-2">Created</th>
                <th className="p-2">Tran ID</th>
                <th className="p-2">Plan</th>
                <th className="p-2">Amount</th>
                <th className="p-2">Phone</th>
                <th className="p-2">Status</th>
                <th className="p-2">Invitation</th>
                <th className="p-2" />
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-t">
                  <td className="p-2 whitespace-nowrap">{o.createdAt.toISOString().slice(0, 16).replace("T", " ")}</td>
                  <td className="p-2 font-mono text-xs">{o.tranId}</td>
                  <td className="p-2">{getPlan(o.plan)?.name ?? o.plan}</td>
                  <td className="p-2">
                    ${Number(o.amount).toFixed(2)}
                    {o.promoCode && <span className="ml-1 text-xs text-muted">({o.promoCode})</span>}
                  </td>
                  <td className="p-2">{o.phone}</td>
                  <td className="p-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${badge[o.status]}`}>{o.status}</span>
                  </td>
                  <td className="p-2">{o.invitation ? <a className="text-sage underline" href={`/i/${o.invitation.slug}`}>/i/{o.invitation.slug}</a> : "—"}</td>
                  <td className="p-2">
                    {o.status !== "PAID" && (
                      <div className="flex gap-1">
                        {isPaywayConfigured() && (
                          <form action={confirmOrder}>
                            <input type="hidden" name="id" value={o.id} />
                            <button className="rounded bg-neutral-100 px-2 py-1 text-xs">Re-check PayWay</button>
                          </form>
                        )}
                        <form action={confirmOrder}>
                          <input type="hidden" name="id" value={o.id} />
                          <input type="hidden" name="manual" value="1" />
                          <button className="rounded bg-neutral-100 px-2 py-1 text-xs">Mark paid manually</button>
                        </form>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td className="p-4 text-muted" colSpan={8}>
                    No orders yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-2 font-heading text-lg font-semibold">Invitations</h2>
        <div className="overflow-x-auto rounded-xl border bg-white">
          <table className="w-full text-left">
            <thead className="bg-neutral-50 text-xs uppercase text-muted">
              <tr>
                <th className="p-2">Link</th>
                <th className="p-2">Template</th>
                <th className="p-2">Plan</th>
                <th className="p-2">Phone</th>
                <th className="p-2">Access code</th>
                <th className="p-2">Guests</th>
                <th className="p-2">Wishes</th>
                <th className="p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {invitations.map((i) => (
                <tr key={i.id} className="border-t">
                  <td className="p-2">
                    <a className="text-sage underline" href={`/i/${i.slug}`}>
                      /i/{i.slug}
                    </a>
                  </td>
                  <td className="p-2">{i.templateId}</td>
                  <td className="p-2">{getPlan(i.plan)?.name ?? i.plan}</td>
                  <td className="p-2">{i.phone ?? "—"}</td>
                  <td className="p-2 font-mono">{decryptCode(i.accessCode) ?? "—"}</td>
                  <td className="p-2">{i._count.guests}</td>
                  <td className="p-2">{i._count.wishes}</td>
                  <td className="p-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${badge[i.status]}`}>{i.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-2 font-heading text-lg font-semibold">Promo codes</h2>
        <form action={createPromo} className="mb-3 flex flex-wrap gap-2">
          <input name="code" required placeholder="CODE" className="rounded-lg border px-3 py-1.5 uppercase" />
          <input name="percentOff" required type="number" min={1} max={90} placeholder="% off" className="w-24 rounded-lg border px-3 py-1.5" />
          <input name="maxUses" type="number" min={1} placeholder="Max uses" className="w-28 rounded-lg border px-3 py-1.5" />
          <button className="rounded-lg bg-ink px-4 py-1.5 font-semibold text-white">Save</button>
        </form>
        <ul className="divide-y rounded-xl border bg-white">
          {promos.map((p) => (
            <li key={p.code} className="flex items-center gap-3 p-2">
              <span className="font-mono font-semibold">{p.code}</span>
              <span>{p.percentOff}% off</span>
              <span className="text-muted">
                used {p.used}
                {p.maxUses ? `/${p.maxUses}` : ""}
              </span>
              <form action={togglePromo} className="ml-auto">
                <input type="hidden" name="code" value={p.code} />
                <button className={`rounded px-2 py-1 text-xs ${p.active ? "bg-green-100 text-green-800" : "bg-neutral-200"}`}>{p.active ? "Active" : "Disabled"}</button>
              </form>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-white p-4">
      <p className="text-xs uppercase text-muted">{label}</p>
      <p className="mt-1 font-heading text-2xl font-bold">{value}</p>
    </div>
  );
}
