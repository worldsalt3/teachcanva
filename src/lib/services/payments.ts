/**
 * Payment provider abstraction.
 *
 * The stub provider resolves a successful charge after a short delay so the
 * booking + wallet flows run end-to-end. A real Paystack provider can be
 * dropped in behind {@link getPaymentProvider} once a public key is set — no
 * calling code needs to change.
 */
import { isPaystackEnabled } from "./config";

export interface PaymentRequest {
  /** Amount in Naira (major units). */
  amount: number;
  email: string;
  label?: string;
  reference?: string;
  metadata?: Record<string, unknown>;
}

export interface PaymentResult {
  reference: string;
  status: "success" | "failed";
  amount: number;
  channel: string;
  paidAt: string;
}

export interface PaymentProvider {
  readonly name: string;
  readonly live: boolean;
  charge(req: PaymentRequest): Promise<PaymentResult>;
}

export function makePaymentReference(prefix = "TCH"): string {
  const rand = Math.random().toString(36).slice(2, 10).toUpperCase();
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${rand}`;
}

class StubPaymentProvider implements PaymentProvider {
  readonly name = "stub";
  readonly live = false;

  charge(req: PaymentRequest): Promise<PaymentResult> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          reference: req.reference ?? makePaymentReference(),
          status: "success",
          amount: req.amount,
          channel: "card",
          paidAt: new Date().toISOString(),
        });
      }, 1200);
    });
  }
}

let provider: PaymentProvider | null = null;

export function getPaymentProvider(): PaymentProvider {
  if (provider) return provider;
  // When Paystack keys are present, swap StubPaymentProvider for the real
  // popup-based provider here. The interface stays identical.
  if (isPaystackEnabled) {
    // provider = new PaystackProvider(integrations.paystack.publicKey);
  }
  provider ??= new StubPaymentProvider();
  return provider;
}

export function processPayment(req: PaymentRequest): Promise<PaymentResult> {
  return getPaymentProvider().charge(req);
}
