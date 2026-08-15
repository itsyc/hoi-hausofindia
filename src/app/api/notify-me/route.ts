import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, phone } = body

    if (!email && !phone) {
      return NextResponse.json({ error: 'Please provide at least an email or phone number.' }, { status: 400 })
    }

    console.log('Lead notification signup:', { email, phone, timestamp: new Date().toISOString() })

    return NextResponse.json({ 
      success: true, 
      message: 'Thank you! We will notify you with launch updates and latest TV product releases.' 
    })
  } catch (error) {
    console.error('Notify me API error:', error)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
