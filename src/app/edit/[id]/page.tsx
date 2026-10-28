import { redirect } from "next/navigation";
import { Editor } from "@/components/editor/Editor";
import { isAdmin } from "@/lib/auth";
import { parseInvitationData } from "@/lib/invitation";
import { ownedInvitation } from "@/lib/owner";
import { getPlan } from "@/lib/plans";
import { listTemplates, pickTemplate } from "@/lib/templates";

export const metadata = { title: "Edit invitation" };

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const inv = await ownedInvitation(id);
  if (!inv) redirect("/login");
  const plan = getPlan(inv.plan);
  if (!plan) redirect("/login");
  const data = parseInvitationData(inv.data);
  const templates = await listTemplates({ eventType: data.eventType });
  return (
    <Editor
      invitationId={inv.id}
      slug={inv.slug}
      initialStatus={inv.status}
      initialData={data}
      // If the saved template was unpublished or removed, start from the default for this event type.
      initialTemplateId={pickTemplate(inv.templateId, data.eventType, templates).id}
      plan={plan}
      templates={templates}
      appUrl={process.env.APP_URL || ""}
      admin={await isAdmin()}
    />
  );
}
