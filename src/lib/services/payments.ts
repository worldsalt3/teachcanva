/**
 * Payment provider abstraction.
 *
 * The stub provider resolves a successful charge after a short delay so the
 * booking + wallet flows run end-to-end. The real Monnify provider is
 * returned by {@link getPaymentProvider} once an API key + contract code are
 * set — no calling code needs to change.
 */
import { integrations, isMonnifyEnabled } from "./config";

export interface PaymentRequest {
  /** Amount in Naira (major units). */
  amount: number;
  email: string;
  label?: string;
  reference?: string;
  metadata?: Record<string, unknown>;
  /**
   * When set, the server-side verify step credits this wallet with the
   * Monnify-confirmed amount (never a client figure).
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

// ─── Monnify checkout provider ──────────────────────────────────────────────────
interface MonnifyCompleteResponse {
  paymentReference: string;
  transactionReference: string;
  amountPaid: number | string;
  /** "PAID" | "OVERPAID" | "PARTIALLY_PAID" | "PENDING" | "FAILED" … */
  paymentStatus: string;
  paidOn?: string;
}
interface MonnifyInitializeOptions {
  amount: number; // Naira (major units)
  currency: string;
  reference: string;
  customerFullName: string;
  customerEmail: string;
  apiKey: string;
  contractCode: string;
  paymentDescription?: string;
  metadata?: Record<string, unknown>;
  onComplete?: (response: MonnifyCompleteResponse) => void;
  onClose?: (data: unknown) => void;
}
interface MonnifySdk {
  initialize(options: MonnifyInitializeOptions): void;
}

let monnifyScript: Promise<MonnifySdk> | null = null;

function loadMonnify(): Promise<MonnifySdk> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Monnify is browser-only."));
  }
  const existing = (window as unknown as { MonnifySDK?: MonnifySdk })
    .MonnifySDK;
  if (existing) return Promise.resolve(existing);

  monnifyScript ??= new Promise<MonnifySdk>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://sdk.monnify.com/plugin/monnify.js";
    script.async = true;
    script.onload = () => {
      const sdk = (window as unknown as { MonnifySDK?: MonnifySdk }).MonnifySDK;
      if (sdk) resolve(sdk);
      else reject(new Error("Monnify failed to load."));
    };
    script.onerror = () => reject(new Error("Monnify script failed to load."));
    document.head.appendChild(script);
  });
  return monnifyScript;
}

/**
 * Real charge via the Monnify checkout modal (card, transfer, USSD). Resolves
 * to success once the charge completes (and kicks off a server-side verify),
 * or `failed` if the modal is dismissed. Drop-in for the stub — no calling
 * code changes.
 */
class MonnifyProvider implements PaymentProvider {
  readonly name = "monnify";
  readonly live = true;

  constructor(
    private readonly apiKey: string,
    private readonly contractCode: string,
  ) {}

  async charge(req: PaymentRequest): Promise<PaymentResult> {
    const reference = req.reference ?? makePaymentReference();
    const sdk = await loadMonnify();

    return new Promise<PaymentResult>((resolve) => {
      let settled = false;
      const settle = (result: PaymentResult) => {
        if (settled) return;
        settled = true;
        resolve(result);
      };

      sdk.initialize({
        amount: req.amount,
        currency: "NGN",
        reference,
        customerFullName: req.label ?? "TeachCanvas user",
        customerEmail: req.email,
        apiKey: this.apiKey,
        contractCode: this.contractCode,
        paymentDescription: req.label ?? "TeachCanvas payment",
        metadata: req.metadata,
        onComplete: (response) => {
          const paid =
            response.paymentStatus === "PAID" ||
            response.paymentStatus === "OVERPAID";
          if (!paid) {
            settle({
              reference,
              status: "failed",
              amount: req.amount,
              channel: "card",
              paidAt: new Date().toISOString(),
            });
            return;
          }
          // Confirm server-side; when creditRole is set the wallet is
          // credited there, so wait for the verify round-trip first.
          const query = new URLSearchParams({ reference });
          if (req.creditRole) query.set("credit", req.creditRole);
          void (async () => {
            try {
              await fetch(`/api/payments/verify?${query.toString()}`);
            } catch {
              // Verified lazily on next load; charge itself succeeded.
            }
            settle({
              reference,
              status: "success",
              amount: req.amount,
              channel: "card",
              paidAt: response.paidOn ?? new Date().toISOString(),
            });
          })();
        },
        onClose: () => {
          settle({
            reference,
            status: "failed",
            amount: req.amount,
            channel: "card",
            paidAt: new Date().toISOString(),
          });
        },
      });
    });
  }
}

export function getPaymentProvider(): PaymentProvider {
  if (provider) return provider;
  if (isMonnifyEnabled) {
    provider = new MonnifyProvider(
      integrations.monnify.apiKey,
      integrations.monnify.contractCode,
    );
  }
  provider ??= new StubPaymentProvider();
  return provider;
}

export function processPayment(req: PaymentRequest): Promise<PaymentResult> {
  return getPaymentProvider().charge(req);
}
