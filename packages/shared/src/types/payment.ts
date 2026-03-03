/**
 * 支付相关类型 — 镜像后端 PaymentInfo / PaymentStatusResult
 */

export interface PaymentInfo {
  paymentId: string;
  method: string;
  amount: string;
  payUrl: string;
}

export interface PaymentRecord {
  id: string;
  method: string;
  amount: string;
  status: string;
  transactionId: string | null;
  createdAt: string;
}

export interface PaymentStatusResult {
  orderId: string;
  orderStatus: string;
  payments: PaymentRecord[];
}
