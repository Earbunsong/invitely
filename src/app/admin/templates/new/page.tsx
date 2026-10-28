import { isAdmin } from "@/lib/auth";
import { getTemplate, PARTY_SECTIONS } from "@/templates";
import { AdminLoginForm } from "../../LoginForm";
import { TemplateForm } from "../TemplateForm";

export const metadata = { title: "New template · Admin", robots: { index: false } };

export default async function NewTemplatePage() {
  if (!(await isAdmin())) return <AdminLoginForm />;
  // Start from a clean, neutral look; the admin changes colours, cover and sections from here.
  const base = getTemplate("modern-minimal");
  return (
    <TemplateForm
      isNew
      initial={{
        meta: { id: "", name: "", description: "", eventTypes: ["birthday"] },
        config: {
          theme: base.theme,
          cover: "image",
          opening: "envelope",
          particles: "confetti",
          sections: PARTY_SECTIONS,
          swatch: base.swatch,
        },
        status: "DRAFT",
      }}
    />
  );
}
