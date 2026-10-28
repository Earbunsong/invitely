import Link from "next/link";
import { isAdmin } from "@/lib/auth";
import { EVENT_LABELS } from "@/lib/plans";
import { prisma } from "@/lib/prisma";
import { listTemplates } from "@/lib/templates";
import { templateThumb } from "@/templates";
import { AdminLoginForm } from "../LoginForm";
import { duplicateTemplate, setTemplateStatus } from "./actions";
import { DeleteTemplateButton } from "./DeleteTemplateButton";

export const metadata = { title: "Templates · Admin", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminTemplatesPage() {
  if (!(await isAdmin())) return <AdminLoginForm />;

  const [templates, usage] = await Promise.all([
    listTemplates({ includeDrafts: true }),
    prisma.invitation.groupBy({ by: ["templateId"], _count: true }),
  ]);
  const used = new Map(usage.map((u) => [u.templateId, u._count]));

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-6 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/admin" className="text-muted underline">
            ← Admin
          </Link>
          <h1 className="mt-1 font-heading text-2xl font-bold">Templates</h1>
          <p className="text-muted">Built-in templates come from code and can be duplicated. Your templates go live for customers as soon as you publish them.</p>
        </div>
        <Link href="/admin/templates/new" className="btn-coral rounded-full px-5 py-2.5 font-heading font-semibold text-white">
          + New template
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((t) => (
          <div key={t.id} className="overflow-hidden rounded-2xl border bg-white">
            <div className="flex h-36 items-end p-3" style={{ background: templateThumb(t) }}>
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${t.source === "builtin" ? "bg-white/90 text-ink" : t.status === "PUBLISHED" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>
                {t.source === "builtin" ? "Built-in" : t.status === "PUBLISHED" ? "Published" : "Draft"}
              </span>
            </div>
            <div className="space-y-2 p-4">
              <div>
                <p className="font-heading font-semibold">{t.name}</p>
                <p className="font-mono text-[11px] text-muted">{t.id}</p>
              </div>
              <p className="text-xs text-muted">{t.eventTypes.map((e) => `${EVENT_LABELS[e].emoji} ${EVENT_LABELS[e].en}`).join(" · ")}</p>
              <p className="text-xs text-muted">Used by {used.get(t.id) ?? 0} invitation(s)</p>
              <div className="flex flex-wrap gap-2 pt-1">
                {t.source === "custom" && (
                  <>
                    <Link href={`/admin/templates/${t.id}`} className="rounded-lg bg-ink px-3 py-1.5 text-xs font-semibold text-white">
                      Edit
                    </Link>
                    <form action={setTemplateStatus}>
                      <input type="hidden" name="id" value={t.id} />
                      <input type="hidden" name="status" value={t.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED"} />
                      <button className="rounded-lg bg-neutral-100 px-3 py-1.5 text-xs font-semibold">{t.status === "PUBLISHED" ? "Unpublish" : "Publish"}</button>
                    </form>
                  </>
                )}
                <form action={duplicateTemplate}>
                  <input type="hidden" name="id" value={t.id} />
                  <button className="rounded-lg bg-neutral-100 px-3 py-1.5 text-xs font-semibold">Duplicate</button>
                </form>
                {t.source === "custom" && <DeleteTemplateButton id={t.id} />}
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
