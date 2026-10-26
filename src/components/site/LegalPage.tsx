import { SiteFooter } from "./SiteFooter";
import { SiteNav } from "./SiteNav";

export function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <>
      <SiteNav />
      <main className="mx-auto max-w-3xl px-4 py-12">
        <p className="mb-6 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">Template text — replace with your own terms reviewed for your business before launch.</p>
        <h1 className="font-heading text-3xl font-bold">{title}</h1>
        <div className="mt-6 space-y-4 leading-relaxed text-ink/80 [&_h2]:mt-8 [&_h2]:font-heading [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-ink">{children}</div>
      </main>
      <SiteFooter />
    </>
  );
}
