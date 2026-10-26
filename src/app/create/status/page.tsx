import { OrderStatus } from "@/components/checkout/OrderStatus";

export const metadata = { title: "Payment status" };

export default async function StatusPage({ searchParams }: { searchParams: Promise<{ order?: string; cancelled?: string }> }) {
  const { order, cancelled } = await searchParams;
  return <OrderStatus orderId={order ?? ""} cancelled={cancelled === "1"} />;
}
