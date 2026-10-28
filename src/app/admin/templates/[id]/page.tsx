import { notFound } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rowToTemplate } from "@/lib/templates";
import { AdminLoginForm } from "../../LoginForm";
import { TemplateForm } from "../TemplateForm";

export const metadata = { title: "Edit template · Admin", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function EditTemplatePage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return <AdminLoginForm />;
  const { id } = await params;
  const row = await prisma.template.findUnique({ where: { id } });
  const t = row && rowToTemplate(row);
  if (!t) notFound();
  const { theme, cover, coverImage, opening, particles, sections, swatch } = t;
  return (
    <TemplateForm
      isNew={false}
      initial={{
        meta: { id: t.id, name: t.name, description: t.description, eventTypes: t.eventTypes },
        config: { theme, cover, coverImage, opening, particles, sections, swatch },
        status: t.status,
      }}
    />
  );
}
