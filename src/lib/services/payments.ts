/**
 * Payment provider abstraction.
 *
 * The stub provider resolves a successful charge after a short delay so the
 * booking + wallet flows run end-to-end. A real Paystack provider can be
 * dropped in behind {@link getPaymentProvider} once a public key is set — no
 * calling code needs to change.
 */
import { integrations, isPaystackEnabled } from "./config";

export interface PaymentRequest {
  /** Amount in Naira (major units). */
  amount: number;
  email: string;
  label?: string;
  reference?: string;
  metadata?: Record<string, unknown>;
  /**
   * When set, the server-side verify step credits this wallet with the
   * Paystack-confirmed amount (never a client figure).
   */
  creditRole?: "student" | "teacher";
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

// ─── Paystack Inline provider ────────────────────────────────────────────────
interface PaystackHandler {
  openIframe(): void;
}
interface PaystackSetupOptions {
  key: string;
  email: string;
  amount: number; // kobo
  ref?: string;
  metadata?: Record<string, unknown>;
  callback?: (response: { reference: string }) => void;
  onClose?: () => void;
}
interface PaystackPop {
  setup(options: PaystackSetupOptions): PaystackHandler;
}

let paystackScript: Promise<PaystackPop> | null = null;

function loadPaystack(): Promise<PaystackPop> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Paystack is browser-only."));
  }
  const existing = (window as unknown as { PaystackPop?: PaystackPop })
    .PaystackPop;
  if (existing) return Promise.resolve(existing);

  paystackScript ??= new Promise<PaystackPop>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.onload = () => {
      const pop = (window as unknown as { PaystackPop?: PaystackPop })
        .PaystackPop;
      if (pop) resolve(pop);
      else reject(new Error("Paystack failed to load."));
    };
    script.onerror = () => reject(new Error("Paystack script failed to load."));
    document.head.appendChild(script);
  });
  return paystackScript;
}

/**
 * Real card charge via the Paystack Inline popup. Resolves to success once the
 * charge completes (and kicks off a server-side verify), or `failed` if the
 * popup is dismissed. Drop-in for the stub — no calling code changes.
 */
class PaystackProvider implements PaymentProvider {
  readonly name = "paystack";
  readonly live = true;

  constructor(private readonly publicKey: string) {}

  async charge(req: PaymentRequest): Promise<PaymentResult> {
    const reference = req.reference ?? makePaymentReference();
    const pop = await loadPaystack();

    return new Promise<PaymentResult>((resolve) => {
      const handler = pop.setup({
        key: this.publicKey,
        email: req.email,
        amount: Math.round(req.amount * 100),
        ref: reference,
        metadata: req.metadata,
        callback: (response) => {
          // Confirm server-side; when creditRole is set the wallet is credited
          // there, so wait for the verify round-trip before resolving.
          const query = new URLSearchParams({ reference: response.reference });
          if (req.creditRole) query.set("credit", req.creditRole);
          void (async () => {
            try {
              await fetch(`/api/payments/verify?${query.toString()}`);
            } catch {
              // Verified lazily on next load; charge itself succeeded.
            }
            resolve({
              reference: response.reference,
              status: "success",
              amount: req.amount,
              channel: "card",
              paidAt: new Date().toISOString(),
            });
          })();
        },
        onClose: () => {
          resolve({
            reference,
            status: "failed",
            amount: req.amount,
            channel: "card",
            paidAt: new Date().toISOString(),
          });
        },
      });
      handler.openIframe();
    });
  }
}

export function getPaymentProvider(): PaymentProvider {
  if (provider) return provider;
  if (isPaystackEnabled) {
    provider = new PaystackProvider(integrations.paystack.publicKey);
  }
  provider ??= new StubPaymentProvider();
  return provider;
}

export function processPayment(req: PaymentRequest): Promise<PaymentResult> {
  return getPaymentProvider().charge(req);
}
