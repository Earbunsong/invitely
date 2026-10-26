import { redirect } from "next/navigation";
import { Editor } from "@/components/editor/Editor";
import { parseInvitationData } from "@/lib/invitation";
import { ownedInvitation } from "@/lib/owner";
import { getPlan } from "@/lib/plans";
import { templatesFor } from "@/templates";

export const metadata = { title: "Edit invitation" };

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const inv = await ownedInvitation(id);
  if (!inv) redirect("/login");
  const plan = getPlan(inv.plan);
  if (!plan) redirect("/login");
  const data = parseInvitationData(inv.data);
  return (
    <Editor
      invitationId={inv.id}
      slug={inv.slug}
      initialStatus={inv.status}
      initialData={data}
      initialTemplateId={inv.templateId}
      plan={plan}
      templateIds={templatesFor(data.eventType).map((t) => t.id)}
      appUrl={process.env.APP_URL || ""}
    />
  );
}
