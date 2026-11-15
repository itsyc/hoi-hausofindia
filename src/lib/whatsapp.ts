/**
 * WhatsApp Helper Service powered by OpenWA Gateway on Raspberry Pi
 */

function sanitizeEnv(val: string | undefined, defaultVal: string): string {
  if (!val) return defaultVal;
  return val.trim().replace(/^["']+|["']+$/g, '').trim();
}

const OPENWA_SERVER_URL = sanitizeEnv(process.env.OPENWA_SERVER_URL, 'https://washstand-property-display.ngrok-free.dev');
const OPENWA_API_KEY = sanitizeEnv(process.env.OPENWA_API_KEY, 'owa_k1_3ddf3d2a10037d7a3ec4be29e97e20a63fe60dc9d91ae0025644dadcf853009e');
const CONFIGURED_SESSION_ID = sanitizeEnv(process.env.OPENWA_SESSION_ID, 'fccd62da-32e3-4779-bd48-ca4958625965');

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
  if (cachedSessionId) return sanitizeEnv(cachedSessionId, 'fccd62da-32e3-4779-bd48-ca4958625965');

  // If a valid UUID was provided in env, use that as primary candidate
  if (CONFIGURED_SESSION_ID && CONFIGURED_SESSION_ID !== 'default') {
    cachedSessionId = sanitizeEnv(CONFIGURED_SESSION_ID, 'fccd62da-32e3-4779-bd48-ca4958625965');
    return cachedSessionId;
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
        cachedSessionId = sanitizeEnv(readySession.id, 'fccd62da-32e3-4779-bd48-ca4958625965');
        return cachedSessionId;
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
    const cleanBaseUrl = sanitizeEnv(OPENWA_SERVER_URL, 'https://washstand-property-display.ngrok-free.dev').replace(/\/+$/, '');
    const cleanApiKey = sanitizeEnv(OPENWA_API_KEY, 'owa_k1_3ddf3d2a10037d7a3ec4be29e97e20a63fe60dc9d91ae0025644dadcf853009e');
    const sessionId = sanitizeEnv(await resolveSessionId(cleanBaseUrl, cleanApiKey), 'fccd62da-32e3-4779-bd48-ca4958625965');
    const endpoint = `${cleanBaseUrl}/api/sessions/${sessionId}/messages/send-text`;
    
    console.log(`[OpenWA] Sending message to ${chatId} via session ${sessionId}...`);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': cleanApiKey,
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
 * Helper: Send Admin Order Alert to Store Owner WhatsApp
 */
export async function sendAdminOrderNotification(details: {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  totalAmount: number;
  paymentMethod: string;
  items?: Array<{ title: string; quantity: number; size?: string | null; price: number }>;
  shippingAddress: string;
  city: string;
  state: string;
  pincode: string;
}): Promise<void> {
  const adminPhonesEnv = sanitizeEnv(process.env.ADMIN_WHATSAPP_PHONE, '9929247772,7339941812');
  const adminPhones = adminPhonesEnv
    .split(',')
    .map(p => p.trim())
    .filter(Boolean);

  if (adminPhones.length === 0) return;

  const itemLines = details.items && details.items.length > 0
    ? details.items.map(i => `• ${i.quantity}x ${i.title}${i.size ? ` (${i.size})` : ''} - ₹${(i.price * i.quantity).toLocaleString('en-IN')}`).join('\n')
    : 'No item details';

  const adminMsg = [
    `🚨 *NEW ORDER RECEIVED!*`,
    ``,
    `📋 *Order ID:* #${details.orderNumber}`,
    `💰 *Total Amount:* ₹${details.totalAmount.toLocaleString('en-IN')} (${details.paymentMethod})`,
    ``,
    `👤 *Customer:*`,
    `• Name: ${details.customerName}`,
    `• Phone: ${details.customerPhone}`,
    details.customerEmail ? `• Email: ${details.customerEmail}` : '',
    ``,
    `🛍️ *Items:*`,
    itemLines,
    ``,
    `📍 *Delivery Address:*`,
    `${details.shippingAddress}, ${details.city}, ${details.state} - ${details.pincode}`,
    ``,
    `🔗 *Admin Portal:*`,
    `${process.env.NEXT_PUBLIC_BASE_URL || 'https://hausofindia.com'}/admin/orders`
  ].filter(Boolean).join('\n');

  for (const phone of adminPhones) {
    try {
      await sendWhatsAppMessage(phone, adminMsg);
    } catch (err) {
      console.error(`[Admin WhatsApp Alert Failed for ${phone}]:`, err);
    }
  }
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
