import crypto from 'crypto'

export interface PayUInitiateParams {
  txnid: string
  amount: number
  productinfo: string
  firstname: string
  email: string
  phone: string
  udf1?: string
  udf2?: string
  udf3?: string
  udf4?: string
  udf5?: string
}

export function getPayUConfig() {
  const key = process.env.PAYU_MERCHANT_KEY || ''
  const salt = process.env.PAYU_MERCHANT_SALT || ''
  const env = (process.env.PAYU_ENV || 'TEST').toUpperCase()
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

  const actionUrl =
    env === 'PRODUCTION'
      ? 'https://secure.payu.in/_payment'
      : 'https://test.payu.in/_payment'

  return { key, salt, env, actionUrl, baseUrl }
}

/**
 * Generates SHA-512 hash for PayU Payment Request
 * Hash sequence: key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||salt
 */
export function generatePayUHash(params: PayUInitiateParams): string {
  const { key, salt } = getPayUConfig()
  const amountStr = params.amount.toFixed(2)

  const hashString = `${key}|${params.txnid}|${amountStr}|${params.productinfo}|${params.firstname}|${params.email}|${params.udf1 || ''}|${params.udf2 || ''}|${params.udf3 || ''}|${params.udf4 || ''}|${params.udf5 || ''}||||||${salt}`

  return crypto.createHash('sha512').update(hashString).digest('hex')
}

/**
 * Verifies reverse SHA-512 hash sent by PayU on payment response callback
 * Hash sequence: [additionalCharges|]salt|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key
 */
export function verifyPayUResponseHash(responseBody: Record<string, string>): boolean {
  const { key, salt } = getPayUConfig()

  const {
    status,
    txnid,
    amount,
    productinfo,
    firstname,
    email,
    udf1 = '',
    udf2 = '',
    udf3 = '',
    udf4 = '',
    udf5 = '',
    hash: receivedHash,
    additionalCharges
  } = responseBody

  if (!receivedHash) return false

  let hashSequence = `${salt}|${status}||||||${udf5}|${udf4}|${udf3}|${udf2}|${udf1}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`

  if (additionalCharges) {
    hashSequence = `${additionalCharges}|${hashSequence}`
  }

  const computedHash = crypto.createHash('sha512').update(hashSequence).digest('hex')

  return computedHash.toLowerCase() === receivedHash.toLowerCase()
}
