// app/api/order/route.ts
import { NextRequest, NextResponse } from 'next/server'

interface OrderItem {
  name: string
  quantity: number
  price: number
}

interface ContactForm {
  name: string
  phone: string
  locationType: 'ub' | 'regional'
  // Улаанбаатар
  district: string
  khoroo: string
  building: string
  street: string
  door: string
  detail: string
  // Орон нутаг
  aimag: string
  sum: string
  regionalDetail: string
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const {
    items,
    totalPrice,
    deliveryFee,
    contact,
  }: {
    items: OrderItem[]
    totalPrice: number
    deliveryFee: number
    contact: ContactForm
  } = body

  const itemLines = items
    .map((i) => `• ${i.name} x${i.quantity} — ${(i.price * i.quantity).toLocaleString()}₮`)
    .join('\n')

  const address =
    contact.locationType === 'ub'
      ? `🏙️ Улаанбаатар
- Дүүрэг: ${contact.district}
- Хороо: ${contact.khoroo}
- Байр: ${contact.building || '—'}
- Гудамж: ${contact.street || '—'}
- Тоот: ${contact.door || '—'}
- Дэлгэрэнгүй: ${contact.detail || '—'}`
      : `🌄 Орон нутаг
- Аймаг: ${contact.aimag}
- Сум: ${contact.sum}
- Дэлгэрэнгүй: ${contact.regionalDetail || '—'}`

  const message = `
🛒 *Шинэ захиалга ирлээ\\!*

👤 *Нэр:* ${contact.name}
📞 *Утас:* ${contact.phone}

📍 *Хүргэлтийн хаяг:*
${address}

📦 *Захиалсан бараа:*
${itemLines}

💰 *Бараа:* ${(totalPrice - deliveryFee).toLocaleString()}₮

🚚 *Хүргэлт:* ${deliveryFee.toLocaleString()}₮

💰 *Нийт дүн:* ${totalPrice.toLocaleString()}₮

🕐 *Цаг:* ${new Date().toLocaleString('mn-MN', { timeZone: 'Asia/Ulaanbaatar' })}
  `.trim()

  const res = await fetch(
    `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown',
      }),
    }
  )

  if (!res.ok) {
    const errText = await res.text()
    console.error('Telegram error:', errText)
    return NextResponse.json({ error: 'Telegram error' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
