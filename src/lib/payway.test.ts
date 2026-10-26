import crypto from "node:crypto";
import { beforeEach, describe, expect, it } from "vitest";
import { buildPurchase, newTranId, purchaseHash, PURCHASE_HASH_ORDER, reqTime, sign } from "./payway";

const KEY = "test-api-key";

beforeEach(() => {
  process.env.PAYWAY_MERCHANT_ID = "ec000002";
  process.env.PAYWAY_API_KEY = KEY;
  process.env.PAYWAY_BASE_URL = "https://checkout-sandbox.payway.com.kh";
});

describe("reqTime", () => {
  it("formats UTC as YYYYMMDDHHmmss", () => {
    expect(reqTime(new Date(Date.UTC(2026, 0, 5, 3, 4, 9)))).toBe("20260105030409");
  });
});

describe("sign", () => {
  it("is base64 HMAC-SHA512 of the concatenated values", () => {
    const expected = crypto.createHmac("sha512", KEY).update("abc123").digest("base64");
    expect(sign(["abc", "123"], KEY)).toBe(expected);
  });
});

describe("purchaseHash", () => {
  it("concatenates fields in PayWay's documented order and skips missing ones", () => {
    const fields = { currency: "USD", req_time: "20260101000000", amount: "49.99", merchant_id: "m", tran_id: "t" };
    // Order: req_time, merchant_id, tran_id, amount, ..., currency
    const expected = sign(["20260101000000", "m", "t", "49.99", "USD"], KEY);
    expect(purchaseHash(fields, KEY)).toBe(expected);
    expect(PURCHASE_HASH_ORDER.indexOf("amount")).toBeLessThan(PURCHASE_HASH_ORDER.indexOf("currency"));
  });
});

describe("buildPurchase", () => {
  it("returns the sandbox purchase endpoint with a hash matching the posted fields", () => {
    const form = buildPurchase({
      tranId: "IVTEST123",
      amount: "29.99",
      itemName: "Standard",
      phone: "85512345678",
      paymentOption: "abapay_khqr",
      appUrl: "https://example.com",
      orderId: "order1",
    });
    expect(form.action).toBe("https://checkout-sandbox.payway.com.kh/api/payment-gateway/v1/payments/purchase");
    const { hash, ...posted } = form.fields;
    expect(hash).toBe(purchaseHash(posted, KEY));
    expect(Buffer.from(posted.return_url!, "base64").toString()).toBe("https://example.com/api/payway/callback");
    expect(JSON.parse(Buffer.from(posted.items!, "base64").toString())).toEqual([{ name: "Standard", quantity: 1, price: 29.99 }]);
    // Every posted field must be part of the hash order (otherwise PayWay rejects the request).
    for (const k of Object.keys(posted)) expect(PURCHASE_HASH_ORDER).toContain(k);
  });
});

describe("newTranId", () => {
  it("is unique, alphanumeric and at most 20 chars", () => {
    const ids = new Set(Array.from({ length: 500 }, newTranId));
    expect(ids.size).toBe(500);
    for (const id of ids) expect(id).toMatch(/^[A-Z0-9]{1,20}$/);
  });
});
