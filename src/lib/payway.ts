import crypto from "node:crypto";

/**
 * ABA PayWay e-commerce checkout (Purchase API + Check Transaction API).
 *
 * Every request is signed with HMAC-SHA512 over the field values concatenated in the
 * order PayWay documents, keyed with the merchant API key, base64-encoded.
 * IMPORTANT: confirm PURCHASE_HASH_ORDER against the docs PayWay sends with your merchant
 * account (https://www.payway.com.kh/developers/) — a wrong order is rejected without detail.
 */

export const PURCHASE_HASH_ORDER = [
  "req_time",
  "merchant_id",
  "tran_id",
  "amount",
  "items",
  "shipping",
  "firstname",
  "lastname",
  "email",
  "phone",
  "type",
  "payment_option",
  "return_url",
  "cancel_url",
  "continue_success_url",
  "return_deeplink",
  "currency",
  "custom_fields",
  "return_params",
  "payout",
  "lifetime",
  "additional_params",
  "google_pay_token",
  "skip_success_page",
] as const;

type PurchaseField = (typeof PURCHASE_HASH_ORDER)[number];
export type PurchaseFields = Partial<Record<PurchaseField, string>>;

export type PaymentOption = "abapay_khqr" | "cards" | "abapay_khqr_deeplink";

function config() {
  return {
    baseUrl: (process.env.PAYWAY_BASE_URL || "https://checkout-sandbox.payway.com.kh").replace(/\/$/, ""),
    merchantId: process.env.PAYWAY_MERCHANT_ID || "",
    apiKey: process.env.PAYWAY_API_KEY || "",
  };
}

export function isPaywayConfigured() {
  const c = config();
  return Boolean(c.merchantId && c.apiKey);
}

/** Simulated payments for local development only — never in production. */
export function isMockPayments() {
  return !isPaywayConfigured() && process.env.PAYWAY_MOCK === "1" && process.env.NODE_ENV !== "production";
}

/** UTC timestamp in the YYYYMMDDHHmmss format PayWay expects. */
export function reqTime(now = new Date()): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${now.getUTCFullYear()}${p(now.getUTCMonth() + 1)}${p(now.getUTCDate())}${p(now.getUTCHours())}${p(now.getUTCMinutes())}${p(now.getUTCSeconds())}`;
}

export function sign(values: string[], apiKey = config().apiKey): string {
  return crypto.createHmac("sha512", apiKey).update(values.join("")).digest("base64");
}

export function purchaseHash(fields: PurchaseFields, apiKey?: string): string {
  return sign(
    PURCHASE_HASH_ORDER.map((k) => fields[k] ?? ""),
    apiKey,
  );
}

const b64 = (s: string) => Buffer.from(s, "utf8").toString("base64");

/** Builds the signed form that the browser POSTs to PayWay's hosted checkout. */
export function buildPurchase(input: {
  tranId: string;
  amount: string;
  itemName: string;
  phone: string;
  paymentOption: PaymentOption;
  appUrl: string;
  orderId: string;
}) {
  const c = config();
  const fields: PurchaseFields = {
    req_time: reqTime(),
    merchant_id: c.merchantId,
    tran_id: input.tranId,
    amount: input.amount,
    items: b64(JSON.stringify([{ name: input.itemName, quantity: 1, price: Number(input.amount) }])),
    phone: input.phone,
    type: "purchase",
    payment_option: input.paymentOption,
    return_url: b64(`${input.appUrl}/api/payway/callback`),
    cancel_url: `${input.appUrl}/create/status?order=${input.orderId}&cancelled=1`,
    continue_success_url: `${input.appUrl}/create/status?order=${input.orderId}`,
    currency: "USD",
  };
  // Drop empty optional fields so the posted form and the hash agree.
  const posted = Object.fromEntries(Object.entries(fields).filter(([, v]) => v !== undefined && v !== "")) as PurchaseFields;
  return {
    action: `${c.baseUrl}/api/payment-gateway/v1/payments/purchase`,
    fields: { ...posted, hash: purchaseHash(posted, c.apiKey) },
  };
}

export type TransactionCheck = {
  approved: boolean;
  amount?: number;
  apv?: string;
  status?: string;
  raw: unknown;
};

/** Server-to-server status lookup. Only this result is trusted to mark an order paid. */
export async function checkTransaction(tranId: string): Promise<TransactionCheck> {
  const c = config();
  const req_time = reqTime();
  const res = await fetch(`${c.baseUrl}/api/payment-gateway/v1/payments/check-transaction-2`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ req_time, merchant_id: c.merchantId, tran_id: tranId, hash: sign([req_time, c.merchantId, tranId], c.apiKey) }),
    cache: "no-store",
  });
  const raw = await res.json().catch(() => null);
  const data = (raw as { data?: Record<string, unknown> } | null)?.data ?? {};
  const status = String(data.payment_status ?? "");
  const amount = Number(data.total_amount ?? data.original_amount ?? data.payment_amount);
  return {
    approved: res.ok && (status === "APPROVED" || data.payment_status_code === 0),
    amount: Number.isFinite(amount) ? amount : undefined,
    apv: data.apv ? String(data.apv) : undefined,
    status,
    raw,
  };
}

/** Unique, PayWay-safe transaction id (max 20 chars, alphanumeric). */
export function newTranId(): string {
  const time = Date.now().toString(36).toUpperCase();
  const rand = crypto.randomBytes(5).toString("hex").toUpperCase();
  return `IV${time}${rand}`.slice(0, 20);
}
