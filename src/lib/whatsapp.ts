/**
 * WhatsApp Helper Service powered by OpenWA Server (http://localhost:2785)
 */

const OPENWA_SERVER_URL = process.env.OPENWA_SERVER_URL || 'http://localhost:2785';
const OPENWA_API_KEY = process.env.OPENWA_API_KEY || '';

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
    
    const response = await fetch(`${OPENWA_SERVER_URL}/api/messages/sendText`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(OPENWA_API_KEY ? { 'Authorization': `Bearer ${OPENWA_API_KEY}` } : {})
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
    console.log(`[OpenWA Success] Message sent to ${chatId}:`, data.success || 'OK');
    return true;
  } catch (error) {
    console.error('[OpenWA Connection Failed]: Is OpenWA server running on port 2785?', error);
    // Return false instead of throwing so application flow isn't broken
    return false;
  }
}
