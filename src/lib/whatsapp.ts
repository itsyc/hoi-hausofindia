/**
 * WhatsApp Helper Service powered by OpenWA Gateway on Raspberry Pi
 */

const OPENWA_SERVER_URL = process.env.OPENWA_SERVER_URL || 'http://localhost:2785';
const OPENWA_API_KEY = process.env.OPENWA_API_KEY || 'hoi_openwa_secure_2026';
const OPENWA_SESSION_ID = process.env.OPENWA_SESSION_ID || 'default';

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
 * Send a WhatsApp text message using OpenWA REST API
 */
export async function sendWhatsAppMessage(phone: string, message: string): Promise<boolean> {
  try {
    const chatId = formatWhatsAppId(phone);
    const cleanBaseUrl = OPENWA_SERVER_URL.replace(/\/+$/, '');
    const endpoint = `${cleanBaseUrl}/api/sessions/${OPENWA_SESSION_ID}/messages/send-text`;
    
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
      return false;
    }

    const data = await response.json();
    console.log(`[OpenWA Success] Message sent to ${chatId}:`, data.id || 'OK');
    return true;
  } catch (error) {
    console.error('[OpenWA Connection Failed]: Is OpenWA server running and reachable?', error);
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
