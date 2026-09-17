import { createClient } from "npm:@supabase/supabase-js@2.57.4";
import Stripe from "npm:stripe@16.12.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const MAX_QUANTITY_PER_LINE = 20;

interface CheckoutItem {
  product_handle: string;
  quantity: number;
  options?: { name: string; value: string }[];
}

interface CheckoutRequestBody {
  items: CheckoutItem[];
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  shipping_address_1: string;
  shipping_address_2?: string;
  shipping_city: string;
  shipping_county: string;
  shipping_postcode: string;
  notes?: string;
  origin?: string;
}

interface VariantRow {
  options: { name: string; value: string }[];
  sku: string;
  price: number;
}

function jsonError(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

/** Only ever redirect back to an origin we control. */
function resolveOrigin(req: Request, requested?: string): string {
  const configured = (Deno.env.get("SITE_URL") ?? "").trim();
  const allowed = new Set<string>();

  for (const candidate of [configured, req.headers.get("origin") ?? ""]) {
    if (!candidate) continue;
    try {
      allowed.add(new URL(candidate).origin);
    } catch {
      // ignore malformed values
    }
  }

  if (requested) {
    try {
      const asOrigin = new URL(requested).origin;
      if (allowed.has(asOrigin)) return asOrigin;
    } catch {
      // ignore malformed values
    }
  }

  if (configured) {
    try {
      return new URL(configured).origin;
    } catch {
      // fall through
    }
  }

  const headerOrigin = req.headers.get("origin");
  if (headerOrigin) {
    try {
      return new URL(headerOrigin).origin;
    } catch {
      // fall through
    }
  }

  return new URL(req.url).origin;
}

function parseJsonColumn<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? (parsed as T[]) : [];
    } catch {
      return [];
    }
  }
  return [];
}

