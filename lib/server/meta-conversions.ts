
import "server-only";

interface MetaContent {
  id: string;
  quantity: number;
  item_price: number;
}

interface MetaEventParams {
  eventName: string;
  eventId: string;
  eventSourceUrl: string;
  fbp?: string | null;
  fbc?: string | null;
  clientIp?: string | null;
  userAgent?: string | null;
  value?: number;
  currency?: string;
  productIds?: string[];
  contents?: MetaContent[];
  orderId?: string;
}

export async function sendMetaEvent(data: MetaEventParams) {
  const pixelId = process.env.META_PIXEL_ID;
  const token = process.env.META_ACCESS_TOKEN;
  const version = process.env.META_GRAPH_API_VERSION;

  if (!pixelId || !token || !version) {
    throw new Error("META_CONFIGURATION_MISSING");
  }

  const userData: Record<string, string> = {};

  if (data.fbp) userData.fbp = data.fbp;
  if (data.fbc) userData.fbc = data.fbc;

  if (data.clientIp) {
    userData.client_ip_address = data.clientIp;
  }

  if (data.userAgent) {
    userData.client_user_agent = data.userAgent;
  }

  if (Object.keys(userData).length === 0) {
    throw new Error("META_USER_DATA_MISSING");
  }

  const event = {
    event_name: data.eventName,
    event_time: Math.floor(Date.now() / 1000),
    event_id: data.eventId,
    action_source: "website",
    event_source_url: data.eventSourceUrl,
    user_data: userData,
    custom_data: {
      ...(data.value !== undefined
        ? { value: data.value }
        : {}),
      ...(data.currency
        ? { currency: data.currency }
        : {}),
      ...(data.productIds
        ? {
            content_ids: data.productIds,
            content_type: "product",
          }
        : {}),
      ...(data.contents
        ? { contents: data.contents }
        : {}),
      ...(data.orderId
        ? { order_id: data.orderId }
        : {}),
    },
  };

  const response = await fetch(
    `https://graph.facebook.com/${version}/${pixelId}/events?access_token=${encodeURIComponent(token)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: [event],
      }),
      cache: "no-store",
    }
  );

  const result = await response.json();

  if (!response.ok) {
    console.error("Meta CAPI error:", result);
    throw new Error("META_CAPI_FAILED");
  }

  return result;
}
