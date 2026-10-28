"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isBuiltinTemplate, listTemplates, templateConfigSchema, templateMetaSchema, type TemplateStatus } from "@/lib/templates";

async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin");
}

function refresh(id?: string) {
  revalidatePath("/");
  revalidatePath("/admin/templates");
  if (id) revalidatePath(`/admin/templates/${id}`);
}

export type SaveResult = { ok: true; id: string } | { ok: false; error: string };

export async function saveTemplate(input: { isNew: boolean; meta: unknown; config: unknown; status: TemplateStatus; sortOrder?: number }): Promise<SaveResult> {
  await requireAdmin();
  const meta = templateMetaSchema.safeParse(input.meta);
  if (!meta.success) return { ok: false, error: meta.error.issues[0]?.message ?? "Invalid details" };
  const config = templateConfigSchema.safeParse(input.config);
  if (!config.success) {
    const issue = config.error.issues[0];
    return { ok: false, error: `${issue?.path.join(".") || "template"}: ${issue?.message}` };
  }
  const { id, name, description, eventTypes } = meta.data;
  if (isBuiltinTemplate(id)) return { ok: false, error: "That id belongs to a built-in template. Choose another id." };

  const existing = await prisma.template.findUnique({ where: { id } });
  if (input.isNew && existing) return { ok: false, error: "A template with this id already exists." };
  if (!input.isNew && !existing) return { ok: false, error: "Template not found." };

  const data = {
    name,
    description,
    eventTypes,
    config: config.data as unknown as Prisma.InputJsonValue,
    status: input.status,
    sortOrder: input.sortOrder ?? existing?.sortOrder ?? 0,
  };
  await prisma.template.upsert({ where: { id }, update: data, create: { id, ...data } });
  refresh(id);
  return { ok: true, id };
}

export async function setTemplateStatus(form: FormData) {
  await requireAdmin();
  const id = String(form.get("id"));
  const status = form.get("status") === "PUBLISHED" ? "PUBLISHED" : "DRAFT";
  await prisma.template.updateMany({ where: { id }, data: { status } });
  refresh(id);
}

export async function duplicateTemplate(form: FormData) {
  await requireAdmin();
  const sourceId = String(form.get("id"));
  const source = (await listTemplates({ includeDrafts: true })).find((t) => t.id === sourceId);
  if (!source) return;

  let id = `${sourceId}-copy`.slice(0, 36);
  for (let n = 2; await prisma.template.findUnique({ where: { id } }); n++) id = `${sourceId}-copy-${n}`.slice(0, 40);

  const { theme, cover, coverImage, opening, particles, sections, swatch } = source;
  await prisma.template.create({
    data: {
      id,
      name: `${source.name} (copy)`.slice(0, 60),
      description: source.description,
      eventTypes: source.eventTypes,
      config: { theme, cover, coverImage, opening, particles, sections, swatch } as unknown as Prisma.InputJsonValue,
      status: "DRAFT",
    },
  });
  refresh();
  redirect(`/admin/templates/${id}`);
}

export async function deleteTemplate(_prev: string | null, form: FormData): Promise<string | null> {
  await requireAdmin();
  const id = String(form.get("id"));
  const inUse = await prisma.invitation.count({ where: { templateId: id } });
  if (inUse > 0) return `In use by ${inUse} invitation${inUse > 1 ? "s" : ""} — unpublish it instead.`;
  await prisma.template.deleteMany({ where: { id } });
  refresh();
  return null;
}