function sameOptions(
  a: { name: string; value: string }[],
  b: { name: string; value: string }[],
): boolean {
  if (a.length !== b.length) return false;
  const norm = (list: { name: string; value: string }[]) =>
    [...list]
      .map((o) => `${String(o.name).trim().toLowerCase()}=${String(o.value).trim().toLowerCase()}`)
      .sort()
      .join("|");
  return norm(a) === norm(b);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      return jsonError("Checkout is unavailable right now.", 503);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2024-12-18.acacia",
      httpClient: Stripe.createFetchHttpClient(),
    });

    const body: CheckoutRequestBody = await req.json();
    const {
      items,
      customer_name,
      customer_email,
      customer_phone,
      shipping_address_1,
      shipping_address_2,
      shipping_city,
      shipping_county,
      shipping_postcode,
      notes,
    } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return jsonError("Your basket is empty.", 400);
    }
    if (items.length > 50) {
      return jsonError("Too many items in this order.", 400);
    }

    const required = {
      customer_name,
      customer_email,
      shipping_address_1,
      shipping_city,
      shipping_county,
      shipping_postcode,
    };
    for (const [, value] of Object.entries(required)) {
      if (typeof value !== "string" || value.trim() === "") {
        return jsonError("Please complete all required delivery details.", 400);
      }
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer_email.trim())) {
      return jsonError("Please enter a valid email address.", 400);
    }

    // Resolve every price from the database. Never trust prices from the browser.
    const handles = [...new Set(items.map((i) => String(i.product_handle ?? "")))];
    if (handles.some((h) => h === "")) {
      return jsonError("One of the items in your basket is invalid.", 400);
    }

    const { data: productRows, error: productError } = await supabase
      .from("products")
      .select("handle, title, price, variant_rows")
      .in("handle", handles);

    if (productError || !productRows) {
      return jsonError("We could not price your order. Please try again.", 500);
    }

    const catalogue = new Map(productRows.map((p) => [p.handle, p]));

    const pricedItems: {
      product_handle: string;
      title: string;
      price: number;
      quantity: number;
      options: { name: string; value: string }[];
    }[] = [];

    for (const item of items) {
      const product = catalogue.get(String(item.product_handle));
      if (!product) {
        return jsonError("One of the items in your basket is no longer available.", 400);
      }

      const quantity = Number(item.quantity);
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY_PER_LINE) {
        return jsonError("Please choose a valid quantity for each item.", 400);
      }

      const requestedOptions = Array.isArray(item.options)
        ? item.options
          .filter((o) => o && typeof o.name === "string" && typeof o.value === "string")
          .map((o) => ({ name: String(o.name), value: String(o.value) }))
        : [];

      const variantRows = parseJsonColumn<VariantRow>(product.variant_rows);

      let unitPrice = Number(product.price);
      if (requestedOptions.length > 0) {
        const match = variantRows.find((row) =>
          sameOptions(Array.isArray(row.options) ? row.options : [], requestedOptions)
        );
        if (!match) {
          return jsonError("The selected options are not available for this product.", 400);
        }
        unitPrice = Number(match.price);
      } else if (variantRows.length === 1 && (variantRows[0].options ?? []).length === 0) {
        unitPrice = Number(variantRows[0].price);
      }

      if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
        return jsonError("We could not price your order. Please try again.", 500);
      }

      pricedItems.push({
        product_handle: product.handle,
        title: product.title,
        price: Number(unitPrice.toFixed(2)),
        quantity,
        options: requestedOptions,
      });
    }

    const subtotal = Number(
      pricedItems.reduce((sum, i) => sum + i.price * i.quantity, 0).toFixed(2),
    );
    const delivery = 0;
    const total = subtotal;

    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .insert({
        customer_name: customer_name.trim(),
        customer_email: customer_email.trim().toLowerCase(),
        customer_phone: customer_phone?.trim() || null,
        shipping_address_1: shipping_address_1.trim(),
        shipping_address_2: shipping_address_2?.trim() || null,
        shipping_city: shipping_city.trim(),
        shipping_county: shipping_county.trim(),
        shipping_postcode: shipping_postcode.trim(),
        notes: notes?.trim() || null,
        items: pricedItems,
        subtotal,
        delivery,
        total,
        status: "pending",
        payment_status: "pending",
      })
      .select("id, order_number")
      .single();

    if (orderError || !orderData) {
      return jsonError("We could not start your checkout. Please try again.", 500);
    }

    const orderId = orderData.id;
    const orderNumber = orderData.order_number;

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = pricedItems.map((item) => {
      const optionText = item.options.length > 0
        ? ` (${item.options.map((o) => o.value).join(" / ")})`
        : "";
      return {
        price_data: {
          currency: "gbp",
          product_data: { name: `${item.title}${optionText}` },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      };
    });

    const origin = resolveOrigin(req, body.origin);

    // Create PaymentIntent for direct on-page checkout (Shopify style)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100),
      currency: "gbp",
      description: `Order ${orderNumber} - Mark Atkins Carpentry`,
      receipt_email: customer_email.trim(),
      metadata: {
        order_id: orderId,
        order_number: orderNumber,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Also create hosted checkout session as fallback
    let sessionUrl: string | null = null;
    let sessionId: string | null = null;
    try {
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: lineItems,
        success_url: `${origin}/order-confirmation?order=${encodeURIComponent(orderNumber)}`,
        cancel_url: `${origin}/checkout?canceled=true`,
        customer_email: customer_email.trim(),
        metadata: { order_id: orderId, order_number: orderNumber },
      });
      sessionUrl = session.url;
      sessionId = session.id;
    } catch (sessionErr) {
      console.warn("Hosted checkout session creation skipped/failed:", sessionErr);
    }

    await supabase
      .from("orders")
      .update({
        stripe_payment_intent: paymentIntent.id,
        ...(sessionId ? { stripe_session_id: sessionId } : {}),
      })
      .eq("id", orderId);

    const publishableKey = Deno.env.get("STRIPE_PUBLISHABLE_KEY") || null;

    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        orderNumber,
        orderId,
        subtotal,
        delivery,
        total,
        publishableKey,
        url: sessionUrl,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("stripe-checkout failed:", err);
    return jsonError("We could not start your checkout. Please try again.", 500);
  }
});
