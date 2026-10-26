"use client";

import { createContext, useContext } from "react";
import type { InvitationData, Locale } from "@/lib/invitation";
import type { Plan } from "@/lib/plans";
import type { Template } from "@/templates";

export type InvitationCtx = {
  data: InvitationData;
  template: Template;
  locale: Locale;
  setLocale: (l: Locale) => void;
  features: Plan["features"];
  slug: string;
  guestName?: string;
  guestToken?: string;
  /** Editor/landing preview: forms are disabled and nothing is written. */
  preview: boolean;
};

export const Ctx = createContext<InvitationCtx | null>(null);

export function useInvitation() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useInvitation must be used inside <InvitationRenderer>");
  return v;
}

/** Text in the template's display font for the current language. */
export function displayClass(template: Template, locale: Locale) {
  return locale === "km" ? `iv-km-${template.theme.kmDisplay}` : `iv-display-${template.theme.display}`;
}
