/**
 * 幂等键生成 — 订单创建/支付使用
 */

export function generateIdempotencyKey(): string {
  return crypto.randomUUID();
}
