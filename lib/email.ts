type EmailPayload = {
  to: string
  subject: string
  body: string
}

export async function sendEmail({ to, subject, body }: EmailPayload) {
  // 実際の送信の代わりに
  console.log('メール送信（開発モード）:', { to, subject, body })
  return { success: true }
}

export async function sendBookingConfirmation({
  to,
  name,
  menuName,
  staffName,
  startAt,
}: {
  to: string
  name: string
  menuName: string
  staffName: string
  startAt: Date
}) {
  const subject = '【Principal】ご予約を受け付けました'
  const body = `
${name} 様

以下の内容でご予約を受け付けました。

メニュー: ${menuName}
担当: ${staffName}
日時: ${startAt.toLocaleString('ja-JP')}

ご来店をお待ちしております。
Principal Nail Salon
  `.trim()

  return sendEmail({ to, subject, body })
}

export async function sendBookingCancellation({
  to,
  name,
  menuName,
  startAt,
}: {
  to: string
  name: string
  menuName: string
  startAt: Date
}) {
  const subject = '【Principal】予約キャンセルのお知らせ'
  const body = `
${name} 様

以下の予約をキャンセルしました。

メニュー: ${menuName}
日時: ${startAt.toLocaleString('ja-JP')}

またのご利用をお待ちしております。
Principal Nail Salon
  `.trim()

  return sendEmail({ to, subject, body })
}
