/**
 * WhatsApp Helper Service powered by OpenWA Gateway on Raspberry Pi
 */

const OPENWA_SERVER_URL = process.env.OPENWA_SERVER_URL || 'https://probably-submitting-metadata-bathrooms.trycloudflare.com';
const OPENWA_API_KEY = process.env.OPENWA_API_KEY || 'owa_k1_3ddf3d2a10037d7a3ec4be29e97e20a63fe60dc9d91ae0025644dadcf853009e';
const CONFIGURED_SESSION_ID = process.env.OPENWA_SESSION_ID || 'fccd62da-32e3-4779-bd48-ca4958625965';

let cachedSessionId: string | null = null;

/**
 * Format phone number to standard WhatsApp Chat ID (e.g. 919876543210@c.us)
 */
export function formatWhatsAppId(phone: string): string {
  let cleaned = String(phone).replace(/\D/g, '');
  
  // If 10-digit Indian number, prepend country code '91'
  if (cleaned.length === 10) {
    cleaned = `91${cleaned}`;
  }
  
  // Return format expected by OpenWA
  return `${cleaned}@c.us`;
}

/**
 * Automatically resolve the currently active WhatsApp session ID
 */
async function resolveSessionId(baseUrl: string, apiKey: string): Promise<string> {
  // If we already have a confirmed working session ID, use it
  if (cachedSessionId) return cachedSessionId;

  // If a valid UUID was provided in env, use that as primary candidate
  if (CONFIGURED_SESSION_ID && CONFIGURED_SESSION_ID !== 'default') {
    cachedSessionId = CONFIGURED_SESSION_ID;
    return CONFIGURED_SESSION_ID;
  }

  // Otherwise query OpenWA for the active ready session
  try {
    const res = await fetch(`${baseUrl}/api/sessions`, {
      headers: { 'X-Api-Key': apiKey },
      cache: 'no-store'
    });
    if (res.ok) {
      const list = await res.json();
      const readySession = list.find((s: any) => s.status === 'ready') || list[0];
      if (readySession?.id) {
        cachedSessionId = readySession.id;
        return readySession.id;
      }
    }
  } catch (err) {
    console.warn('[OpenWA] Could not query active session list, using fallback:', err);
  }

  return 'fccd62da-32e3-4779-bd48-ca4958625965';
}

/**
 * Send a WhatsApp text message using OpenWA REST API
 */
export async function sendWhatsAppMessage(phone: string, message: string): Promise<boolean> {
  try {
    const chatId = formatWhatsAppId(phone);
    const cleanBaseUrl = OPENWA_SERVER_URL.replace(/\/+$/, '');
    const sessionId = await resolveSessionId(cleanBaseUrl, OPENWA_API_KEY);
    const endpoint = `${cleanBaseUrl}/api/sessions/${sessionId}/messages/send-text`;
    
    console.log(`[OpenWA] Sending message to ${chatId} via session ${sessionId}...`);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': OPENWA_API_KEY,
      },
      body: JSON.stringify({
        chatId,
        text: message
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('[OpenWA Error]:', response.status, errText);

      // If the cached session failed, clear cache so next call re-fetches
      cachedSessionId = null;
      return false;
    }

    const data = await response.json();
    console.log(`[OpenWA Success] Message sent to ${chatId}:`, data.messageId || data.id || 'OK');
    return true;
  } catch (error) {
    console.error('[OpenWA Connection Failed]: Is OpenWA server running and reachable?', error);
    cachedSessionId = null;
    return false;
  }
}

/**
 * Helper: Send Order Confirmation WhatsApp
 */
export async function sendOrderConfirmationWhatsApp(phone: string, details: {
  orderId: string;
  customerName?: string;
  totalAmount: number | string;
  itemSummary?: string;
}): Promise<boolean> {
  const greeting = details.customerName ? `Dear ${details.customerName},` : `Hello,`;
  const message = [
    `🎉 *Order Confirmed - Haus of India*`,
    ``,
    `${greeting}`,
    `Thank you for your purchase! We have received your order *#${details.orderId}*.`,
    ``,
    `💰 *Total Amount:* ₹${details.totalAmount}`,
    details.itemSummary ? `🛍️ *Items:* ${details.itemSummary}` : '',
    ``,
    `We are preparing your package and will notify you as soon as it is dispatched!`,
    ``,
    `Need help? Reply to this message.`
  ].filter(Boolean).join('\n');

  return sendWhatsAppMessage(phone, message);
}

/**
 * Helper: Send Shipping & Tracking WhatsApp
 */
export async function sendShippingUpdateWhatsApp(phone: string, details: {
  orderId: string;
  courierName?: string;
  trackingNumber: string;
  trackingUrl?: string;
}): Promise<boolean> {
  const courier = details.courierName ? ` via *${details.courierName}*` : '';
  const message = [
    `📦 *Order Dispatched - Haus of India*`,
    ``,
    `Great news! Your order *#${details.orderId}* has been shipped${courier}.`,
    ``,
    `🔍 *Tracking Number (AWB):* ${details.trackingNumber}`,
    details.trackingUrl ? `🌐 *Track Online:* ${details.trackingUrl}` : '',
    ``,
    `Thank you for shopping with us!`
  ].filter(Boolean).join('\n');

  return sendWhatsAppMessage(phone, message);
}
