import { redirect } from "next/navigation";
import { CreateFlow } from "@/components/checkout/CreateFlow";
import { getPlan, MIN_DAYS_BEFORE_EVENT } from "@/lib/plans";
import { isMockPayments, isPaywayConfigured } from "@/lib/payway";

export const metadata = { title: "Create your invitation" };

export default async function CreatePage({ searchParams }: { searchParams: Promise<{ plan?: string }> }) {
  const { plan: planId } = await searchParams;
  const plan = getPlan(planId);
  if (!plan) redirect("/#pricing");
  const minDate = new Date(Date.now() + MIN_DAYS_BEFORE_EVENT * 86400000 + 7 * 3600000).toISOString().slice(0, 10);
  return <CreateFlow plan={plan} minDate={minDate} paymentsMode={isPaywayConfigured() ? "live" : isMockPayments() ? "mock" : "off"} />;
}
